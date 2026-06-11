import admin from "firebase-admin";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

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
  if (!process.env.STRIPE_SECRET_KEY || !process.env.FIREBASE_SERVICE_ACCOUNT) {
    return json(500, { error: "Stripe is not configured. Missing STRIPE_SECRET_KEY or FIREBASE_SERVICE_ACCOUNT." });
  }

  try {
    const payload = JSON.parse(event.body || "{}");
    const order = normalizeOrder(payload.order || {});
    if (!order.items.length) return json(400, { error: "Order is missing items." });

    const checkoutRef = getAdminDb().collection("stripeCheckouts").doc();
    await checkoutRef.set({
      order,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "ideal"],
      line_items: order.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "eur",
          unit_amount: Math.max(50, Math.round(item.priceValue * 100)),
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : undefined
          }
        }
      })),
      metadata: {
        checkoutId: checkoutRef.id,
        source: "shawarma-time"
      },
      success_url: payload.successUrl,
      cancel_url: payload.cancelUrl
    });

    await checkoutRef.set({ stripeSessionId: session.id }, { merge: true });
    return json(200, { url: session.url, checkoutId: checkoutRef.id });
  } catch (error) {
    return json(500, { error: error.message || "Could not create Stripe Checkout session." });
  }
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
  const customer = {
    name: String(order.customer?.name || "").trim().slice(0, 120),
    phone: String(order.customer?.phone || "").trim().slice(0, 80),
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
    paymentMethod: "stripe",
    paymentStatus: "pending",
    source: "website"
  };
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  };
}
