import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Check if Firebase configuration is available
const hasFirebaseConfig = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID
);

// Default configuration for development/demo mode
const defaultConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:demo",
  measurementId: "G-DEMO123"
};

// Your web app's Firebase configuration
const firebaseConfig = hasFirebaseConfig ? {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
} : defaultConfig;

// Initialize Firebase
let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;

try {
  if (hasFirebaseConfig) {
    console.log("🔥 Initializing Firebase with production config");
    app = initializeApp(firebaseConfig);
  } else {
    console.log("⚠️ Firebase config missing, running in demo mode");
    console.log("ℹ️ Some features may be limited. To enable full Firebase functionality:");
    console.log("1. Set up a Firebase project");
    console.log("2. Add Firebase environment variables to .env file");
    console.log("3. See FIREBASE_SETUP.md for detailed instructions");

    // Initialize with demo config for basic functionality
    app = initializeApp(defaultConfig);
  }
} catch (error) {
  console.error("❌ Firebase initialization failed:", error);
  console.log("🔧 Initializing with fallback configuration...");
  app = initializeApp(defaultConfig);
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect to emulators only when explicitly requested
if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true") {
  try {
    connectAuthEmulator(auth, "http://localhost:9099", {
      disableWarnings: true,
    });
    connectFirestoreEmulator(db, "localhost", 8080);
    connectStorageEmulator(storage, "localhost", 9199);
    console.log("Connected to Firebase emulators");
  } catch (error) {
    console.log("Firebase emulators not available or already connected");
  }
} else {
  console.log("Using production Firebase services");
}

export default app;
