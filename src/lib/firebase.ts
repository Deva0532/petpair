import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAyjkJ9TTBE_NPXUsXjZ8Rf0pcUGye-LBI",
  authDomain: "peto-d4ee4.firebaseapp.com",
  projectId: "peto-d4ee4",
  storageBucket: "peto-d4ee4.firebasestorage.app",
  messagingSenderId: "855607931300",
  appId: "1:855607931300:web:ca00a33696f0b944cad131",
  measurementId: "G-J32GZBX95E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, db, storage };
