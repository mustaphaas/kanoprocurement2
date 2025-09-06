import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Your Firebase config (same as in client/lib/firebase.ts)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

interface InitialUser {
  email: string;
  password: string;
  role: "admin" | "superuser" | "ministry" | "company";
  displayName: string;
  ministryId?: string;
}

const initialUsers: InitialUser[] = [
  {
    email: "admin@kanostate.gov.ng",
    password: "Admin123!@#",
    role: "admin",
    displayName: "System Administrator",
  },
  {
    email: "superuser@kanostate.gov.ng",
    password: "Super123!@#",
    role: "superuser",
    displayName: "Super Administrator",
  },
  {
    email: "ministry@works.kano.gov.ng",
    password: "Ministry123!",
    role: "ministry",
    displayName: "Ministry of Works Representative",
    ministryId: "ministry-of-works",
  },
  {
    email: "ministry@health.kano.gov.ng",
    password: "Ministry123!",
    role: "ministry",
    displayName: "Ministry of Health Representative",
    ministryId: "ministry-of-health",
  },
  {
    email: "ministry@education.kano.gov.ng",
    password: "Ministry123!",
    role: "ministry",
    displayName: "Ministry of Education Representative",
    ministryId: "ministry-of-education",
  },
];

async function createInitialUsers() {
  console.log(
    "🚀 Creating initial users for Kano State E-Procurement Portal...\n",
  );

  for (const userData of initialUsers) {
    try {
      console.log(`Creating user: ${userData.email}`);

      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password,
      );

      const user = userCredential.user;
      console.log(`✅ Auth user created with UID: ${user.uid}`);

      // Create user profile in Firestore (omit undefined fields)
      const userProfile: any = {
        uid: user.uid,
        email: user.email,
        displayName: userData.displayName,
        role: userData.role,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        emailVerified: false,
      };
      if (userData.ministryId) userProfile.ministryId = userData.ministryId;

      await setDoc(doc(db, "users", user.uid), userProfile);
      console.log(`✅ Firestore profile created for ${userData.displayName}`);
      console.log("---");
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        console.log(
          `⚠️  User ${userData.email} already exists, ensuring profile...`,
        );
        try {
          const cred = await signInWithEmailAndPassword(
            auth,
            userData.email,
            userData.password,
          );
          const uid = cred.user.uid;
          const profile: any = {
            uid,
            email: userData.email,
            displayName: userData.displayName,
            role: userData.role,
            createdAt: new Date(),
            lastLoginAt: new Date(),
            emailVerified: false,
          };
          if (userData.ministryId) profile.ministryId = userData.ministryId;
          await setDoc(doc(db, "users", uid), profile);
          console.log(`✅ Profile ensured for ${userData.email}`);
        } catch (e) {
          console.error(
            `❌ Failed to ensure profile for ${userData.email}:`,
            (e as any).message || e,
          );
        }
      } else {
        console.error(
          `❌ Error creating user ${userData.email}:`,
          error.message,
        );
      }
      console.log("---");
    }
  }

  console.log("🎉 Initial user creation completed!\n");
  console.log("📋 Login Credentials:");
  console.log("====================");

  initialUsers.forEach((user) => {
    console.log(`${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
  });

  console.log("\n📚 Next Steps:");
  console.log("1. Users can now login at your portal");
  console.log(
    "2. Check Firebase Console → Authentication to see created users",
  );
  console.log("3. Check Firestore → users collection for user profiles");
  console.log("4. Update passwords for security before production use");
}

// Run the script
createInitialUsers()
  .then(() => {
    console.log("\n✨ Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });
