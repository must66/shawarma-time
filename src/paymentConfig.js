export const paymentConfig = {
  molliePaymentEndpoint: "/.netlify/functions/create-mollie-payment",
  mollieConfigStatusEndpoint: "/.netlify/functions/mollie-config-status",
  stripeCheckoutEndpoint: "/.netlify/functions/create-stripe-checkout",
  stripeConfigStatusEndpoint: "/.netlify/functions/stripe-config-status",
  orderNotificationEndpoint: "/.netlify/functions/send-order-email"
};
