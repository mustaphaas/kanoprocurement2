# Company Login Testing Guide - KanoProc E-Procurement Portal

## How to Test Different Company Statuses

### Step 1: Navigate to Company Login
- Go to the company login page
- You'll see test account cards with different company statuses

### Step 2: Click on Test Account Emails
- **Click on any email** in the test account cards to auto-fill the login form
- Password is automatically filled as `password123` for all test accounts

### Step 3: Test Each Status

#### 🔵 **Pending Approval Account**
**Email:** `pending@company.com`  
**Password:** `password123`

**What you'll see:**
- Blue "Pending" status badge
- Restricted dashboard with explanatory content
- Review timeline showing approval process
- Can access: Profile, Documents, ePortal
- **Cannot access:** Express interest, Submit bids, Download tenders

#### ✅ **Approved Company Account**
**Email:** `approved@company.com`  
**Password:** `password123`

**What you'll see:**
- Green "Approved" status badge
- Full access to all portal features
- Can express interest and submit bids
- All functionality available

#### 🟠 **Suspended Company Account**
**Email:** `suspended@company.com`  
**Password:** `password123`

**What you'll see:**
- Orange "Suspended" status badge
- Alert about expired Professional License
- Full dashboard access but bidding restricted
- **Cannot:** Express interest or submit bids until documents updated

#### 🔴 **Blacklisted Company Account**
**Email:** `blacklisted@company.com`  
**Password:** `password123`

**What you'll see:**
- Red "Blacklisted" status badge
- Alert about policy violations
- Complete restriction from procurement activities
- Message to contact BPP

## Key Features to Test

### 1. **Dashboard Variations**
- Each account shows different company names and statistics
- Status-specific alerts and restrictions
- Different available actions based on status

### 2. **Navigation Restrictions**
- Pending/Suspended/Blacklisted accounts cannot express interest
- Button states change based on company status
- Clear messaging about restrictions

### 3. **Status Indicators**
- Color-coded status badges throughout the interface
- Consistent iconography (Clock, CheckCircle, AlertTriangle, Ban)
- Status displayed in multiple locations

### 4. **Contextual Content**
- Pending accounts see limited dashboard with guidance
- Suspended accounts see full dashboard but with restrictions
- Blacklisted accounts see complete restrictions

## Quick Testing Workflow

1. **Click** on any test email in the login page
2. **Login** (password auto-filled)
3. **Observe** the dashboard changes
4. **Try to** express interest in tenders (note restrictions)
5. **Logout** and try a different account

## Login Page Features

- **Auto-fill functionality**: Click emails to fill form
- **Visual status indicators**: Color-coded account cards
- **Clear descriptions**: What each status means
- **Quick access**: All test accounts on one page

This testing system allows you to experience the complete user journey for companies in different lifecycle stages without needing to modify code or database settings.
