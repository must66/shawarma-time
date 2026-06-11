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
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET || !process.env.FIREBASE_SERVICE_ACCOUNT) {
    return json(500, { error: "Stripe webhook is not configured." });
  }

  const signature = event.headers["stripe-signature"];
  const body = event.isBase64Encoded ? Buffer.from(event.body || "", "base64") : event.body || "";

  try {
    const stripeEvent = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    if (stripeEvent.type === "checkout.session.completed") {
      const session = stripeEvent.data.object;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await getAdminDb().collection("orders").doc(orderId).set({
          paymentStatus: "paid",
          orderStatus: "new",
          status: "new",
          stripeSessionId: session.id,
          paidAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      }
    }
    return json(200, { received: true });
  } catch (error) {
    return json(400, { error: error.message || "Invalid Stripe webhook." });
  }
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  };
}
