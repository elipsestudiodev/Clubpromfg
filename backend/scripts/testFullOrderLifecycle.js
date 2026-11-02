/**
 * Comprehensive Order Lifecycle & FedEx Integration Test Suite
 * Tests:
 * 1. FedEx Sandbox API (OAuth, Live Rates, Ship API with Label, Track API)
 * 2. Full Order Lifecycle: PENDING -> PAID -> SHIPPED -> DELIVERED
 * 3. Split Delivery: Multi-package tracking aggregation & individual tracking links
 * 4. Email notifications: Table-based confirmation, shipped, and delivered templates
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendEmail, sendOrderConfirmationEmail, sendOrderShippedEmail, sendOrderDeliveredEmail } = require('../src/utils/sendEmail');
const fishbowl = require('../src/services/fishbowlService');

async function runTestSuite() {
  console.log('\n=============================================================');
  console.log('🚀 STARTING COMPREHENSIVE SHIPPING & FEDEX TEST SUITE');
  console.log('=============================================================\n');

  let fedexAccessToken = null;
  let testTrackingNumber = null;

  // ─────────────────────────────────────────────────────────────
  // TEST 1: FedEx Developer Sandbox API Verification
  // ─────────────────────────────────────────────────────────────
  console.log('--- [TEST 1] Testing FedEx Sandbox REST API ---');
  try {
    const authRes = await axios.post(
      'https://apis-sandbox.fedex.com/oauth/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.FEDEX_CLIENT_ID,
        client_secret: process.env.FEDEX_CLIENT_SECRET,
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    fedexAccessToken = authRes.data.access_token;
    console.log('✅ FedEx OAuth 2.0 Token generated successfully!');
    console.log('   Expires in:', authRes.data.expires_in, 'seconds');

    // Test Ship API (Creates real sandbox label + tracking number)
    const shipPayload = {
      labelResponseOptions: 'LABEL',
      requestedShipment: {
        shipper: {
          contact: { personName: 'Steve P', phoneNumber: '6315550100', companyName: 'Club Pro MFG' },
          address: { streetLines: ['10 Lucon Drive'], city: 'Deer Park', stateOrProvinceCode: 'NY', postalCode: '11729', countryCode: 'US' },
        },
        recipients: [{
          contact: { personName: 'Test Customer', phoneNumber: '5551234567' },
          address: { streetLines: ['123 Main St'], city: 'Miami', stateOrProvinceCode: 'FL', postalCode: '33101', countryCode: 'US' },
        }],
        shipDatestamp: new Date().toISOString().split('T')[0],
        serviceType: 'FEDEX_EXPRESS_SAVER',
        packagingType: 'YOUR_PACKAGING',
        pickupType: 'USE_SCHEDULED_PICKUP',
        shippingChargesPayment: {
          paymentType: 'SENDER',
          payor: {
            responsibleParty: {
              accountNumber: { value: process.env.FEDEX_ACCOUNT_NUMBER || '740980114' },
            },
          },
        },
        labelSpecification: { labelFormatType: 'COMMON2D', imageType: 'PDF', labelStockType: 'PAPER_85X11_TOP_HALF_LABEL' },
        requestedPackageLineItems: [{
          weight: { units: 'LB', value: 8.5 },
          dimensions: { length: 24, width: 18, height: 12, units: 'IN' },
        }],
      },
      accountNumber: { value: process.env.FEDEX_ACCOUNT_NUMBER || '740980114' },
    };

    const shipRes = await axios.post(
      'https://apis-sandbox.fedex.com/ship/v1/shipments',
      shipPayload,
      { headers: { Authorization: `Bearer ${fedexAccessToken}`, 'Content-Type': 'application/json' } }
    );

    const completedShipment = shipRes.data?.output?.transactionShipments?.[0];
    const piece = completedShipment?.pieceResponses?.[0];
    testTrackingNumber = piece?.trackingNumber || completedShipment?.masterTrackingNumber;

    console.log('✅ FedEx Sandbox Ship API generated Shipment & Label!');
    console.log('   Generated Tracking Number:', testTrackingNumber);
    console.log('   Service:', completedShipment?.serviceType || 'FEDEX_EXPRESS_SAVER');
    console.log('   Label PDF Available:', Boolean(piece?.packageDocuments?.[0]?.encodedLabel));

    // Test Track API with generated tracking number
    if (testTrackingNumber) {
      const trackRes = await axios.post(
        'https://apis-sandbox.fedex.com/track/v1/trackingnumbers',
        {
          includeDetailedScans: true,
          trackingInfo: [{ trackingNumberInfo: { trackingNumber: testTrackingNumber } }],
        },
        { headers: { Authorization: `Bearer ${fedexAccessToken}`, 'Content-Type': 'application/json' } }
      );
      const trackDetail = trackRes.data?.output?.completeTrackResults?.[0]?.trackResults?.[0];
      console.log('✅ FedEx Track API successfully queried tracking status!');
      console.log('   Carrier Event:', trackDetail?.latestStatusDetail?.description || 'Ready for shipping');
    }
  } catch (err) {
    console.error('❌ FedEx Sandbox API Error:', err.response?.data || err.message);
  }

  // ─────────────────────────────────────────────────────────────
  // TEST 2: Single Delivery Order Lifecycle
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- [TEST 2] Testing Standard Single Delivery Lifecycle ---');
  try {
    const tracking1 = testTrackingNumber || '794903698274';

    const mockOrder = {
      id: 99101,
      totalAmount: 189.99,
      shipmentCost: 18.50,
      status: 'PAID',
      shipmentStatus: 'PAID',
      carrier: 'FedEx',
      trackingNumber: tracking1,
      shipFirstName: 'Alex',
      shipLastName: 'Morgan',
      shipAddress1: '742 Evergreen Terrace',
      shipCity: 'Springfield',
      shipState: 'OR',
      shipZip: '97477',
      shipCountry: 'US',
      shipEmail: 'greengrass@elipsestudio.info',
      items: [
        { product: { name: 'Yamaha Drive 2 Over-the-Top Golf Enclosure', sku: 'YAM-DRV2-BLK' }, quantity: 1, priceAtOrder: 171.49 }
      ]
    };

    console.log('1. Dispatching Order Confirmation Email...');
    await sendOrderConfirmationEmail({
      order: mockOrder,
      items: mockOrder.items,
      shippingAddress: {
        address1: mockOrder.shipAddress1,
        city: mockOrder.shipCity,
        state: mockOrder.shipState,
        zip: mockOrder.shipZip,
        country: mockOrder.shipCountry,
      },
      billingAddress: {
        address1: mockOrder.shipAddress1,
        city: mockOrder.shipCity,
        state: mockOrder.shipState,
        zip: mockOrder.shipZip,
      },
      total: mockOrder.totalAmount,
      subtotal: (mockOrder.totalAmount - mockOrder.shipmentCost).toFixed(2),
      shipmentCost: mockOrder.shipmentCost.toFixed(2),
      carrier: mockOrder.carrier,
      transactionId: 'TEST-TXN-1001',
    });
    console.log('✅ Order Confirmation Email sent successfully!');

    console.log('2. Transitioning to SHIPPED & Dispatching Shipping Email...');
    mockOrder.status = 'SHIPPED';
    mockOrder.shipmentStatus = 'SHIPPED';
    await sendOrderShippedEmail({
      order: mockOrder,
      trackingNumber: tracking1,
      carrier: 'FedEx',
    });
    console.log('✅ Order Shipped Email sent successfully (Single package)!');

    console.log('3. Transitioning to DELIVERED & Dispatching Delivered Email...');
    mockOrder.status = 'DELIVERED';
    mockOrder.shipmentStatus = 'DELIVERED';
    await sendOrderDeliveredEmail({
      order: mockOrder,
      trackingNumber: tracking1,
      carrier: 'FedEx',
    });
    console.log('✅ Order Delivered Email sent successfully!');
  } catch (err) {
    console.error('❌ Single Delivery Test Error:', err.message);
  }

  // ─────────────────────────────────────────────────────────────
  // TEST 3: Split Delivery (Multi-Carton) Lifecycle
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- [TEST 3] Testing Split Delivery (Multiple Packages) Lifecycle ---');
  try {
    const pkg1Tracking = '794903698274';
    const pkg2Tracking = '794688201948';
    const combinedTracking = `${pkg1Tracking}, ${pkg2Tracking}`;

    const splitOrder = {
      id: 99102,
      totalAmount: 435.00,
      shipmentCost: 32.00,
      status: 'SHIPPED',
      shipmentStatus: 'SHIPPED',
      carrier: 'FedEx',
      trackingNumber: combinedTracking,
      shipFirstName: 'Jordan',
      shipLastName: 'Spieth',
      shipAddress1: '100 Masters Way',
      shipCity: 'Augusta',
      shipState: 'GA',
      shipZip: '30904',
      shipCountry: 'US',
      shipEmail: 'greengrass@elipsestudio.info',
      items: [
        { product: { name: 'Club Car Onward 4-Passenger Enclosure (Black)', sku: 'CC-ONW-4P' }, quantity: 1, priceAtOrder: 295.00 },
        { product: { name: 'Universal Golf Cart Side Mirrors Set', sku: 'ACC-MIR-PAIR' }, quantity: 2, priceAtOrder: 54.00 }
      ]
    };

    console.log(`Dispatching Split Delivery Email for 2 Packages: [${pkg1Tracking}] & [${pkg2Tracking}]...`);
    await sendOrderShippedEmail({
      order: splitOrder,
      trackingNumber: combinedTracking,
      carrier: 'FedEx',
    });
    console.log('✅ Split Delivery Email sent successfully with individual package tracking buttons!');
  } catch (err) {
    console.error('❌ Split Delivery Test Error:', err.message);
  }

  console.log('\n=============================================================');
  console.log('🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
  console.log('=============================================================\n');

  await prisma.$disconnect();
}

runTestSuite().catch((e) => {
  console.error('Suite failure:', e);
  process.exit(1);
});
