import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  writeBatch,
  increment
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { db, auth } from './firebase';
import { auditService } from './firestore';
import {
  MDA,
  MDAAdmin,
  MDAUser,
  CreateMDARequest,
  CreateMDAAdminRequest,
  CreateMDAUserRequest,
  EnhancedUserProfile,
  MDATender
} from '@shared/api';

class MDAFirestoreService {
  // MDA Operations
  async createMDA(data: CreateMDARequest, createdBy: string): Promise<MDA> {
    try {
      const mdaId = doc(collection(db, 'mdas')).id;
      const mda: MDA = {
        id: mdaId,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };

      await setDoc(doc(db, 'mdas', mdaId), {
        ...mda,
        createdAt: Timestamp.fromDate(mda.createdAt),
        updatedAt: Timestamp.fromDate(mda.updatedAt)
      });

      // Log the creation
      await auditService.log({
        userId: createdBy,
        userName: 'System Admin',
        action: 'MDA Created',
        entity: 'MDA',
        entityId: mdaId,
        details: `Created MDA: ${data.name} (${data.type})`
      });

      return mda;
    } catch (error) {
      console.error('Error creating MDA:', error);
      throw error;
    }
  }

  async getMDA(mdaId: string): Promise<MDA | null> {
    try {
      const mdaDoc = await getDoc(doc(db, 'mdas', mdaId));
      if (!mdaDoc.exists()) return null;

      const data = mdaDoc.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as MDA;
    } catch (error) {
      console.error('Error getting MDA:', error);
      throw error;
    }
  }

  async getAllMDAs(): Promise<MDA[]> {
    try {
      const mdaQuery = query(
        collection(db, 'mdas'),
        where('isActive', '==', true),
        orderBy('name')
      );
      
      const mdaDocs = await getDocs(mdaQuery);
      return mdaDocs.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as MDA;
      });
    } catch (error) {
      console.error('Error getting all MDAs:', error);
      throw error;
    }
  }

  async updateMDA(mdaId: string, updates: Partial<MDA>, updatedBy: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'mdas', mdaId), {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
      });

      await auditService.log({
        userId: updatedBy,
        userName: 'System Admin',
        action: 'MDA Updated',
        entity: 'MDA',
        entityId: mdaId,
        details: `Updated MDA settings`
      });
    } catch (error) {
      console.error('Error updating MDA:', error);
      throw error;
    }
  }

  // MDA Admin Operations
  async createMDAAdmin(data: CreateMDAAdminRequest, createdBy: string): Promise<MDAAdmin> {
    try {
      const batch = writeBatch(db);
      
      // Create Firebase Auth user with temporary password
      const tempPassword = this.generateTempPassword();
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, tempPassword);
      const userId = userCredential.user.uid;

      // Create user profile
      const userProfile: EnhancedUserProfile = {
        uid: userId,
        email: data.email,
        displayName: data.displayName,
        role: 'mda_admin',
        mdaId: data.mdaId,
        mdaRole: data.role,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        emailVerified: false
      };

      batch.set(doc(db, 'users', userId), {
        ...userProfile,
        createdAt: Timestamp.fromDate(userProfile.createdAt),
        lastLoginAt: Timestamp.fromDate(userProfile.lastLoginAt)
      });

      // Create MDA admin record
      const adminId = doc(collection(db, 'mda_admins')).id;
      const mdaAdmin: MDAAdmin = {
        id: adminId,
        mdaId: data.mdaId,
        userId: userId,
        role: data.role,
        permissions: data.permissions,
        assignedBy: createdBy,
        assignedAt: new Date(),
        isActive: true
      };

      batch.set(doc(db, 'mda_admins', adminId), {
        ...mdaAdmin,
        assignedAt: Timestamp.fromDate(mdaAdmin.assignedAt)
      });

      await batch.commit();

      // Send password reset email for initial setup
      await sendPasswordResetEmail(auth, data.email);

      // Log the creation
      await auditService.log({
        userId: createdBy,
        userName: 'System Admin',
        action: 'MDA Admin Created',
        entity: 'MDA Admin',
        entityId: adminId,
        details: `Created MDA Admin: ${data.displayName} for MDA: ${data.mdaId}`
      });

      return mdaAdmin;
    } catch (error) {
      console.error('Error creating MDA admin:', error);
      throw error;
    }
  }

  async getMDAAdmins(mdaId?: string): Promise<(MDAAdmin & { user: EnhancedUserProfile; mda: MDA })[]> {
    try {
      let adminQuery = query(collection(db, 'mda_admins'), where('isActive', '==', true));
      
      if (mdaId) {
        adminQuery = query(adminQuery, where('mdaId', '==', mdaId));
      }

      const adminDocs = await getDocs(adminQuery);
      const admins = await Promise.all(
        adminDocs.docs.map(async (adminDoc) => {
          const adminData = adminDoc.data() as Omit<MDAAdmin, 'assignedAt'> & { assignedAt: Timestamp };
          
          // Get user data
          const userDoc = await getDoc(doc(db, 'users', adminData.userId));
          const userData = userDoc.data() as Omit<EnhancedUserProfile, 'createdAt' | 'lastLoginAt'> & {
            createdAt: Timestamp;
            lastLoginAt: Timestamp;
          };

          // Get MDA data
          const mdaDoc = await getDoc(doc(db, 'mdas', adminData.mdaId));
          const mdaData = mdaDoc.data() as Omit<MDA, 'createdAt' | 'updatedAt'> & {
            createdAt: Timestamp;
            updatedAt: Timestamp;
          };

          return {
            ...adminData,
            assignedAt: adminData.assignedAt.toDate(),
            user: {
              ...userData,
              createdAt: userData.createdAt.toDate(),
              lastLoginAt: userData.lastLoginAt.toDate()
            },
            mda: {
              ...mdaData,
              createdAt: mdaData.createdAt.toDate(),
              updatedAt: mdaData.updatedAt.toDate()
            }
          };
        })
      );

      return admins;
    } catch (error) {
      console.error('Error getting MDA admins:', error);
      throw error;
    }
  }

  // MDA User Operations
  async createMDAUser(data: CreateMDAUserRequest, createdBy: string): Promise<MDAUser> {
    try {
      const batch = writeBatch(db);
      
      // Create Firebase Auth user with temporary password
      const tempPassword = this.generateTempPassword();
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, tempPassword);
      const userId = userCredential.user.uid;

      // Create user profile
      const userProfile: EnhancedUserProfile = {
        uid: userId,
        email: data.email,
        displayName: data.displayName,
        role: 'mda_user',
        mdaId: data.mdaId,
        mdaRole: data.role,
        department: data.department,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        emailVerified: false
      };

      batch.set(doc(db, 'users', userId), {
        ...userProfile,
        createdAt: Timestamp.fromDate(userProfile.createdAt),
        lastLoginAt: Timestamp.fromDate(userProfile.lastLoginAt)
      });

      // Create MDA user record
      const mdaUserId = doc(collection(db, 'mda_users')).id;
      const mdaUser: MDAUser = {
        id: mdaUserId,
        mdaId: data.mdaId,
        userId: userId,
        role: data.role,
        department: data.department,
        permissions: data.permissions,
        createdBy: createdBy,
        createdAt: new Date(),
        isActive: true
      };

      batch.set(doc(db, 'mda_users', mdaUserId), {
        ...mdaUser,
        createdAt: Timestamp.fromDate(mdaUser.createdAt)
      });

      await batch.commit();

      // Send password reset email for initial setup
      await sendPasswordResetEmail(auth, data.email);

      // Log the creation
      await auditService.log({
        userId: createdBy,
        userName: 'MDA Admin',
        action: 'MDA User Created',
        entity: 'MDA User',
        entityId: mdaUserId,
        details: `Created MDA User: ${data.displayName} (${data.role}) for MDA: ${data.mdaId}`
      });

      return mdaUser;
    } catch (error) {
      console.error('Error creating MDA user:', error);
      throw error;
    }
  }

  async getMDAUsers(mdaId: string): Promise<(MDAUser & { user: EnhancedUserProfile })[]> {
    try {
      const userQuery = query(
        collection(db, 'mda_users'),
        where('mdaId', '==', mdaId),
        where('isActive', '==', true)
      );

      const userDocs = await getDocs(userQuery);
      const users = await Promise.all(
        userDocs.docs.map(async (userDoc) => {
          const userData = userDoc.data() as Omit<MDAUser, 'createdAt'> & { createdAt: Timestamp };
          
          // Get user profile data
          const profileDoc = await getDoc(doc(db, 'users', userData.userId));
          const profileData = profileDoc.data() as Omit<EnhancedUserProfile, 'createdAt' | 'lastLoginAt'> & {
            createdAt: Timestamp;
            lastLoginAt: Timestamp;
          };

          return {
            ...userData,
            createdAt: userData.createdAt.toDate(),
            user: {
              ...profileData,
              createdAt: profileData.createdAt.toDate(),
              lastLoginAt: profileData.lastLoginAt.toDate()
            }
          };
        })
      );

      return users;
    } catch (error) {
      console.error('Error getting MDA users:', error);
      throw error;
    }
  }

  // Tender Operations
  async createTender(tender: Omit<MDATender, 'id' | 'createdAt' | 'updatedAt'>, createdBy: string): Promise<MDATender> {
    try {
      const tenderId = doc(collection(db, 'tenders')).id;
      const newTender: MDATender = {
        ...tender,
        id: tenderId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'tenders', tenderId), {
        ...newTender,
        publishDate: tender.publishDate ? Timestamp.fromDate(tender.publishDate) : null,
        closingDate: tender.closingDate ? Timestamp.fromDate(tender.closingDate) : null,
        createdAt: Timestamp.fromDate(newTender.createdAt),
        updatedAt: Timestamp.fromDate(newTender.updatedAt)
      });

      // Log the creation
      await auditService.log({
        userId: createdBy,
        userName: 'MDA User',
        action: 'Tender Created',
        entity: 'Tender',
        entityId: tenderId,
        details: `Created tender: ${tender.title} (₦${tender.estimatedValue.toLocaleString()})`
      });

      return newTender;
    } catch (error) {
      console.error('Error creating tender:', error);
      throw error;
    }
  }

  async getMDATenders(mdaId: string): Promise<MDATender[]> {
    try {
      const tenderQuery = query(
        collection(db, 'tenders'),
        where('mdaId', '==', mdaId),
        orderBy('createdAt', 'desc')
      );

      const tenderDocs = await getDocs(tenderQuery);
      return tenderDocs.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          publishDate: data.publishDate?.toDate() || null,
          closingDate: data.closingDate?.toDate() || null,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as MDATender;
      });
    } catch (error) {
      console.error('Error getting MDA tenders:', error);
      throw error;
    }
  }

  // Utility Functions
  private generateTempPassword(): string {
    return Math.random().toString(36).slice(-8) + 
           Math.random().toString(36).slice(-8).toUpperCase() + 
           Math.floor(Math.random() * 100);
  }

  // Dashboard Statistics
  async getMDAStats(mdaId: string): Promise<any> {
    try {
      const tenderQuery = query(
        collection(db, 'tenders'),
        where('mdaId', '==', mdaId)
      );
      const tenderDocs = await getDocs(tenderQuery);
      
      const tenders = tenderDocs.docs.map(doc => doc.data());
      const activeTenders = tenders.filter(t => t.status === 'published').length;
      const totalValue = tenders.reduce((sum, t) => sum + t.estimatedValue, 0);

      return {
        totalTenders: tenders.length,
        activeTenders,
        totalValue,
        averageProcessingTime: 14, // Calculate based on actual data
        successfulAwards: tenders.filter(t => t.status === 'awarded').length,
        pendingApprovals: tenders.filter(t => t.status === 'draft').length,
        monthlyTrends: [] // Calculate based on actual data
      };
    } catch (error) {
      console.error('Error getting MDA stats:', error);
      throw error;
    }
  }

  async getSystemStats(): Promise<any> {
    try {
      const [mdaDocs, adminDocs, userDocs, tenderDocs] = await Promise.all([
        getDocs(query(collection(db, 'mdas'), where('isActive', '==', true))),
        getDocs(query(collection(db, 'mda_admins'), where('isActive', '==', true))),
        getDocs(query(collection(db, 'mda_users'), where('isActive', '==', true))),
        getDocs(collection(db, 'tenders'))
      ]);

      const tenders = tenderDocs.docs.map(doc => doc.data());
      const totalValue = tenders.reduce((sum, t) => sum + t.estimatedValue, 0);

      return {
        totalMDAs: mdaDocs.size,
        activeMDAs: mdaDocs.size,
        totalAdmins: adminDocs.size,
        totalUsers: userDocs.size,
        systemWideStats: {
          totalTenders: tenders.length,
          totalValue,
          averageEfficiency: 85.5 // Calculate based on actual performance metrics
        },
        mdaPerformance: [] // Calculate based on actual MDA performance
      };
    } catch (error) {
      console.error('Error getting system stats:', error);
      throw error;
    }
  }
}

export const mdaFirestoreService = new MDAFirestoreService();
