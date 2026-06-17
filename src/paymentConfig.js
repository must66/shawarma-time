const hostname = typeof window === "undefined" ? "" : window.location.hostname;
const runtimeConfig = typeof window === "undefined" ? {} : window.SHAWARMA_TIME_CONFIG || {};
const functionsBaseUrl = String(runtimeConfig.functionsBaseUrl || "").replace(/\/$/, "");
const functionsAvailable = Boolean(functionsBaseUrl) || !hostname.endsWith("github.io");
const functionPath = (path) => {
  if (functionsBaseUrl) return `${functionsBaseUrl}${path}`;
  return functionsAvailable ? path : "";
};

export const paymentConfig = {
  molliePaymentEndpoint: functionPath("/.netlify/functions/create-mollie-payment"),
  mollieConfigStatusEndpoint: functionPath("/.netlify/functions/mollie-config-status")
};
