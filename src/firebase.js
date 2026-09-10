import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
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
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Connect to local Firebase Emulators
if (window.location.hostname === "localhost") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);

  console.log("🔥 Connected to Firebase Emulators");
}
