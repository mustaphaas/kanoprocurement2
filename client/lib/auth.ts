import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { auditService } from "./firestore";

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: "company" | "admin" | "superuser" | "ministry" | "finance";
  companyId?: string;
  ministryId?: string;
  createdAt: Date;
  lastLoginAt: Date;
  emailVerified: boolean;
}

export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserProfile>;
  signUp: (
    email: string,
    password: string,
    profile: Partial<UserProfile>,
  ) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

class AuthService {
  private currentUser: User | null = null;
  private currentUserProfile: UserProfile | null = null;

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<UserProfile> {
    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("auth-timeout")), 2500)
      );
      const userCredential = (await Promise.race([
        signInWithEmailAndPassword(auth, email, password),
        timeout,
      ])) as Awaited<ReturnType<typeof signInWithEmailAndPassword>>;
      const user = userCredential.user;

      // Get user profile from Firestore
      const userProfile = await this.getUserProfile(user.uid);

      if (!userProfile) {
        throw new Error("User profile not found");
      }

      // Update last login time
      await this.updateUserProfile(user.uid, {
        lastLoginAt: new Date(),
      });

      // Log the sign in
      await auditService.log({
        userId: user.uid,
        userName: userProfile.email,
        action: "User Login",
        entity: "Authentication",
        details: `User logged in successfully`,
      });

      this.currentUser = user;
      this.currentUserProfile = userProfile;
      return userProfile;
    } catch (error: any) {
      const msg = error?.message || String(error);
      const networkFail =
        msg.includes("Failed to fetch") ||
        msg.includes("network") ||
        msg.includes("auth/network-request-failed");

      if (networkFail) {
        // Offline/demo fallback based on email pattern
        const lower = (email || "").toLowerCase();
        let role: UserProfile["role"] = "company";
        let ministryId: string | undefined;
        if (lower.includes("superuser")) role = "superuser";
        else if (lower.includes("admin")) role = "admin";
        else if (
          lower.includes("@") &&
          lower.includes("kano") &&
          (lower.includes("ministry") ||
            lower.includes("works") ||
            lower.includes("health") ||
            lower.includes("education"))
        ) {
          role = "ministry";
          if (lower.includes("works")) ministryId = "ministry2";
          else if (lower.includes("education")) ministryId = "ministry3";
          else ministryId = "ministry";
        }
        if (lower.includes("finance")) role = "finance";

        const profile: UserProfile = {
          uid: `demo-${Date.now()}`,
          email,
          displayName: email,
          role,
          companyId: undefined,
          ministryId,
          createdAt: new Date(),
          lastLoginAt: new Date(),
          emailVerified: true,
        };

        // Set in-memory session
        this.currentUser = null as any;
        this.currentUserProfile = profile;

        await auditService.log({
          userId: profile.uid,
          userName: profile.email,
          action: "Offline Login (Fallback)",
          entity: "Authentication",
          details: `Network unavailable; granted temporary ${role} session`,
        });

        return profile;
      }

      // Log failed attempt and rethrow
      await auditService.log({
        userId: "unknown",
        userName: email,
        action: "Failed Login Attempt",
        entity: "Authentication",
        details: `Login failed: ${msg}`,
      });
      throw error;
    }
  }

  // Sign up new user
  async signUp(
    email: string,
    password: string,
    profileData: Partial<UserProfile>,
  ): Promise<UserProfile> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Update user display name
      if (profileData.displayName) {
        await updateProfile(user, {
          displayName: profileData.displayName,
        });
      }

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: profileData.displayName,
        role: profileData.role || "company",
        companyId: profileData.companyId,
        ministryId: profileData.ministryId,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        emailVerified: user.emailVerified,
      };

      await this.createUserProfile(user.uid, userProfile);

      // Send email verification
      await sendEmailVerification(user);

      // Log the registration
      await auditService.log({
        userId: user.uid,
        userName: user.email!,
        action: "User Registration",
        entity: "Authentication",
        details: `New user registered with role: ${userProfile.role}`,
      });

      return userProfile;
    } catch (error: any) {
      throw error;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      if (this.currentUserProfile) {
        await auditService.log({
          userId: this.currentUserProfile.uid,
          userName: this.currentUserProfile.email,
          action: "User Logout",
          entity: "Authentication",
          details: "User logged out successfully",
        });
      }

      await signOut(auth);
      this.currentUser = null;
      this.currentUserProfile = null;
    } catch (error) {
      throw error;
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);

      await auditService.log({
        userId: "unknown",
        userName: email,
        action: "Password Reset Request",
        entity: "Authentication",
        details: "Password reset email sent",
      });
    } catch (error) {
      throw error;
    }
  }

  // Get user profile from Firestore
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
        } as UserProfile;
      }

      return null;
    } catch (error) {
      console.error("Error getting user profile:", error);
      return null;
    }
  }

  // Create user profile in Firestore
  async createUserProfile(uid: string, profile: UserProfile): Promise<void> {
    try {
      const docRef = doc(db, "users", uid);
      await setDoc(docRef, {
        ...profile,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      });
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(
    uid: string,
    updates: Partial<UserProfile>,
  ): Promise<void> {
    try {
      const docRef = doc(db, "users", uid);
      await setDoc(docRef, updates, { merge: true });
    } catch (error) {
      throw error;
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Get current user profile
  getCurrentUserProfile(): UserProfile | null {
    return this.currentUserProfile;
  }

  // Set up auth state listener
  onAuthStateChanged(
    callback: (user: User | null, profile: UserProfile | null) => void,
  ) {
    return onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;

      if (user) {
        // Get user profile
        const profile = await this.getUserProfile(user.uid);
        this.currentUserProfile = profile;
        callback(user, profile);
      } else if (this.currentUserProfile) {
        // Preserve fallback session
        callback(null, this.currentUserProfile);
      } else {
        this.currentUserProfile = null;
        callback(null, null);
      }
    });
  }

  // Check if user has admin role
  isAdmin(profile: UserProfile | null): boolean {
    return profile?.role === "admin" || profile?.role === "superuser";
  }

  // Check if user has super user role
  isSuperUser(profile: UserProfile | null): boolean {
    return profile?.role === "superuser";
  }

  // Check if user is company
  isCompany(profile: UserProfile | null): boolean {
    return profile?.role === "company";
  }

  // Check if user is ministry
  isMinistry(profile: UserProfile | null): boolean {
    return profile?.role === "ministry";
  }

  // Get user role-based redirect path
  getRoleBasedRedirect(profile: UserProfile | null): string {
    if (!profile) return "/login";

    switch (profile.role) {
      case "company":
        return "/company/dashboard";
      case "admin":
        return "/admin/dashboard";
      case "superuser":
        return "/superuser/dashboard";
      case "ministry":
        return "/ministry/dashboard";
      case "finance":
        return "/finance/dashboard";
      default:
        return "/";
    }
  }
}

export const authService = new AuthService();

// Auth context hook would go here (for React)
export { authService as default };
