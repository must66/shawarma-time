import { Resend } from "resend";

const NOTIFICATION_EMAIL = process.env.ORDER_NOTIFICATION_EMAIL || "YOUR_EMAIL_HERE";
const FROM_EMAIL = process.env.ORDER_NOTIFICATION_FROM || "Shawarma Time <orders@shawarma-time.nl>";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "Method not allowed." });
  }
  if (!process.env.RESEND_API_KEY) {
    return json(200, { ok: false, skipped: true, error: "RESEND_API_KEY is not configured." });
  }

  try {
    const payload = JSON.parse(event.body || "{}");
    const orderId = String(payload.orderId || "");
    const order = payload.order || {};
    const items = Array.isArray(order.items) ? order.items : [];
    if (!orderId || !items.length) {
      return json(400, { ok: false, error: "Order payload is incomplete." });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [NOTIFICATION_EMAIL],
      subject: `New Shawarma Time order #${orderId.slice(0, 8).toUpperCase()}`,
      text: plainTextOrder(orderId, order),
      html: htmlOrder(orderId, order)
    });

    return json(200, { ok: true });
  } catch (error) {
    return json(500, { ok: false, error: error.message || "Could not send order email." });
  }
}

function plainTextOrder(orderId, order) {
  const lines = [
    `New Shawarma Time order`,
    `Order ID: ${orderId}`,
    `Name: ${order.customer?.name || ""}`,
    `Phone: ${order.customer?.phone || ""}`,
    `Payment: ${order.paymentMethod || "online card"}`,
    `Total: ${formatTotal(order.subtotal)}`,
    `Notes: ${order.customer?.notes || "-"}`,
    "",
    "Items:",
    ...order.items.map((item) => `- ${item.quantity || 1}x ${item.name || "Item"} (${item.price || ""})`)
  ];
  return lines.join("\n");
}

function htmlOrder(orderId, order) {
  return `
    <div style="font-family:Arial,sans-serif;color:#1b120d">
      <h2>New Shawarma Time order</h2>
      <p><strong>Order ID:</strong> ${escapeHtml(orderId)}</p>
      <p><strong>Name:</strong> ${escapeHtml(order.customer?.name || "")}</p>
      <p><strong>Phone:</strong> ${escapeHtml(order.customer?.phone || "")}</p>
      <p><strong>Payment:</strong> ${escapeHtml(order.paymentMethod || "online card")}</p>
      <p><strong>Total:</strong> ${escapeHtml(formatTotal(order.subtotal))}</p>
      <p><strong>Notes:</strong> ${escapeHtml(order.customer?.notes || "-")}</p>
      <h3>Items</h3>
      <ul>
        ${order.items.map((item) => `<li>${escapeHtml(String(item.quantity || 1))}x ${escapeHtml(item.name || "Item")} (${escapeHtml(item.price || "")})</li>`).join("")}
      </ul>
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
