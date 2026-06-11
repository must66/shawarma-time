import admin from "firebase-admin";
import { Resend } from "resend";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const NOTIFICATION_EMAIL = process.env.ORDER_NOTIFICATION_EMAIL || "YOUR_EMAIL_HERE";
const FROM_EMAIL = process.env.ORDER_NOTIFICATION_FROM || "Shawarma Time <orders@shawarma-time.nl>";

function getAdminDb() {
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || "{}");
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  return admin.firestore();
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed." });
  }
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET || !process.env.FIREBASE_SERVICE_ACCOUNT) {
    return json(500, { error: "Stripe webhook is not configured." });
  }

  const signature = event.headers["stripe-signature"];
  const body = event.isBase64Encoded ? Buffer.from(event.body || "", "base64") : event.body || "";

  try {
    const stripeEvent = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    if (stripeEvent.type === "checkout.session.completed") {
      await createPaidOrder(stripeEvent.data.object);
    }
    return json(200, { received: true });
  } catch (error) {
    return json(400, { error: error.message || "Invalid Stripe webhook." });
  }
}

async function createPaidOrder(session) {
  const checkoutId = session.metadata?.checkoutId;
  if (!checkoutId) return;

  const db = getAdminDb();
  const checkoutRef = db.collection("stripeCheckouts").doc(checkoutId);
  const checkoutSnap = await checkoutRef.get();
  if (!checkoutSnap.exists) return;

  const checkout = checkoutSnap.data();
  if (checkout.status === "completed" && checkout.orderId) return;

  const order = {
    ...checkout.order,
    paymentMethod: "stripe",
    paymentStatus: "paid",
    orderStatus: "new",
    status: "new",
    stripeSessionId: session.id,
    stripePaymentIntentId: session.payment_intent || "",
    paidAt: admin.firestore.FieldValue.serverTimestamp(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  const orderRef = await db.collection("orders").add(order);
  await checkoutRef.set({
    status: "completed",
    orderId: orderRef.id,
    completedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
  await sendOrderEmail(orderRef.id, { ...checkout.order, paymentMethod: "stripe", paymentStatus: "paid" });
}

async function sendOrderEmail(orderId, order) {
  if (!process.env.RESEND_API_KEY) return;
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: FROM_EMAIL,
    to: [NOTIFICATION_EMAIL],
    subject: `Paid Shawarma Time order #${orderId.slice(0, 8).toUpperCase()}`,
    text: plainTextOrder(orderId, order),
    html: htmlOrder(orderId, order)
  });
}

function plainTextOrder(orderId, order) {
  return [
    "Paid Shawarma Time order",
    `Order ID: ${orderId}`,
    `Name: ${order.customer?.name || ""}`,
    `Phone: ${order.customer?.phone || ""}`,
    "Payment: stripe",
    `Total: ${formatTotal(order.subtotal)}`,
    `Notes: ${order.customer?.notes || "-"}`,
    "",
    "Items:",
    ...order.items.map((item) => `- ${item.quantity || 1}x ${item.name || "Item"} (${item.price || ""})`)
  ].join("\n");
}

function htmlOrder(orderId, order) {
  return `
    <div style="font-family:Arial,sans-serif;color:#1b120d">
      <h2>Paid Shawarma Time order</h2>
      <p><strong>Order ID:</strong> ${escapeHtml(orderId)}</p>
      <p><strong>Name:</strong> ${escapeHtml(order.customer?.name || "")}</p>
      <p><strong>Phone:</strong> ${escapeHtml(order.customer?.phone || "")}</p>
      <p><strong>Payment:</strong> stripe</p>
      <p><strong>Total:</strong> ${escapeHtml(formatTotal(order.subtotal))}</p>
      <p><strong>Notes:</strong> ${escapeHtml(order.customer?.notes || "-")}</p>
      <h3>Items</h3>
      <ul>${order.items.map((item) => `<li>${escapeHtml(String(item.quantity || 1))}x ${escapeHtml(item.name || "Item")} (${escapeHtml(item.price || "")})</li>`).join("")}</ul>
    </div>
  `;
}

function formatTotal(value) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(Number(value || 0));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  };
}
