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

// Default configuration now falls back to Kano production config when env is missing
const defaultConfig = {
  apiKey: "AIzaSyAigbniqp1r3mvMMyY8LJxscs2XXfjirRg",
  authDomain: "kanostateeprocurement.firebaseapp.com",
  projectId: "kanostateeprocurement",
  storageBucket: "kanostateeprocurement.appspot.com",
  messagingSenderId: "166809348033",
  appId: "1:166809348033:web:e41beea1cca42f5873f140",
  measurementId: "G-G5K62PCKQV",
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
    const isDemo = defaultConfig.projectId === "demo-project";
    if (isDemo) {
      console.log("⚠️ Firebase config missing, running in demo mode");
      console.log(
        "ℹ️ Some features may be limited. To enable full Firebase functionality:",
      );
      console.log("1. Set up a Firebase project");
      console.log("2. Add Firebase environment variables to .env file");
      console.log("3. See FIREBASE_SETUP.md for detailed instructions");
    } else {
      console.log(
        "✅ Firebase env not found; using fallback production config for project:",
        defaultConfig.projectId,
      );
    }

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
  } else if (defaultConfig.projectId !== "demo-project") {
    console.log(
      "✅ Firebase services initialized with fallback production config",
    );
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
} else if (hasFirebaseConfig || firebaseConfig.projectId !== "demo-project") {
  console.log("🌐 Using production Firebase services");
} else {
  console.log("🎭 Running in demo mode - Firebase features limited");
}

// Export Firebase services with fallback
export { auth, db, storage, hasFirebaseConfig };

// Export app with fallback
export default app || null;
