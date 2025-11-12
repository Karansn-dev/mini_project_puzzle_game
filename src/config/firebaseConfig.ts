// Firebase Configuration
// Official docs: https://firebase.google.com/docs/web/setup
// Use this for your Flask + Web app with Google Auth + Firestore

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// ✅ Replace these values with your own Firebase credentials
const firebaseConfig = {
    apiKey: "AIzaSyCi1D-_EQB6jnk47D3rCrTlB9JaVGHLR1E",
    authDomain: "miniproject-25331.firebaseapp.com",
    projectId: "miniproject-25331",
    storageBucket: "miniproject-25331.firebasestorage.app",
    messagingSenderId: "811422371355",
    appId: "1:811422371355:web:b8e5acb06b5d0c01eeb2be",
    measurementId: "G-TYM1XJV6R1"
};

// 🔥 Initialize Firebase App
const app = initializeApp(firebaseConfig);

// ⚙️ Optional: Initialize Analytics (only runs in browser environment)
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// 🔐 Initialize Firebase Authentication and Google Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// ☁️ Initialize Cloud Firestore
export const db = getFirestore(app);

// Default export
export default app;
