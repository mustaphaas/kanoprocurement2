# Company Status Scenarios - KanoProc E-Procurement Portal

## Overview
The KanoProc system automatically manages company statuses based on document compliance and approval workflows.

## Status Types & Behaviors

### 1. **Pending Status** 🔵
**When it occurs:**
- New company registration awaiting BPP approval
- Set `pending: true` in `getCompanyStatus()` function to test

**What companies see:**
- Blue status badge with clock icon
- Informational banner: "Account Pending Approval"
- Restricted access with clear explanations
- Review timeline visualization
- Can update profile and manage documents
- **Cannot:** Express interest, submit bids, download tender docs

### 2. **Suspended Status** 🟠 (Auto-triggered)
**When it occurs:**
- **Automatically triggered** when documents expire
- Currently detects expired "Professional License" (2024-01-15)
- System checks expiry dates and auto-suspends

**What companies see:**
- Orange status badge with warning icon
- Alert: "Account Suspended due to expired documents"
- Specific suspension reason displayed
- Full dashboard access but bidding restricted
- **Cannot:** Express interest or submit bids until documents updated

### 3. **Approved Status** ✅
**When it occurs:**
- All documents valid and account approved
- Default status when no issues detected

**What companies see:**
- Green status badge with checkmark
- Full access to all portal features
- Can express interest and submit bids
- All functionality available

### 4. **Blacklisted Status** 🔴
**When it occurs:**
- Manual action by BPP for policy violations
- Set `blacklisted: true` in `getCompanyStatus()` function to test

**What companies see:**
- Red status badge with ban icon
- Alert: "Account Blacklisted"
- Complete restriction from procurement activities
- Contact BPP message displayed

## Testing Different Scenarios

To test different scenarios, modify the `getCompanyStatus()` function in `CompanyDashboard.tsx`:

```typescript
const getCompanyStatus = (): CompanyStatus => {
  const scenarios = {
    pending: false,      // Set TRUE to test pending approval
    hasExpired: hasExpiredDocuments(), // Auto-detects expired docs
    blacklisted: false  // Set TRUE to test blacklisted
  };
  
  if (scenarios.pending) return "Pending";
  if (scenarios.blacklisted) return "Blacklisted";
  if (scenarios.hasExpired) return "Suspended";
  return "Approved";
};
```

## Automatic Document Expiry Detection

The system automatically checks for expired documents:

```typescript
const hasExpiredDocuments = () => {
  const expiredDocs = [
    { name: "Professional License", expiry: "2024-01-15" }
  ];
  return expiredDocs.some(doc => new Date(doc.expiry) < new Date());
};
```

**Current Status:** Since Professional License expired on 2024-01-15, companies are automatically suspended.

## Key Features

1. **Real-time Status Updates**: Status badges update throughout the interface
2. **Contextual Restrictions**: Buttons and features disabled based on status
3. **Clear Communication**: Detailed explanations for each status
4. **Guided Actions**: Specific next steps for each scenario
5. **Automatic Detection**: System monitors document expiry dates
6. **Visual Indicators**: Color-coded status system (Blue/Green/Orange/Red)

## User Experience Flow

### For Pending Companies:
1. Login → See blue "Pending" status
2. Dashboard shows restricted access explanation
3. Can update profile and documents
4. Cannot interact with tenders
5. Clear timeline of approval process

### For Suspended Companies:
1. Login → See orange "Suspended" status  
2. Alert explains specific expired document
3. Directed to "My Documents" to update
4. Can browse but cannot bid
5. Status updates when documents renewed

This system ensures compliance while providing clear guidance to companies at every stage.
