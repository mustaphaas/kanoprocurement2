# Audit Log Testing Guide

## Overview

The audit log system now captures actions from both **SuperUser** and **Admin** dashboards using localStorage. This guide shows how to test all the audit logging functionality.

## Admin Actions That Are Now Logged

### 1. **Admin Login/Logout**

- `ADMIN_LOGIN_SUCCESS` - Successful admin login
- `ADMIN_LOGIN_FAILED` - Failed admin login attempt
- `ADMIN_LOGOUT` - Admin logout action

### 2. **Admin Dashboard Actions**

- `ADMIN_DASHBOARD_ACCESSED` - When admin accesses dashboard
- `ADMIN_TAB_NAVIGATION` - Navigation between tabs
- `COMPANY_APPROVED` - Admin approves company
- `COMPANY_SUSPENDED` - Admin suspends company
- `COMPANY_BLACKLISTED` - Admin blacklists company
- `DATA_EXPORTED` - Admin exports company data

### 3. **MDA Administration**

- `MDA_ADMIN_CREATED` - SuperUser creates MDA administrator
- `MDA_ADMIN_UPDATED` - SuperUser updates MDA administrator

## Testing Steps

### **Step 1: Test Admin Login Logging**

1. Go to `/admin-login`
2. Try **invalid credentials** - should log `ADMIN_LOGIN_FAILED`
3. Use **valid credentials** - should log `ADMIN_LOGIN_SUCCESS`
4. Check audit logs in SuperUser dashboard

### **Step 2: Test Admin Dashboard Actions**

1. **Login as Admin** and navigate to admin dashboard

   - Should log `ADMIN_DASHBOARD_ACCESSED`

2. **Navigate between tabs** (Companies ↔ User Management)

   - Should log `ADMIN_TAB_NAVIGATION` for each switch

3. **Approve/Suspend/Blacklist companies**:

   - Find a pending company
   - Change its status with a reason
   - Should log `COMPANY_APPROVED/SUSPENDED/BLACKLISTED`

4. **Export data**:

   - Click export button
   - Should log `DATA_EXPORTED` with file details

5. **Logout**:
   - Click logout
   - Should log `ADMIN_LOGOUT`

### **Step 3: Test MDA Admin Creation**

1. **Go to SuperUser Dashboard**
2. **Navigate to MDA Management tab**
3. **Create a new MDA administrator**:
   - Should log `MDA_ADMIN_CREATED` with admin details

### **Step 4: Console Testing Commands**

Open browser console and run these commands:

```javascript
// Test admin audit logging
testAdminAuditLogs();

// Test admin status changes
adminTestStatusChange();

// Test general audit logs
testAuditLogs();

// View audit statistics
showAuditStats();

// Clear all logs (careful!)
clearAuditLogs();
```

### **Step 5: Verify in SuperUser Dashboard**

1. **Go to SuperUser Dashboard**
2. **Click "Audit Logs" tab**
3. **Look for admin actions** with:

   - User: "AdminUser"
   - User Role: "admin"
   - Various admin actions listed above

4. **Test filtering**:
   - Filter by User: "AdminUser"
   - Filter by Action: "COMPANY_APPROVED"
   - Filter by Severity: "HIGH", "MEDIUM", etc.
   - Search for specific terms

## Expected Audit Log Structure

Each admin action should create an audit log entry with:

```json
{
  "id": "audit_1234567890_abc123",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "user": "AdminUser",
  "userRole": "admin",
  "action": "COMPANY_APPROVED",
  "entity": "Company Name",
  "entityId": "company-123",
  "details": "Admin changed company status to Approved. Reason: All documents verified",
  "severity": "MEDIUM",
  "metadata": {
    "previousStatus": "Pending",
    "newStatus": "Approved",
    "reason": "All documents verified",
    "email": "company@example.com",
    "adminAction": true,
    "actionTimestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

## Troubleshooting

### **If Admin Actions Aren't Logged:**

1. **Check console for errors**
2. **Verify localStorage is enabled**
3. **Make sure you're on the right dashboard**:

   - Admin actions log from `/admin/dashboard`
   - SuperUser actions log from `/superuser-dashboard`

4. **Try console commands**:

```javascript
// Check if audit storage is working
testAdminAuditLogs();

// Check localStorage
debugStorage();
```

### **If Logs Don't Appear in SuperUser Dashboard:**

1. **Refresh the audit logs tab**
2. **Clear filters** (set all to "All")
3. **Check if logs exist**:

```javascript
showAuditStats();
```

## Success Indicators

✅ **Admin login/logout attempts are logged**  
✅ **Company status changes by admin are captured**  
✅ **Admin dashboard navigation is tracked**  
✅ **Data exports are logged with details**
✅ **MDA admin creation is recorded**
✅ **All logs appear in SuperUser dashboard**
✅ **Filtering and search work correctly**
✅ **Export functionality works**
✅ **Console test commands work**

## Notes

- Admin audit logs are stored in the same localStorage as SuperUser logs
- Both admin and superuser actions appear in the same audit log interface
- User field distinguishes between "AdminUser" and "SuperUser"
- Severity levels help prioritize important actions
- All timestamps are in ISO format
- Metadata provides detailed context for each action
