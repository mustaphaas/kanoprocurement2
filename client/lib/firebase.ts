import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Check if Firebase configuration is available
const hasFirebaseConfig = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID,
);

// Default configuration for development/demo mode
const defaultConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:demo",
  measurementId: "G-DEMO123",
};

// Helper to ensure a valid storageBucket
function normalizeConfig(cfg: any) {
  const projectId = cfg?.projectId;
  let storageBucket = cfg?.storageBucket;
  if (!storageBucket && projectId) {
    storageBucket = `${projectId}.appspot.com`;
  }
  if (
    typeof storageBucket === "string" &&
    storageBucket.includes("firebasestorage.app") &&
    projectId
  ) {
    storageBucket = `${projectId}.appspot.com`;
  }
  return {
    ...cfg,
    storageBucket,
  };
}

// Your web app's Firebase configuration
const firebaseConfig = normalizeConfig(
  hasFirebaseConfig
    ? {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
      }
    : defaultConfig,
);

// Initialize Firebase
let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;

try {
  if (hasFirebaseConfig) {
    console.log("🔥 Initializing Firebase with production config");
    app = initializeApp(firebaseConfig);
    if (!firebaseConfig.storageBucket && firebaseConfig.projectId) {
      console.warn(
        "storageBucket missing or invalid; defaulted to",
        `${firebaseConfig.projectId}.appspot.com`,
      );
    }
  } else {
    console.log("⚠️ Firebase config missing, running in demo mode");
    console.log(
      "ℹ️ Some features may be limited. To enable full Firebase functionality:",
    );
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

// Initialize Firebase services with error handling
try {
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  if (hasFirebaseConfig) {
    console.log("✅ Firebase services initialized successfully");
  } else {
    console.log("⚠️ Firebase services initialized in demo mode");
  }
} catch (error) {
  console.error("❌ Failed to initialize Firebase services:", error);
  console.log("🔧 Application will continue with limited functionality");
}

// Connect to emulators only when explicitly requested
if (
  import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true" &&
  hasFirebaseConfig
) {
  try {
    connectAuthEmulator(auth, "http://localhost:9099", {
      disableWarnings: true,
    });
    connectFirestoreEmulator(db, "localhost", 8080);
    connectStorageEmulator(storage, "localhost", 9199);
    console.log("🔧 Connected to Firebase emulators");
  } catch (error) {
    console.log("⚠️ Firebase emulators not available or already connected");
  }
} else if (hasFirebaseConfig) {
  console.log("🌐 Using production Firebase services");
} else {
  console.log("🎭 Running in demo mode - Firebase features limited");
}

// Export Firebase services with fallback
export { auth, db, storage, hasFirebaseConfig };

// Export app with fallback
export default app || null;
