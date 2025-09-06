// This script seeds the Firestore database with initial data
// Run with: npx tsx scripts/seedFirestore.ts

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY as string,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.VITE_FIREBASE_APP_ID as string,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function seedData() {
  try {
    console.log("Starting Firestore seeding...");

    // Authenticate as admin to satisfy Firestore security rules
    const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@kanostate.gov.ng";
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin123!@#";
    try {
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      console.log(`Authenticated as ${adminEmail} for seeding.`);
    } catch (e) {
      console.warn(
        "Admin sign-in failed, proceeding to create admin accounts then retry writes.",
      );
    }

    // Create admin users
    const adminUsers = [
      {
        email: "admin@kanostate.gov.ng",
        password: "Admin@123",
        role: "admin",
        displayName: "Admin User",
      },
      {
        email: "superuser@kanostate.gov.ng",
        password: "SuperUser@123",
        role: "superuser",
        displayName: "Super User",
      },
    ];

    for (const adminUser of adminUsers) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          adminUser.email,
          adminUser.password,
        );
        const user = userCredential.user;

        // Create user profile
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: adminUser.displayName,
          role: adminUser.role,
          createdAt: Timestamp.now(),
          lastLoginAt: Timestamp.now(),
          emailVerified: true,
        });

        console.log(`Created ${adminUser.role}: ${adminUser.email}`);
      } catch (error: any) {
        if (error.code === "auth/email-already-in-use") {
          console.log(`User ${adminUser.email} already exists`);
        } else {
          console.error(`Error creating ${adminUser.email}:`, error);
        }
      }
    }

    // Seed sample companies
    const companies = [
      {
        userId: "demo-company-1",
        companyName: "Northern Construction Ltd",
        registrationNumber: "RC123456",
        email: "contact@northernconstruction.com",
        phone: "+234 803 123 4567",
        address: "123 Ahmadu Bello Way, Kano",
        businessType: "Limited Liability Company",
        contactPersonName: "Ahmad Mahmoud",
        status: "Approved",
        registrationDate: Timestamp.now(),
        lastActivity: Timestamp.now(),
        documents: {
          incorporation: true,
          taxClearance: true,
          companyProfile: true,
          cacForm: true,
        },
        verificationStatus: {
          cac: "Verified",
          firs: "Verified",
        },
      },
      {
        userId: "demo-company-2",
        companyName: "Sahel Medical Supplies",
        registrationNumber: "RC234567",
        email: "info@sahelmedical.com",
        phone: "+234 805 987 6543",
        address: "45 Hospital Road, Kano",
        businessType: "Limited Liability Company",
        contactPersonName: "Fatima Yusuf",
        status: "Suspended",
        registrationDate: Timestamp.now(),
        lastActivity: Timestamp.now(),
        suspensionReason: "Expired Tax Clearance Certificate",
        documents: {
          incorporation: true,
          taxClearance: false,
          companyProfile: true,
          cacForm: true,
        },
        verificationStatus: {
          cac: "Verified",
          firs: "Failed",
        },
      },
      {
        userId: "demo-company-3",
        companyName: "TechSolutions Nigeria",
        registrationNumber: "RC345678",
        email: "hello@techsolutions.ng",
        phone: "+234 807 555 1234",
        address: "78 Independence Road, Kano",
        businessType: "Limited Liability Company",
        contactPersonName: "Ibrahim Hassan",
        status: "Approved",
        registrationDate: Timestamp.now(),
        lastActivity: Timestamp.now(),
        documents: {
          incorporation: true,
          taxClearance: true,
          companyProfile: true,
          cacForm: true,
        },
        verificationStatus: {
          cac: "Verified",
          firs: "Verified",
        },
      },
    ];

    for (const company of companies) {
      await addDoc(collection(db, "companies"), company);
      console.log(`Created company: ${company.companyName}`);
    }

    // Seed sample tenders
    const tenders = [
      {
        title: "Hospital Equipment Supply",
        description:
          "Supply of medical equipment for 5 primary healthcare centers",
        category: "Healthcare",
        ministry: "Ministry of Health",
        procuringEntity: "Kano State Primary Healthcare Development Agency",
        estimatedValue: "850000000",
        currency: "NGN",
        status: "Published",
        publishDate: Timestamp.now(),
        closeDate: Timestamp.fromDate(
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        ),
        bidsReceived: 0,
        ocdsReleased: true,
        addendaCount: 0,
        eligibilityCriteria:
          "Registered medical equipment suppliers with CAC registration",
        technicalRequirements:
          "ISO certified medical equipment with 2-year warranty",
        evaluationCriteria:
          "Technical capability (40%), Financial proposal (60%)",
        contractDuration: "6 months",
        deliveryLocation: "Various healthcare centers in Kano State",
        paymentTerms: "30 days after delivery and acceptance",
        ocdsId: "KS-2024-001",
        procurementMethod: "open",
        procurementCategory: "goods",
        mainProcurementCategory: "goods",
        additionalProcurementCategories: ["medical-equipment"],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        title: "Road Construction Project",
        description: "Construction of 25km rural roads in Kano North LGA",
        category: "Infrastructure",
        ministry: "Ministry of Works",
        procuringEntity: "Kano State Ministry of Works",
        estimatedValue: "2500000000",
        currency: "NGN",
        status: "Published",
        publishDate: Timestamp.now(),
        closeDate: Timestamp.fromDate(
          new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        ),
        bidsReceived: 0,
        ocdsReleased: true,
        addendaCount: 0,
        eligibilityCriteria:
          "Registered construction companies with relevant experience",
        technicalRequirements:
          "Minimum 5 years experience in road construction",
        evaluationCriteria:
          "Technical capability (50%), Financial proposal (50%)",
        contractDuration: "12 months",
        deliveryLocation: "Kano North LGA",
        paymentTerms: "Progressive payments based on milestones",
        ocdsId: "KS-2024-002",
        procurementMethod: "open",
        procurementCategory: "works",
        mainProcurementCategory: "works",
        additionalProcurementCategories: ["construction", "infrastructure"],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        title: "ICT Infrastructure Upgrade",
        description:
          "Upgrade of government ICT infrastructure and network systems",
        category: "Technology",
        ministry: "Ministry of Science and Technology",
        procuringEntity: "Kano State ICT Development Agency",
        estimatedValue: "1200000000",
        currency: "NGN",
        status: "Awarded",
        publishDate: Timestamp.fromDate(
          new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        ),
        closeDate: Timestamp.fromDate(
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        ),
        openDate: Timestamp.fromDate(
          new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        ),
        awardDate: Timestamp.fromDate(
          new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        ),
        awardedCompany: "TechSolutions Nigeria",
        awardAmount: "1100000000",
        bidsReceived: 8,
        ocdsReleased: true,
        addendaCount: 1,
        evaluationScore: 92,
        eligibilityCriteria:
          "Registered ICT companies with relevant certifications",
        technicalRequirements:
          "Cisco/Microsoft certified engineers, minimum 3 years experience",
        evaluationCriteria:
          "Technical capability (60%), Financial proposal (40%)",
        contractDuration: "8 months",
        deliveryLocation: "Government offices across Kano State",
        paymentTerms: "60% on delivery, 40% after testing and acceptance",
        ocdsId: "KS-2024-003",
        procurementMethod: "open",
        procurementCategory: "services",
        mainProcurementCategory: "services",
        additionalProcurementCategories: ["ict", "networking"],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
    ];

    for (const tender of tenders) {
      await addDoc(collection(db, "tenders"), tender);
      console.log(`Created tender: ${tender.title}`);
    }

    // Seed sample contracts
    const contracts = [
      {
        tenderId: "KS-2024-003",
        companyId: "demo-company-3",
        companyUserId: "demo-company-3",
        companyName: "TechSolutions Nigeria",
        projectTitle: "ICT Infrastructure Upgrade",
        awardingMinistry: "Ministry of Science and Technology",
        contractValue: "1100000000",
        awardDate: Timestamp.fromDate(
          new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        ),
        startDate: Timestamp.fromDate(
          new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        ),
        expectedEndDate: Timestamp.fromDate(
          new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
        ),
        status: "Active",
        progress: 25,
        milestones: [
          {
            id: "1",
            title: "Network Assessment",
            description:
              "Complete assessment of existing network infrastructure",
            expectedDate: Timestamp.fromDate(
              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            ),
            status: "In Progress",
            completionPercentage: 80,
            documents: [],
          },
          {
            id: "2",
            title: "Equipment Procurement",
            description: "Procure and deliver network equipment",
            expectedDate: Timestamp.fromDate(
              new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            ),
            status: "Pending",
            completionPercentage: 0,
            documents: [],
          },
        ],
        performanceScore: {
          overall: 85,
          quality: 90,
          timeliness: 80,
          budgetCompliance: 95,
        },
        issues: [],
      },
    ];

    for (const contract of contracts) {
      await addDoc(collection(db, "contracts"), contract);
      console.log(`Created contract: ${contract.projectTitle}`);
    }

    // Seed sample notifications
    const notifications = [
      {
        userId: "demo-company-1",
        type: "info",
        title: "New Tender Published",
        message:
          "A new tender for Hospital Equipment Supply has been published.",
        read: false,
        createdAt: Timestamp.now(),
        relatedType: "tender",
        relatedId: "KS-2024-001",
      },
      {
        userId: "demo-company-2",
        type: "warning",
        title: "Document Expiry Alert",
        message:
          "Your Tax Clearance Certificate expires in 30 days. Please update to avoid suspension.",
        read: false,
        createdAt: Timestamp.now(),
        relatedType: "system",
      },
      {
        userId: "demo-company-3",
        type: "success",
        title: "Contract Awarded",
        message:
          "Congratulations! You have been awarded the ICT Infrastructure Upgrade contract.",
        read: true,
        createdAt: Timestamp.fromDate(
          new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        ),
        relatedType: "contract",
        relatedId: "KS-2024-003",
      },
    ];

    for (const notification of notifications) {
      await addDoc(collection(db, "notifications"), notification);
      console.log(`Created notification: ${notification.title}`);
    }

    console.log("✅ Firestore seeding completed successfully!");
    console.log("\n📋 Demo Accounts Created:");
    console.log("Admin: admin@kanostate.gov.ng / Admin@123");
    console.log("Super User: superuser@kanostate.gov.ng / SuperUser@123");
    console.log("\n🏢 Demo Companies:");
    console.log("- Northern Construction Ltd (Approved)");
    console.log("- Sahel Medical Supplies (Suspended)");
    console.log("- TechSolutions Nigeria (Approved, has active contract)");
    console.log("\n📄 Demo Tenders:");
    console.log("- Hospital Equipment Supply (Published)");
    console.log("- Road Construction Project (Published)");
    console.log("- ICT Infrastructure Upgrade (Awarded to TechSolutions)");
  } catch (error) {
    console.error("❌ Error seeding Firestore:", error);
  }
}

// Run the seeding script
seedData()
  .then(() => {
    console.log("Seeding script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeding script failed:", error);
    process.exit(1);
  });
