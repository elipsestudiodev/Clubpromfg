const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true, // true for port 465 (SSL)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"GreenGrass" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}: ${info.messageId}`);
  } catch (err) {
    console.error(`Email send failed to ${to}:`, err.message);
    throw err;
  }
};

const sendNormalEmail = async (to, subject, html) => {
  return sendEmail({ to, subject, html });
};

// utils/sendResetEmail.js
// const { sendNormalEmail } = require("./sendEmail"); // your existing file

const sendResetEmail = async (to, code) => {
  const subject = "Your Password Reset Code";
  const html = `
    <div style="font-family: sans-serif; line-height: 1.5;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>We received a request to reset your password. Use the code below to reset it:</p>
      <p style="font-size: 1.5rem; font-weight: bold; color: #f9c821;">${code}</p>
      <p>This code will expire in 10 minutes.</p>
      <hr />
      <p>If you didn't request a password reset, you can ignore this email.</p>
    </div>
  `;

  return sendNormalEmail(to, subject, html);
};

const sendOrderConfirmationEmail = async ({
  order,
  customer,
  items,
  shippingAddress = {},
  billingAddress = {},
  transactionId,
}) => {
  const recipientEmail = order.shipEmail || customer?.email;
  if (!recipientEmail) {
    console.warn("[Email Warning] No recipient email found for order confirmation", order.id);
    return;
  }

  const recipientName = order.shipFirstName
    ? `${order.shipFirstName} ${order.shipLastName || ""}`.trim()
    : customer?.fullName || "Valued Customer";

  const carrier = order.carrier || shippingAddress.carrier || "FedEx";
  const serviceLevel = order.serviceLevel || shippingAddress.shippingServiceName || "Ground";
  const totalAmount = Number(order.totalAmount || 0).toFixed(2);
  const shipmentCost = Number(order.shipmentCost || 0).toFixed(2);
  const subtotal = (Number(totalAmount) - Number(shipmentCost)).toFixed(2);

  const itemsHtml = (items || []).map((item) => {
    const name = item.name || item.product?.name || `Item #${item.id || item.productId}`;
    const qty = item.qty || item.quantity || 1;
    const price = Number(item.price || item.priceAtOrder || 0).toFixed(2);
    const lineTotal = (Number(price) * Number(qty)).toFixed(2);

    return `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #222;">
          <div style="font-weight: 600; font-size: 14px;">${name}</div>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: center; color: #666; font-size: 14px;">
          ${qty}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right; color: #666; font-size: 14px;">
          $${price}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: 600; color: #111; font-size: 14px;">
          $${lineTotal}
        </td>
      </tr>
    `;
  }).join("");

  const shipStreet = order.shipAddress1 || shippingAddress.address1 || customer?.commercialStreet || customer?.billingStreet || "";
  const shipCity = order.shipCity || shippingAddress.city || customer?.commercialCity || customer?.billingCity || "";
  const shipState = order.shipState || shippingAddress.state || customer?.commercialState || customer?.billingState || "";
  const shipZip = order.shipZip || shippingAddress.zip || customer?.commercialZip || customer?.billingZip || "";
  const shipCountry = order.shipCountry || shippingAddress.country || customer?.commercialCountry || "US";

  const billName = billingAddress.firstName ? `${billingAddress.firstName} ${billingAddress.lastName || ""}`.trim() : recipientName;
  const billStreet = billingAddress.address1 || customer?.billingStreet || shipStreet;
  const billCity = billingAddress.city || customer?.billingCity || shipCity;
  const billState = billingAddress.state || customer?.billingState || shipState;
  const billZip = billingAddress.zip || customer?.billingZip || shipZip;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
      <!-- Header -->
      <div style="background: #111111; padding: 32px 24px; text-align: center;">
        <h1 style="color: #f9c821; margin: 0; font-size: 26px; letter-spacing: 1.5px; font-weight: 800; text-transform: uppercase;">CLUB PRO MFG</h1>
        <p style="color: #ffffff; margin: 8px 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 2px;">Order Confirmation</p>
      </div>

      <!-- Main Body -->
      <div style="padding: 32px 28px;">
        <div style="text-align: center; margin-bottom: 28px;">
          <div style="display: inline-block; background: #ecfdf5; color: #059669; font-weight: 700; font-size: 12px; padding: 6px 14px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; border: 1px solid #a7f3d0;">
            ✓ Payment Confirmed
          </div>
          <h2 style="font-size: 22px; color: #111827; margin: 0 0 6px 0; font-weight: 700;">Thank You for Your Order!</h2>
          <p style="font-size: 14px; color: #6b7280; margin: 0;">We've received your order and are currently preparing it for shipment.</p>
        </div>

        <!-- Order Metadata Box -->
        <div style="background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px; padding: 18px 20px; margin-bottom: 28px;">
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; font-size: 13px;">
            <div>
              <span style="color: #6b7280; display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Order Number</span>
              <strong style="color: #111827; font-size: 15px;">#${order.id}</strong>
            </div>
            <div>
              <span style="color: #6b7280; display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Order Date</span>
              <strong style="color: #111827;">${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</strong>
            </div>
            <div>
              <span style="color: #6b7280; display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Shipping Carrier</span>
              <strong style="color: #111827;">${carrier} (${serviceLevel})</strong>
            </div>
            <div>
              <span style="color: #6b7280; display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Payment Method</span>
              <strong style="color: #111827;">Credit Card</strong>
            </div>
          </div>
          ${transactionId ? `
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #e5e7eb; font-size: 12px; color: #6b7280;">
              <span>Transaction ID: </span><code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-family: monospace; color: #111;">${transactionId}</code>
            </div>
          ` : ""}
        </div>

        <!-- Order Items -->
        <h3 style="font-size: 15px; color: #111827; margin: 0 0 14px 0; font-weight: 700; border-bottom: 2px solid #f9c821; padding-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
          Items Ordered
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="color: #9ca3af; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; border-bottom: 1px solid #e5e7eb;">
              <th style="text-align: left; padding-bottom: 8px;">Product</th>
              <th style="text-align: center; padding-bottom: 8px;">Qty</th>
              <th style="text-align: right; padding-bottom: 8px;">Price</th>
              <th style="text-align: right; padding-bottom: 8px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Totals -->
        <div style="margin-left: auto; max-width: 260px; font-size: 14px; margin-bottom: 30px;">
          <div style="display: flex; justify-content: space-between; padding: 6px 0; color: #4b5563;">
            <span>Subtotal:</span>
            <span>$${subtotal}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 6px 0; color: #4b5563;">
            <span>Shipping (${carrier}):</span>
            <span>$${shipmentCost}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 16px; font-weight: 700; color: #111827; border-top: 2px solid #111827; margin-top: 4px;">
            <span>Total Paid:</span>
            <span style="color: #059669;">$${totalAmount}</span>
          </div>
        </div>

        <!-- Addresses -->
        <div style="display: flex; flex-wrap: wrap; gap: 20px; border-top: 1px solid #e5e7eb; padding-top: 24px; margin-bottom: 28px;">
          <div style="flex: 1; min-width: 220px; font-size: 13px; color: #4b5563; line-height: 1.6;">
            <strong style="color: #111827; display: block; font-size: 14px; margin-bottom: 6px;">Shipping Address</strong>
            <div>${recipientName}</div>
            <div>${shipStreet}</div>
            <div>${shipCity ? `${shipCity}, ` : ""}${shipState} ${shipZip}</div>
            <div>${shipCountry}</div>
          </div>
          <div style="flex: 1; min-width: 220px; font-size: 13px; color: #4b5563; line-height: 1.6;">
            <strong style="color: #111827; display: block; font-size: 14px; margin-bottom: 6px;">Billing Address</strong>
            <div>${billName}</div>
            <div>${billStreet}</div>
            <div>${billCity ? `${billCity}, ` : ""}${billState} ${billZip}</div>
          </div>
        </div>

        <!-- What to Expect Next -->
        <div style="background: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 18px 20px; font-size: 13px; color: #854d0e; line-height: 1.6;">
          <strong style="display: block; font-size: 14px; margin-bottom: 4px; color: #713f12;">📦 What happens next?</strong>
          Our warehouse team is picking, inspecting, and packaging your order. As soon as your shipment is picked up by <strong>${carrier}</strong>, we will send you a shipment email with your official <strong>Tracking Number</strong> and real-time tracking link.
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #f9fafb; padding: 20px 24px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0 0 4px 0;">Club Pro Manufacturing USA &bull; High Quality Golf Cart Enclosures & Accessories</p>
        <p style="margin: 0;">Need help with your order? Contact us at <a href="mailto:greengrass@elipsestudio.info" style="color: #111827; font-weight: 600;">greengrass@elipsestudio.info</a></p>
      </div>
    </div>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: `Order Confirmation: ClubPro Order #${order.id}`,
    html,
  });
};

const sendOrderShippedEmail = async ({
  order,
  trackingNumber,
  carrier,
}) => {
  const recipientEmail = order.shipEmail || order.customer?.email;
  if (!recipientEmail) {
    console.warn("[Email Warning] No recipient email found for shipping notification", order.id);
    return;
  }

  const recipientName = order.shipFirstName
    ? `${order.shipFirstName} ${order.shipLastName || ""}`.trim()
    : order.customer?.fullName || "Valued Customer";

  const cleanTracking = String(trackingNumber || "").trim();
  const detectedCarrier = (carrier || order.carrier || (cleanTracking.toUpperCase().startsWith("1Z") ? "UPS" : "FedEx")).toUpperCase();
  const isFedEx = detectedCarrier.includes("FEDEX");

  const trackingUrl = cleanTracking
    ? (isFedEx
        ? `https://www.fedex.com/fedextrack/?trknbr=${cleanTracking}`
        : `https://www.ups.com/track?tracknum=${cleanTracking}`)
    : "#";

  const itemsHtml = (order.items || []).map((i) => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #333; font-size: 13px;">${i.product?.name || "Product"}</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; text-align: center; color: #666; font-size: 13px;">${i.quantity}</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: 600; color: #111; font-size: 13px;">$${Number(i.priceAtOrder).toFixed(2)}</td>
    </tr>
  `).join("");

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #eaeaea; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="background: #111111; padding: 28px 24px; text-align: center;">
        <h1 style="color: #f9c821; margin: 0; font-size: 24px; letter-spacing: 1px; font-weight: 800; text-transform: uppercase;">CLUB PRO MFG</h1>
        <p style="color: #ffffff; margin: 6px 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 2px;">Your Order Has Shipped!</p>
      </div>
      
      <div style="padding: 32px 24px;">
        <p style="font-size: 16px; color: #222; margin-top: 0;">Hi <strong>${recipientName}</strong>,</p>
        <p style="font-size: 14px; color: #555; line-height: 1.6;">
          Great news! Your order <strong>#${order.id}</strong> has been fulfilled and shipped via <strong>${isFedEx ? "FedEx" : "UPS"}</strong>.
        </p>

        <div style="background: #fbfbfb; border: 1px solid #eee; border-radius: 8px; padding: 22px; margin: 24px 0; text-align: center;">
          <div style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Carrier &amp; Tracking Number</div>
          <div style="font-size: 18px; font-weight: 700; color: #111; font-family: monospace; letter-spacing: 1px; margin-bottom: 16px;">
            ${cleanTracking || "Tracking details updating soon"}
          </div>
          ${cleanTracking ? `
            <a href="${trackingUrl}" target="_blank" style="display: inline-block; background: #f9c821; color: #111; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 6px; text-decoration: none; box-shadow: 0 2px 4px rgba(0,0,0,0.08);">
              Track Your Package &rarr;
            </a>
          ` : `
            <span style="font-size: 13px; color: #666;">Carrier scan in progress</span>
          `}
        </div>

        <h3 style="font-size: 15px; color: #111; margin-bottom: 12px; border-bottom: 2px solid #f9c821; padding-bottom: 6px;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="color: #888; text-transform: uppercase; font-size: 11px;">
              <th style="text-align: left; padding-bottom: 8px;">Item</th>
              <th style="text-align: center; padding-bottom: 8px;">Qty</th>
              <th style="text-align: right; padding-bottom: 8px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; font-size: 13px; color: #666; line-height: 1.6;">
          <strong>Delivering To:</strong><br />
          ${order.shipAddress1 || ""}<br />
          ${order.shipCity ? `${order.shipCity}, ` : ""}${order.shipState || ""} ${order.shipZip || ""}<br />
          ${order.shipCountry || "US"}
        </div>
      </div>

      <div style="background: #f7f7f7; padding: 18px 24px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee;">
        Questions? Contact us at <a href="mailto:greengrass@elipsestudio.info" style="color: #111;">greengrass@elipsestudio.info</a>
      </div>
    </div>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: `Your ClubPro Order #${order.id} Has Shipped! ${cleanTracking ? `(Tracking: ${cleanTracking})` : ""}`,
    html,
  });
};

module.exports = {
  sendEmail,
  sendNormalEmail,
  sendResetEmail,
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
};
