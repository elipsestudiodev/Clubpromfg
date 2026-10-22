const axios = require("axios");
const crypto = require("crypto");

// Sends the finalized order payload to ClubPro's (Larimar Logistics WMS) webhook,
// signed with HMAC-SHA256 as agreed with the client.
async function sendClubProOrderWebhook(payload) {
  const url = process.env.CLUBPRO_WEBHOOK_URL;
  const secret = process.env.CLUBPRO_WEBHOOK_SECRET;

  console.log("\n========== [CLUBPRO WEBHOOK] Sending order ==========");

  if (!url || !secret) {
    console.error("[ClubPro Webhook] Skipped: CLUBPRO_WEBHOOK_URL / CLUBPRO_WEBHOOK_SECRET missing in .env");
    return;
  }

  // Sign the exact same string we send as the body
  const rawBody = JSON.stringify(payload);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  console.log("URL:", url);
  console.log("Payload:\n", JSON.stringify(payload, null, 2));
  console.log("x-clubpro-timestamp:", timestamp);
  console.log("x-clubpro-signature:", signature);

  try {
    const res = await axios.post(url, rawBody, {
      headers: {
        "Content-Type": "application/json",
        "x-clubpro-signature": signature,
        "x-clubpro-timestamp": timestamp,
      },
    });
    console.log("[ClubPro Webhook] Response:", res.status, JSON.stringify(res.data));
  } catch (err) {
    console.error(
      "[ClubPro Webhook] Failed:",
      err.response?.status,
      err.response?.data || err.message
    );
  }

  console.log("========== [CLUBPRO WEBHOOK] End ==========\n");
}

module.exports = { sendClubProOrderWebhook };
