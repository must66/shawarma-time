const hostname = typeof window === "undefined" ? "" : window.location.hostname;
const functionsAvailable = !hostname.endsWith("github.io");
const functionPath = (path) => functionsAvailable ? path : "";

export const paymentConfig = {
  molliePaymentEndpoint: functionPath("/.netlify/functions/create-mollie-payment"),
  mollieConfigStatusEndpoint: functionPath("/.netlify/functions/mollie-config-status"),
  stripeCheckoutEndpoint: functionPath("/.netlify/functions/create-stripe-checkout"),
  stripeConfigStatusEndpoint: functionPath("/.netlify/functions/stripe-config-status"),
  orderNotificationEndpoint: functionPath("/.netlify/functions/send-order-email")
};
