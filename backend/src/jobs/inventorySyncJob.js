const { PrismaClient } = require('@prisma/client');
const fishbowl = require('../services/fishbowlService');

const prisma = new PrismaClient();

let isSyncing = false;
let syncTimer = null;

/**
 * Synchronize inventory for all products in database from Fishbowl.
 * Uses AVAILABLE stock (On Hand - Allocated - Not Available) to prevent overselling.
 */
async function syncAllProductsInventory() {
  if (!fishbowl.isConfigured()) {
    return { success: false, message: 'Fishbowl is not configured in .env' };
  }

  if (isSyncing) {
    console.log('[Fishbowl Sync Job] Previous sync job still running, skipping this tick.');
    return { success: false, message: 'Job already in progress' };
  }

  isSyncing = true;
  const startTime = Date.now();

  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { sku: { not: null } },
          { fishbowlPartNumber: { not: null } },
        ],
      },
      select: {
        id: true,
        name: true,
        sku: true,
        fishbowlPartNumber: true,
        stock: true,
      },
    });

    if (!products.length) {
      isSyncing = false;
      return { success: true, updatedCount: 0, totalChecked: 0 };
    }

    const partNumbers = products
      .map((p) => p.fishbowlPartNumber || p.sku)
      .filter(Boolean);

    // Fast batch SQL query to Fishbowl
    const invMap = await fishbowl.getInventoryForParts(partNumbers);

    let updatedCount = 0;
    const updates = [];

    for (const prod of products) {
      const partNumber = (prod.fishbowlPartNumber || prod.sku)?.trim();
      if (!partNumber) continue;

      const inv = invMap.get(partNumber.toUpperCase());
      if (inv && typeof inv.available === 'number') {
        const liveAvailable = inv.available;
        if (liveAvailable !== prod.stock) {
          updates.push(
            prisma.product.update({
              where: { id: prod.id },
              data: { stock: liveAvailable },
            })
          );
          console.log(
            `[Fishbowl Sync Job] Stock updated for "${prod.name}" (${partNumber}): ${prod.stock} -> ${liveAvailable} (On Hand: ${inv.onHand}, Allocated: ${inv.allocated})`
          );
          updatedCount++;
        }
      }
    }

    if (updates.length > 0) {
      await prisma.$transaction(updates);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(
      `[Fishbowl Sync Job] Synced ${products.length} products in ${duration}s (${updatedCount} updated). Fishbowl Available Stock is active.`
    );

    return {
      success: true,
      totalChecked: products.length,
      updatedCount,
      durationSeconds: Number(duration),
    };
  } catch (err) {
    console.error('[Fishbowl Sync Job Error]:', err.message);
    return { success: false, error: err.message };
  } finally {
    isSyncing = false;
  }
}

/**
 * Starts the automatic background sync job.
 * Default interval: 5 minutes (configurable via FISHBOWL_SYNC_INTERVAL_MINUTES).
 */
function startInventorySyncJob() {
  if (!fishbowl.isConfigured()) {
    console.log('[Fishbowl Sync Job] Skipped: Fishbowl credentials missing in .env');
    return;
  }

  const intervalMinutes = Math.max(
    1,
    parseInt(process.env.FISHBOWL_SYNC_INTERVAL_MINUTES || '5', 10)
  );
  const intervalMs = intervalMinutes * 60 * 1000;

  console.log(
    `[Fishbowl Sync Job] Registered background inventory sync every ${intervalMinutes} minute(s).`
  );

  // Initial sync 15 seconds after boot (so DB connections & express server are fully ready)
  setTimeout(() => {
    console.log('[Fishbowl Sync Job] Running initial startup inventory sync...');
    syncAllProductsInventory().catch((err) =>
      console.warn('[Fishbowl Sync Job] Initial run warning:', err.message)
    );
  }, 15000);

  // Periodic recurring background sync
  syncTimer = setInterval(() => {
    syncAllProductsInventory().catch((err) =>
      console.warn('[Fishbowl Sync Job] Recurring run warning:', err.message)
    );
  }, intervalMs);

  if (syncTimer.unref) {
    syncTimer.unref(); // Don't hold Node process open on graceful shutdown
  }
}

function stopInventorySyncJob() {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
  }
}

module.exports = {
  syncAllProductsInventory,
  startInventorySyncJob,
  stopInventorySyncJob,
};

