export async function handler() {
  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      mollieApiKey: Boolean(process.env.MOLLIE_API_KEY),
      firebaseServiceAccount: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT),
      webhookBaseUrl: Boolean(process.env.URL || process.env.DEPLOY_PRIME_URL)
    })
  };
}
