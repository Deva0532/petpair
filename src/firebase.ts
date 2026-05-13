import { initializeApp } from 'firebase/app';
import { getAuth, initializeRecaptchaConfig } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize reCAPTCHA config for Phone Auth (required for Identity Platform)
initializeRecaptchaConfig(auth)
  .then(() => console.log('reCAPTCHA config initialized successfully'))
  .catch((err) => console.warn('reCAPTCHA config init warning:', err.message));

export default app;
