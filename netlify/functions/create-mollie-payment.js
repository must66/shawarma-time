import admin from "firebase-admin";

const MOLLIE_API = "https://api.mollie.com/v2";

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
    return json(500, { error: "Online card payment is temporarily unavailable. Please call the restaurant." });
  }

  try {
    const payload = JSON.parse(event.body || "{}");
    const order = normalizeOrder(payload.order || {});
    const checkoutRef = getAdminDb().collection("mollieCheckouts").doc();
    const orderNumber = formatOrderNumber(checkoutRef.id);
    await checkoutRef.set({
      order,
      orderNumber,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const baseUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || new URL(payload.redirectUrl).origin;
    const paymentBody = {
      description: `Shawarma Time order ${checkoutRef.id.slice(0, 8).toUpperCase()}`,
      amount: {
        currency: "EUR",
        value: order.subtotal.toFixed(2)
      },
      method: ["creditcard"],
      redirectUrl: payload.redirectUrl,
      cancelUrl: payload.cancelUrl,
      webhookUrl: `${baseUrl.replace(/\/$/, "")}/.netlify/functions/mollie-webhook`,
      locale: "nl_NL",
      metadata: {
        checkoutId: checkoutRef.id,
        source: "shawarma-time"
      }
    };
    const payment = await mollie("/payments", paymentBody);

    await checkoutRef.set({ molliePaymentId: payment.id }, { merge: true });
    return json(200, {
      url: payment._links?.checkout?.href,
      checkoutId: checkoutRef.id,
      paymentId: payment.id,
      orderNumber
    });
  } catch {
    return json(500, { error: "Online card payment is temporarily unavailable. Please call the restaurant." });
  }
}

async function mollie(path, body) {
  const response = await fetch(`${MOLLIE_API}${path}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.MOLLIE_API_KEY}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.detail || payload.title || `Mollie API error ${response.status}.`);
  return payload;
}

function normalizeOrder(order) {
  const items = Array.isArray(order.items) ? order.items.slice(0, 40).map((item) => ({
    id: String(item.id || "").slice(0, 120),
    name: String(item.name || "Shawarma Time item").slice(0, 180),
    price: String(item.price || "").slice(0, 40),
    priceValue: Number(item.priceValue || 0),
    quantity: Math.max(1, Math.min(99, Number(item.quantity || 1))),
    image: String(item.image || "").slice(0, 1000)
  })) : [];
  if (!items.length) throw new Error("Order is missing items.");
  const customer = {
    name: String(order.customer?.name || "").trim().slice(0, 120),
    phone: String(order.customer?.phone || "").trim().slice(0, 80),
    email: String(order.customer?.email || "").trim().slice(0, 160),
    address: String(order.customer?.address || "").trim().slice(0, 240),
    fulfillment: ["pickup", "delivery"].includes(order.customer?.fulfillment) ? order.customer.fulfillment : "pickup",
    preferredTime: String(order.customer?.preferredTime || "").trim().slice(0, 40),
    notes: String(order.customer?.notes || "").trim().slice(0, 600)
  };
  if (!customer.name || !customer.phone) throw new Error("Customer name and phone are required.");
  const subtotal = items.reduce((sum, item) => sum + item.priceValue * item.quantity, 0);
  return {
    customer,
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: Number(subtotal.toFixed(2)),
    currency: "EUR",
    paymentMethod: "mollie",
    paymentStatus: "pending",
    source: "website"
  };
}

function formatOrderNumber(value) {
  return `ST-${String(value || Date.now()).replace(/[^a-z0-9]/gi, "").slice(0, 6).toUpperCase()}`;
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  };
}
