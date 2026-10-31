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
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6; padding: 30px 10px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
              <!-- Header -->
              <tr>
                <td align="center" style="background-color: #111111; padding: 32px 24px;">
                  <h1 style="color: #f9c821; margin: 0; font-size: 26px; letter-spacing: 1.5px; font-weight: 800; text-transform: uppercase;">CLUB PRO MFG</h1>
                  <p style="color: #ffffff; margin: 8px 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 2px;">Order Confirmation</p>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="padding: 32px 28px;">
                  <!-- Confirmation Banner -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                    <tr>
                      <td align="center">
                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
                          <tr>
                            <td style="background-color: #ecfdf5; color: #059669; font-weight: 700; font-size: 12px; padding: 6px 16px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; border: 1px solid #a7f3d0;">
                              ✓ Payment Confirmed
                            </td>
                          </tr>
                        </table>
                        <h2 style="font-size: 22px; color: #111827; margin: 0 0 6px 0; font-weight: 700;">Thank You for Your Order!</h2>
                        <p style="font-size: 14px; color: #6b7280; margin: 0;">We've received your order and are currently preparing it for shipment.</p>
                      </td>
                    </tr>
                  </table>

                  <!-- Order Metadata Box (Table-based for bulletproof Gmail support) -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 28px;">
                    <tr>
                      <td style="padding: 16px 20px;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td width="25%" valign="top" style="padding: 4px 8px 4px 0;">
                              <span style="color: #6b7280; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Order Number</span>
                              <strong style="color: #111827; font-size: 15px;">#${order.id}</strong>
                            </td>
                            <td width="25%" valign="top" style="padding: 4px 8px;">
                              <span style="color: #6b7280; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Order Date</span>
                              <strong style="color: #111827; font-size: 13px;">${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</strong>
                            </td>
                            <td width="28%" valign="top" style="padding: 4px 8px;">
                              <span style="color: #6b7280; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Carrier</span>
                              <strong style="color: #111827; font-size: 13px;">${carrier}</strong>
                            </td>
                            <td width="22%" valign="top" style="padding: 4px 0 4px 8px;">
                              <span style="color: #6b7280; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Payment</span>
                              <strong style="color: #059669; font-size: 13px;">Credit Card</strong>
                            </td>
                          </tr>
                          ${transactionId ? `
                            <tr>
                              <td colspan="4" style="padding-top: 12px; margin-top: 8px; border-top: 1px dashed #e5e7eb; font-size: 12px; color: #6b7280;">
                                <span>Transaction ID: </span><code style="background-color: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-family: monospace; color: #111;">${transactionId}</code>
                              </td>
                            </tr>
                          ` : ""}
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Order Items -->
                  <h3 style="font-size: 14px; color: #111827; margin: 0 0 12px 0; font-weight: 700; border-bottom: 2px solid #f9c821; padding-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
                    Items Ordered
                  </h3>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                    <thead>
                      <tr style="color: #9ca3af; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; border-bottom: 1px solid #e5e7eb;">
                        <th align="left" style="padding-bottom: 8px;">Product</th>
                        <th align="center" style="padding-bottom: 8px;">Qty</th>
                        <th align="right" style="padding-bottom: 8px;">Price</th>
                        <th align="right" style="padding-bottom: 8px;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>

                  <!-- Financial Totals Table -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px;">
                    <tr>
                      <td align="right">
                        <table width="280" cellpadding="4" cellspacing="0" border="0" style="font-size: 14px;">
                          <tr>
                            <td align="left" style="color: #6b7280;">Subtotal:</td>
                            <td align="right" style="color: #111827; font-weight: 500;">$${subtotal}</td>
                          </tr>
                          <tr>
                            <td align="left" style="color: #6b7280;">Shipping (${carrier}):</td>
                            <td align="right" style="color: #111827; font-weight: 500;">$${shipmentCost}</td>
                          </tr>
                          <tr>
                            <td colspan="2" style="padding: 0;"><div style="border-top: 2px solid #111827; margin: 6px 0;"></div></td>
                          </tr>
                          <tr>
                            <td align="left" style="font-size: 16px; font-weight: 700; color: #111827;">Total Paid:</td>
                            <td align="right" style="font-size: 16px; font-weight: 700; color: #059669;">$${totalAmount}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Addresses Table -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-bottom: 28px;">
                    <tr>
                      <td width="50%" valign="top" style="font-size: 13px; color: #4b5563; line-height: 1.6; padding-right: 15px;">
                        <strong style="color: #111827; display: block; font-size: 14px; margin-bottom: 6px;">Shipping Address</strong>
                        <div>${recipientName}</div>
                        <div>${shipStreet}</div>
                        <div>${shipCity ? `${shipCity}, ` : ""}${shipState} ${shipZip}</div>
                        <div>${shipCountry}</div>
                      </td>
                      <td width="50%" valign="top" style="font-size: 13px; color: #4b5563; line-height: 1.6; padding-left: 15px;">
                        <strong style="color: #111827; display: block; font-size: 14px; margin-bottom: 6px;">Billing Address</strong>
                        <div>${billName}</div>
                        <div>${billStreet}</div>
                        <div>${billCity ? `${billCity}, ` : ""}${billState} ${billZip}</div>
                        <div>${shipCountry}</div>
                      </td>
                    </tr>
                  </table>

                  <!-- What to Expect Next -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 8px;">
                    <tr>
                      <td style="padding: 16px 20px; font-size: 13px; color: #854d0e; line-height: 1.6;">
                        <strong style="display: block; font-size: 14px; margin-bottom: 4px; color: #713f12;">📦 What happens next?</strong>
                        Our warehouse team is picking, inspecting, and packaging your order. As soon as your shipment is picked up by <strong>${carrier}</strong>, we will send you a shipment email with your official <strong>Tracking Number</strong> and real-time tracking link.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td align="center" style="background-color: #f9fafb; padding: 20px 24px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 4px 0;">Club Pro Manufacturing USA &bull; High Quality Golf Cart Enclosures & Accessories</p>
                  <p style="margin: 0;">Need help with your order? Contact us at <a href="mailto:greengrass@elipsestudio.info" style="color: #111827; font-weight: 600;">greengrass@elipsestudio.info</a></p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
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
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Order Has Shipped!</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6; padding: 30px 10px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
              <!-- Header -->
              <tr>
                <td align="center" style="background-color: #111111; padding: 32px 24px;">
                  <h1 style="color: #f9c821; margin: 0; font-size: 26px; letter-spacing: 1.5px; font-weight: 800; text-transform: uppercase;">CLUB PRO MFG</h1>
                  <p style="color: #ffffff; margin: 8px 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 2px;">Your Order Has Shipped!</p>
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 32px 28px;">
                  <p style="font-size: 16px; color: #111827; margin: 0 0 10px 0;">Hi <strong>${recipientName}</strong>,</p>
                  <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin: 0 0 24px 0;">
                    Great news! Your order <strong>#${order.id}</strong> has been fulfilled by our warehouse and dispatched via <strong>${isFedEx ? "FedEx" : "UPS"}</strong>.
                  </p>

                  <!-- Tracking Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 10px; margin-bottom: 28px;">
                    <tr>
                      <td align="center" style="padding: 24px 20px;">
                        <span style="font-size: 11px; font-weight: 700; color: #854d0e; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">
                          Carrier &amp; Tracking Number
                        </span>
                        <div style="font-size: 20px; font-weight: 800; color: #111827; font-family: monospace; letter-spacing: 1px; margin-bottom: 16px;">
                          ${cleanTracking || "Tracking details updating soon"}
                        </div>
                        ${cleanTracking ? `
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td align="center" style="background-color: #f9c821; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <a href="${trackingUrl}" target="_blank" style="display: inline-block; padding: 12px 32px; font-size: 14px; font-weight: 700; color: #111111; text-decoration: none; text-transform: uppercase; letter-spacing: 0.5px;">
                                  Track Your Package &rarr;
                                </a>
                              </td>
                            </tr>
                          </table>
                        ` : `
                          <span style="font-size: 13px; color: #6b7280;">Carrier pickup in progress</span>
                        `}
                      </td>
                    </tr>
                  </table>

                  <!-- Order Summary -->
                  <h3 style="font-size: 14px; color: #111827; margin: 0 0 12px 0; font-weight: 700; border-bottom: 2px solid #f9c821; padding-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
                    Items Shipped
                  </h3>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; margin-bottom: 24px;">
                    <thead>
                      <tr style="color: #9ca3af; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; border-bottom: 1px solid #e5e7eb;">
                        <th align="left" style="padding-bottom: 8px;">Item</th>
                        <th align="center" style="padding-bottom: 8px;">Qty</th>
                        <th align="right" style="padding-bottom: 8px;">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>

                  <!-- Delivery Address -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #e5e7eb; padding-top: 18px; font-size: 13px; color: #4b5563; line-height: 1.6;">
                    <tr>
                      <td>
                        <strong style="color: #111827; display: block; font-size: 13px; margin-bottom: 4px;">Delivering To:</strong>
                        <div>${recipientName}</div>
                        <div>${order.shipAddress1 || ""}</div>
                        ${order.shipAddress2 ? `<div>${order.shipAddress2}</div>` : ""}
                        <div>${order.shipCity ? `${order.shipCity}, ` : ""}${order.shipState || ""} ${order.shipZip || ""}</div>
                        <div>${order.shipCountry || "US"}</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td align="center" style="background-color: #f9fafb; padding: 20px 24px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 4px 0;">Club Pro Manufacturing USA &bull; High Quality Golf Cart Enclosures & Accessories</p>
                  <p style="margin: 0;">Questions? Contact us at <a href="mailto:greengrass@elipsestudio.info" style="color: #111827; font-weight: 600;">greengrass@elipsestudio.info</a></p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
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
