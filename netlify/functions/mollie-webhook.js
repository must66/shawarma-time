import admin from "firebase-admin";
import { Resend } from "resend";

const MOLLIE_API = "https://api.mollie.com/v2";
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
  if (!process.env.MOLLIE_API_KEY || !process.env.FIREBASE_SERVICE_ACCOUNT) {
    return json(500, { error: "Mollie webhook is not configured." });
  }

  try {
    const params = new URLSearchParams(event.body || "");
    const paymentId = params.get("id");
    if (!paymentId) return json(400, { error: "Missing Mollie payment id." });
    const payment = await mollie(`/payments/${encodeURIComponent(paymentId)}`);

    if (payment.status === "paid") {
      await createPaidOrder(payment);
    } else if (["canceled", "expired", "failed"].includes(payment.status)) {
      await markCheckout(payment, payment.status);
    }
    return json(200, { ok: true });
  } catch (error) {
    return json(500, { error: error.message || "Could not process Mollie webhook." });
  }
}

async function mollie(path) {
  const response = await fetch(`${MOLLIE_API}${path}`, {
    headers: { authorization: `Bearer ${process.env.MOLLIE_API_KEY}` }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.detail || payload.title || `Mollie API error ${response.status}.`);
  return payload;
}

async function createPaidOrder(payment) {
  const checkoutId = payment.metadata?.checkoutId;
  if (!checkoutId) return;
  const db = getAdminDb();
  const checkoutRef = db.collection("mollieCheckouts").doc(checkoutId);
  const checkoutSnap = await checkoutRef.get();
  if (!checkoutSnap.exists) return;

  const checkout = checkoutSnap.data();
  if (checkout.status === "completed" && checkout.orderId) return;

  const order = {
    ...checkout.order,
    paymentMethod: "mollie",
    paymentStatus: "paid",
    orderStatus: "new",
    status: "new",
    molliePaymentId: payment.id,
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
  await sendOrderEmail(orderRef.id, { ...checkout.order, paymentMethod: "mollie", paymentStatus: "paid" });
}

async function markCheckout(payment, status) {
  const checkoutId = payment.metadata?.checkoutId;
  if (!checkoutId) return;
  await getAdminDb().collection("mollieCheckouts").doc(checkoutId).set({
    status,
    molliePaymentId: payment.id,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
}

async function sendOrderEmail(orderId, order) {
  if (!process.env.RESEND_API_KEY) return;
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: FROM_EMAIL,
    to: [NOTIFICATION_EMAIL],
    subject: `Paid Mollie Shawarma Time order #${orderId.slice(0, 8).toUpperCase()}`,
    text: plainTextOrder(orderId, order),
    html: htmlOrder(orderId, order)
  });
}

function plainTextOrder(orderId, order) {
  return [
    "Paid Mollie Shawarma Time order",
    `Order ID: ${orderId}`,
    `Name: ${order.customer?.name || ""}`,
    `Phone: ${order.customer?.phone || ""}`,
    "Payment: mollie",
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
      <h2>Paid Mollie Shawarma Time order</h2>
      <p><strong>Order ID:</strong> ${escapeHtml(orderId)}</p>
      <p><strong>Name:</strong> ${escapeHtml(order.customer?.name || "")}</p>
      <p><strong>Phone:</strong> ${escapeHtml(order.customer?.phone || "")}</p>
      <p><strong>Payment:</strong> mollie</p>
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
