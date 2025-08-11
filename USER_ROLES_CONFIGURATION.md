# User Roles Configuration Guide

This guide explains how to configure and manage the 4 user types in your Kano State E-Procurement Portal.

## 🏢 User Types Overview

### 1. **Company Users**

- **Role**: `company`
- **Purpose**: Private companies that bid on government tenders
- **Access**: View tenders, submit bids, manage company profile
- **Dashboard**: `/company/dashboard`

### 2. **Admin Users**

- **Role**: `admin`
- **Purpose**: Government administrators who manage the procurement process
- **Access**: Approve companies, manage tenders, view analytics
- **Dashboard**: `/admin/dashboard`

### 3. **Ministry Users**

- **Role**: `ministry`
- **Purpose**: Specific government ministry representatives
- **Access**: Ministry-specific tenders and procurement oversight
- **Dashboard**: `/ministry/dashboard`

### 4. **Super Users**

- **Role**: `superuser`
- **Purpose**: System administrators with full access
- **Access**: Complete system management, user administration
- **Dashboard**: `/superuser/dashboard`

## 🔐 How to Configure Users

### Method 1: Through Firebase Console (Recommended)

1. **Go to Firebase Console**:

   ```
   https://console.firebase.google.com/project/kano-state-gov--eprocurement
   ```

2. **Add User Authentication**:

   - Go to Authentication → Users
   - Click "Add User"
   - Enter email and password

3. **Set User Role in Firestore**:
   - Go to Firestore Database
   - Navigate to `users` collection
   - Find the user by their UID
   - Add/edit these fields:
   ```javascript
   {
     uid: "user-firebase-uid",
     email: "user@example.com",
     role: "admin", // or "company", "ministry", "superuser"
     displayName: "User Full Name",
     createdAt: "2024-01-15T10:00:00Z",
     lastLoginAt: "2024-01-15T10:00:00Z",
     emailVerified: true,
     // For company users:
     companyId: "company-id-here",
     // For ministry users:
     ministryId: "ministry-id-here"
   }
   ```

### Method 2: Through Application Registration

Users can register through the app, but you'll need to approve their role:

1. User registers through `/register`
2. User gets assigned `company` role by default
3. Admin manually updates role in Firestore to `admin`, `ministry`, or `superuser`

### Method 3: Programmatic Creation (Seeding Script)

Run the seeding script to create initial admin users:

```bash
npx tsx scripts/seedFirestore.ts
```

## 👥 Predefined Test Users

### Company Users

```
Email: approved@company.com
Password: password123
Role: company
```

### Admin Users

```
Email: admin@kanostate.gov.ng
Password: admin123
Role: admin
```

### Ministry Users

```
Email: ministry@works.kano.gov.ng
Password: ministry123
Role: ministry
```

### Super Users

```
Email: superuser@kanostate.gov.ng
Password: super123
Role: superuser
```

## 🏗️ Setting Up Each User Type

### 1. Company User Setup

**Required Fields:**

- `email`: Company email address
- `role`: "company"
- `companyId`: Link to companies collection
- `displayName`: Company representative name

**Example Firestore Document:**

```javascript
// Collection: users/[uid]
{
  uid: "company-user-uid",
  email: "contractor@buildit.com",
  role: "company",
  companyId: "buildit-company-id",
  displayName: "John Smith",
  createdAt: new Date(),
  lastLoginAt: new Date(),
  emailVerified: true
}

// Collection: companies/[companyId]
{
  id: "buildit-company-id",
  userId: "company-user-uid",
  companyName: "BuildIt Construction Ltd",
  registrationNumber: "RC123456",
  email: "contractor@buildit.com",
  status: "Approved",
  // ... other company fields
}
```

### 2. Admin User Setup

**Required Fields:**

- `email`: Government email address (@kanostate.gov.ng)
- `role`: "admin"
- `displayName`: Admin full name

**Example Firestore Document:**

```javascript
// Collection: users/[uid]
{
  uid: "admin-user-uid",
  email: "admin@kanostate.gov.ng",
  role: "admin",
  displayName: "Ahmed Kano",
  createdAt: new Date(),
  lastLoginAt: new Date(),
  emailVerified: true
}
```

### 3. Ministry User Setup

**Required Fields:**

- `email`: Ministry-specific email
- `role`: "ministry"
- `ministryId`: Link to ministry identifier
- `displayName`: Ministry representative name

**Example Firestore Document:**

```javascript
// Collection: users/[uid]
{
  uid: "ministry-user-uid",
  email: "procurement@works.kano.gov.ng",
  role: "ministry",
  ministryId: "ministry-of-works",
  displayName: "Fatima Hassan",
  createdAt: new Date(),
  lastLoginAt: new Date(),
  emailVerified: true
}
```

### 4. Super User Setup

**Required Fields:**

- `email`: System admin email
- `role`: "superuser"
- `displayName`: Super admin name

**Example Firestore Document:**

```javascript
// Collection: users/[uid]
{
  uid: "superuser-uid",
  email: "superuser@kanostate.gov.ng",
  role: "superuser",
  displayName: "System Administrator",
  createdAt: new Date(),
  lastLoginAt: new Date(),
  emailVerified: true
}
```

## 🛡️ Security Rules

Update your Firestore security rules to handle all user types:

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Admins and superusers can read all user profiles
      allow read: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'superuser'];
    }

    // Companies collection access
    match /companies/{companyId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'superuser'] ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.companyId == companyId);
    }

    // Tenders collection access
    match /tenders/{tenderId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'superuser', 'ministry'];
    }

    // Audit logs - admin/superuser only
    match /auditLogs/{logId} {
      allow read, write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'superuser'];
    }
  }
}
```

## 🚀 Quick Setup Commands

### 1. Create Initial Admin User

```bash
# Add user in Firebase Console Authentication
# Then run this in Firestore:
```

### 2. Bulk Create Users (via script)

Create a setup script to bulk create users:

```typescript
// scripts/createInitialUsers.ts
import { authService } from "../client/lib/auth";

const initialUsers = [
  {
    email: "admin@kanostate.gov.ng",
    password: "SecurePassword123!",
    role: "admin",
    displayName: "System Administrator",
  },
  {
    email: "superuser@kanostate.gov.ng",
    password: "SuperSecure123!",
    role: "superuser",
    displayName: "Super Administrator",
  },
  {
    email: "ministry@works.kano.gov.ng",
    password: "Ministry123!",
    role: "ministry",
    displayName: "Ministry of Works",
    ministryId: "ministry-of-works",
  },
];

// Create users programmatically
```

## 📊 User Management

### Monitor Users

- Firebase Console → Authentication → Users
- Firestore Console → users collection
- Admin dashboard → User management section

### Update User Roles

1. Go to Firestore
2. Navigate to users/[uid]
3. Update `role` field
4. User will get new permissions on next login

### Deactivate Users

1. Firebase Console → Authentication
2. Find user → Disable account
3. Or update Firestore user document with `active: false`

---

## 🔧 Troubleshooting

**User can't login**: Check if user exists in both Authentication and Firestore
**Wrong permissions**: Verify user role in Firestore users collection  
**Dashboard not loading**: Ensure user role matches available dashboard routes

**Need help?** Check the audit logs in Firestore for login attempts and errors.
