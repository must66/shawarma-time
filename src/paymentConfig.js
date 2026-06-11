export const paymentConfig = {
  stripeCheckoutEndpoint: "/.netlify/functions/create-stripe-checkout",
  stripeConfigStatusEndpoint: "/.netlify/functions/stripe-config-status",
  orderNotificationEndpoint: "/.netlify/functions/send-order-email"
};
