import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed." });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return json(500, { error: "Stripe is not configured." });
  }

  try {
    const payload = JSON.parse(event.body || "{}");
    const orderId = String(payload.orderId || "");
    const order = payload.order || {};
    const items = Array.isArray(order.items) ? order.items : [];
    if (!orderId || !items.length) return json(400, { error: "Order is missing items." });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "ideal"],
      line_items: items.map((item) => ({
        quantity: Math.max(1, Math.min(99, Number(item.quantity || 1))),
        price_data: {
          currency: "eur",
          unit_amount: Math.max(50, Math.round(Number(item.priceValue || 0) * 100)),
          product_data: {
            name: String(item.name || "Shawarma Time item").slice(0, 180),
            images: item.image ? [String(item.image)] : undefined
          }
        }
      })),
      metadata: {
        orderId,
        source: "shawarma-time"
      },
      success_url: payload.successUrl,
      cancel_url: payload.cancelUrl
    });

    return json(200, { url: session.url });
  } catch (error) {
    return json(500, { error: error.message || "Could not create Stripe Checkout session." });
  }
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  };
}
