export async function handler() {
  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      stripeSecretKey: Boolean(process.env.STRIPE_SECRET_KEY),
      stripePublishableKey: Boolean(process.env.STRIPE_PUBLISHABLE_KEY),
      stripeWebhookSecret: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
      firebaseServiceAccount: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT)
    })
  };
}
