const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();
const db = admin.firestore();

// Configure email transporter (use your email service)
const transporter = nodemailer.createTransporter({
  service: 'gmail', // or your email service
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.password
  }
});

/**
 * Cloud Function: Send welcome email to new MDA admin
 */
exports.sendMDAAdminWelcomeEmail = functions.firestore
  .document('mda_admins/{adminId}')
  .onCreate(async (snap, context) => {
    try {
      const adminData = snap.data();
      const adminId = context.params.adminId;

      // Get user details
      const userDoc = await db.collection('users').doc(adminData.userId).get();
      const userData = userDoc.data();

      // Get MDA details
      const mdaDoc = await db.collection('mdas').doc(adminData.mdaId).get();
      const mdaData = mdaDoc.data();

      const emailContent = {
        from: functions.config().email.from,
        to: userData.email,
        subject: `Welcome to KanoProc - MDA Administrator Access`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">Welcome to KanoProc</h2>
            
            <p>Dear ${userData.displayName},</p>
            
            <p>You have been assigned as an administrator for <strong>${mdaData.name}</strong> in the KanoProc e-procurement system.</p>
            
            <div style="background-color: #f0f9ff; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h3 style="color: #0369a1; margin-top: 0;">Your Access Details:</h3>
              <ul>
                <li><strong>MDA:</strong> ${mdaData.name}</li>
                <li><strong>Role:</strong> ${adminData.role === 'mda_super_admin' ? 'Super Administrator' : 'Administrator'}</li>
                <li><strong>Email:</strong> ${userData.email}</li>
              </ul>
            </div>
            
            <div style="background-color: #fef3c7; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h3 style="color: #92400e; margin-top: 0;">Next Steps:</h3>
              <ol>
                <li>Check your email for a password reset link</li>
                <li>Set up your new password</li>
                <li>Log in to KanoProc at: <a href="${functions.config().app.url}/login">KanoProc Portal</a></li>
                <li>Complete your profile setup</li>
              </ol>
            </div>
            
            <p>If you have any questions, please contact the system administrator or reply to this email.</p>
            
            <p>Best regards,<br>KanoProc Team</p>
          </div>
        `
      };

      await transporter.sendMail(emailContent);
      
      console.log(`Welcome email sent to MDA admin: ${userData.email}`);
    } catch (error) {
      console.error('Error sending MDA admin welcome email:', error);
    }
  });

/**
 * Cloud Function: Send welcome email to new MDA user
 */
exports.sendMDAUserWelcomeEmail = functions.firestore
  .document('mda_users/{userId}')
  .onCreate(async (snap, context) => {
    try {
      const userData = snap.data();
      const userId = context.params.userId;

      // Get user profile
      const userDoc = await db.collection('users').doc(userData.userId).get();
      const userProfile = userDoc.data();

      // Get MDA details
      const mdaDoc = await db.collection('mdas').doc(userData.mdaId).get();
      const mdaData = mdaDoc.data();

      const roleNames = {
        'procurement_officer': 'Procurement Officer',
        'evaluator': 'Evaluator',
        'accountant': 'Accountant',
        'viewer': 'Viewer'
      };

      const emailContent = {
        from: functions.config().email.from,
        to: userProfile.email,
        subject: `KanoProc Account Created - ${mdaData.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">Welcome to KanoProc</h2>
            
            <p>Dear ${userProfile.displayName},</p>
            
            <p>Your account has been created for the KanoProc e-procurement system.</p>
            
            <div style="background-color: #f0f9ff; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h3 style="color: #0369a1; margin-top: 0;">Account Details:</h3>
              <ul>
                <li><strong>Organization:</strong> ${mdaData.name}</li>
                <li><strong>Department:</strong> ${userData.department}</li>
                <li><strong>Role:</strong> ${roleNames[userData.role] || userData.role}</li>
                <li><strong>Email:</strong> ${userProfile.email}</li>
              </ul>
            </div>
            
            <div style="background-color: #f0fdf4; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h3 style="color: #15803d; margin-top: 0;">Your Permissions:</h3>
              <ul>
                ${userData.permissions.canCreateTenders ? '<li>✅ Create and manage tenders</li>' : ''}
                ${userData.permissions.canEvaluateBids ? '<li>✅ Evaluate bids and proposals</li>' : ''}
                ${userData.permissions.canViewFinancials ? '<li>✅ View financial information</li>' : ''}
                ${userData.permissions.canGenerateReports ? '<li>✅ Generate reports</li>' : ''}
              </ul>
            </div>
            
            <p>To access your account:</p>
            <ol>
              <li>Check your email for a password reset link</li>
              <li>Set up your password</li>
              <li>Log in at: <a href="${functions.config().app.url}/login">KanoProc Portal</a></li>
            </ol>
            
            <p>Best regards,<br>KanoProc Team</p>
          </div>
        `
      };

      await transporter.sendMail(emailContent);
      
      console.log(`Welcome email sent to MDA user: ${userProfile.email}`);
    } catch (error) {
      console.error('Error sending MDA user welcome email:', error);
    }
  });

/**
 * Cloud Function: Update MDA statistics
 */
exports.updateMDAStatistics = functions.pubsub
  .schedule('0 2 * * *') // Run daily at 2 AM
  .onRun(async (context) => {
    try {
      const mdas = await db.collection('mdas').where('isActive', '==', true).get();
      
      for (const mdaDoc of mdas.docs) {
        const mdaId = mdaDoc.id;
        
        // Calculate tender statistics
        const tenders = await db.collection('tenders').where('mdaId', '==', mdaId).get();
        const tenderData = tenders.docs.map(doc => doc.data());
        
        const stats = {
          totalTenders: tenderData.length,
          activeTenders: tenderData.filter(t => t.status === 'published').length,
          totalValue: tenderData.reduce((sum, t) => sum + (t.estimatedValue || 0), 0),
          successfulAwards: tenderData.filter(t => t.status === 'awarded').length,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        };
        
        // Update MDA statistics
        await db.collection('mda_statistics').doc(mdaId).set(stats, { merge: true });
      }
      
      console.log('MDA statistics updated successfully');
    } catch (error) {
      console.error('Error updating MDA statistics:', error);
    }
  });

/**
 * Cloud Function: Validate MDA admin permissions
 */
exports.validateMDAAdminAction = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { action, mdaId, targetUserId } = data;
  const userId = context.auth.uid;

  try {
    // Get user's profile
    const userDoc = await db.collection('users').doc(userId).get();
    const userProfile = userDoc.data();

    // Check if user is superuser (always allowed)
    if (userProfile.role === 'superuser') {
      return { allowed: true, reason: 'Superuser access' };
    }

    // Check if user is MDA admin for the specified MDA
    if (userProfile.role !== 'mda_admin' || userProfile.mdaId !== mdaId) {
      return { allowed: false, reason: 'Insufficient permissions' };
    }

    // Get admin record to check specific permissions
    const adminQuery = await db.collection('mda_admins')
      .where('userId', '==', userId)
      .where('mdaId', '==', mdaId)
      .where('isActive', '==', true)
      .get();

    if (adminQuery.empty) {
      return { allowed: false, reason: 'Admin record not found' };
    }

    const adminData = adminQuery.docs[0].data();

    // Check specific permissions based on action
    switch (action) {
      case 'create_user':
        return { 
          allowed: adminData.permissions.canCreateUsers, 
          reason: adminData.permissions.canCreateUsers ? 'Permission granted' : 'Cannot create users' 
        };
      
      case 'manage_settings':
        return { 
          allowed: adminData.permissions.canManageSettings, 
          reason: adminData.permissions.canManageSettings ? 'Permission granted' : 'Cannot manage settings' 
        };
      
      case 'approve_contract':
        return { 
          allowed: adminData.permissions.canApproveContracts, 
          reason: adminData.permissions.canApproveContracts ? 'Permission granted' : 'Cannot approve contracts' 
        };
      
      default:
        return { allowed: false, reason: 'Unknown action' };
    }
  } catch (error) {
    console.error('Error validating MDA admin action:', error);
    throw new functions.https.HttpsError('internal', 'Internal server error');
  }
});

/**
 * Cloud Function: Send tender notifications
 */
exports.sendTenderNotifications = functions.firestore
  .document('tenders/{tenderId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    // Check if tender status changed to published
    if (before.status !== 'published' && after.status === 'published') {
      try {
        // Get MDA details
        const mdaDoc = await db.collection('mdas').doc(after.mdaId).get();
        const mdaData = mdaDoc.data();
        
        // Get all MDA users who should be notified
        const mdaUsers = await db.collection('mda_users')
          .where('mdaId', '==', after.mdaId)
          .where('isActive', '==', true)
          .get();
        
        const notifications = [];
        
        for (const userDoc of mdaUsers.docs) {
          const userData = userDoc.data();
          
          // Get user profile for email
          const profileDoc = await db.collection('users').doc(userData.userId).get();
          const profile = profileDoc.data();
          
          notifications.push({
            to: profile.email,
            subject: `New Tender Published - ${after.title}`,
            html: `
              <h3>New Tender Published</h3>
              <p><strong>Title:</strong> ${after.title}</p>
              <p><strong>MDA:</strong> ${mdaData.name}</p>
              <p><strong>Estimated Value:</strong> ₦${after.estimatedValue.toLocaleString()}</p>
              <p><strong>Closing Date:</strong> ${after.closingDate ? new Date(after.closingDate.seconds * 1000).toLocaleDateString() : 'TBD'}</p>
              <p><a href="${functions.config().app.url}/mda/${after.mdaId}/dashboard">View in Dashboard</a></p>
            `
          });
        }
        
        // Send all notifications
        await Promise.all(notifications.map(notification => transporter.sendMail({
          from: functions.config().email.from,
          ...notification
        })));
        
        console.log(`Tender notifications sent for: ${after.title}`);
      } catch (error) {
        console.error('Error sending tender notifications:', error);
      }
    }
  });
