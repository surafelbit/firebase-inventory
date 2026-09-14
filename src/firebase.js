import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { initializeFirestore, getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
export const firebaseConfig = {
  apiKey: "AIzaSyCAGndhjYm-lfeFocrTKHsiRXkXFC4RGNc",
  authDomain: "inventory-app-19292.firebaseapp.com",
  projectId: "inventory-app-19292",
  storageBucket: "inventory-app-19292.firebasestorage.app",
  messagingSenderId: "536642547947",
  appId: "1:536642547947:web:43d81669e71e426a3d8eae",
  measurementId: "G-45TBE82T17",
};

const app = initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);

let dbInstance;
try {
  dbInstance = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
} catch {
  dbInstance = getFirestore(app);
}
export const db = dbInstance;

export const functions = getFunctions(app);

// Connect to local Firebase Emulators
if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
  try {
    if (!window.__FIREBASE_EMULATORS_CONNECTED__) {
      connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
      connectFirestoreEmulator(db, "127.0.0.1", 8080);
      connectFunctionsEmulator(functions, "127.0.0.1", 5001);
      window.__FIREBASE_EMULATORS_CONNECTED__ = true;
      console.log("🔥 Connected to Firebase Emulators");
    }
  } catch (err) {
    console.warn("Firebase emulator connection notice:", err.message);
  }
}
