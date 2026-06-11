# Mollie setup for Shawarma Time

## What the integration does

- The customer selects "Online betalen met Mollie".
- The website calls the Netlify function `/.netlify/functions/create-mollie-payment`.
- The function creates a pending document in Firestore collection `mollieCheckouts`.
- The customer is redirected to Mollie Checkout.
- Mollie calls `/.netlify/functions/mollie-webhook` after the payment status changes.
- If Mollie returns `paid`, the webhook creates the final order in Firestore collection `orders`.
- The order is saved with:
  - `paymentMethod: "mollie"`
  - `paymentStatus: "paid"`
  - `orderStatus: "new"`

## Required Netlify environment variables

Add these in Netlify under Site configuration > Environment variables:

- `MOLLIE_API_KEY`
- `FIREBASE_SERVICE_ACCOUNT`
- `RESEND_API_KEY`
- `ORDER_NOTIFICATION_EMAIL`
- `ORDER_NOTIFICATION_FROM`

Optional:

- `MOLLIE_PAYMENT_METHODS`

Leave `MOLLIE_PAYMENT_METHODS` empty to let Mollie Checkout show every enabled payment method and wallet for the customer's device. This is recommended for iDEAL, Apple Pay, Google Pay, Visa and Mastercard support.

If you want to restrict the checkout, use Mollie method IDs such as:

```txt
ideal,applepay,creditcard
```

Enable iDEAL, Apple Pay, Google Pay and credit card in your Mollie dashboard when available for your profile. Visa and Mastercard are handled through Mollie's credit card method. Google Pay is handled by Mollie as a wallet availability option, so do not add `googlepay` to the `method` filter.

## Firebase service account

Create the value for `FIREBASE_SERVICE_ACCOUNT` from Firebase Console:

1. Open Firebase Console.
2. Go to Project settings > Service accounts.
3. Generate a new private key.
4. Copy the full JSON object into the Netlify environment variable.

Keep this value private. Never commit it to GitHub.

## Webhook URL

The create-payment function sends this webhook URL to Mollie automatically:

```txt
https://YOUR_NETLIFY_SITE.netlify.app/.netlify/functions/mollie-webhook
```

The webhook must be publicly reachable. GitHub Pages cannot run this function.

## Bank payouts

Payouts must be connected inside your Mollie account:

1. Log in to Mollie.
2. Complete organization verification.
3. Add the restaurant's legal/business details.
4. Add and verify the bank account/IBAN.
5. Activate payment methods.
6. Enable iDEAL, Apple Pay, Google Pay, Visa and Mastercard where Mollie allows them for the profile.
7. Set the payout schedule in Mollie.

This cannot be done from website code because it requires the owner's Mollie account, identity checks and bank verification.

## Test payment

1. Use a Mollie test API key first.
2. Deploy this repo to Netlify.
3. Add all environment variables.
4. Open the Netlify production URL.
5. Add an item to the cart.
6. Choose "Online betalen met Mollie".
7. Submit the checkout.
8. Complete the test payment in Mollie Checkout.
9. Confirm the order appears in Admin under Orders.

## Production switch

When testing is complete:

1. Replace the test key with the live `MOLLIE_API_KEY`.
2. Confirm payment methods are live in Mollie.
3. Confirm bank payouts are verified.
4. Run a small live payment.
