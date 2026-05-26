export const firebaseConfig = {
  apiKey: "AIzaSyBHgTjVfCjosegnEOplr7vuR87dzWQn06Q",
  authDomain: "shawarma-time-ca124.firebaseapp.com",
  projectId: "shawarma-time-ca124",
  storageBucket: "shawarma-time-ca124.firebasestorage.app",
  messagingSenderId: "610999682916",
  appId: "1:610999682916:web:95e48d19aeb26fd6761c71",
  measurementId: "G-B37NSXFFSJ"
};

export const firebaseEnabled = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.storageBucket &&
  firebaseConfig.appId
);
