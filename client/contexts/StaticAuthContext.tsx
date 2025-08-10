import React, { createContext, useContext, useState, ReactNode } from "react";

interface User {
  email: string;
  uid: string;
}

interface UserProfile {
  role: "admin" | "superuser" | "company" | "ministry";
  email: string;
  name: string;
  companyName?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Static demo credentials for testing functions
const demoCredentials: Record<
  string,
  { password: string; profile: UserProfile }
> = {
  admin: {
    password: "admin123",
    profile: {
      role: "admin",
      email: "admin@kanoproc.gov.ng",
      name: "System Administrator",
    },
  },
  superuser: {
    password: "superuser123",
    profile: {
      role: "superuser",
      email: "superuser@kanoproc.gov.ng",
      name: "Super User",
    },
  },
  // Test company users for superuser testing
  "approved@company.com": {
    password: "password123",
    profile: {
      role: "company",
      email: "approved@company.com",
      name: "Approved Test Company",
      companyName: "Approved Test Ltd",
    },
  },
  "testcompany@example.com": {
    password: "test123",
    profile: {
      role: "company",
      email: "testcompany@example.com",
      name: "Test Company Representative",
      companyName: "Test Company Ltd",
    },
  },
  "demo@company.com": {
    password: "demo123",
    profile: {
      role: "company",
      email: "demo@company.com",
      name: "Demo Company User",
      companyName: "Demo Company Ltd",
    },
  },
  // Company Approval Status - Pending
  "pending@company.com": {
    password: "password123",
    profile: {
      role: "company",
      email: "pending@company.com",
      name: "Pending Approval Company",
      companyName: "Pending Test Ltd",
    },
  },
  // Company Status - Suspended
  "suspended@company.com": {
    password: "password123",
    profile: {
      role: "company",
      email: "suspended@company.com",
      name: "Suspended Company",
      companyName: "Suspended Test Ltd",
    },
  },
  // Company Status - Blacklisted
  "blacklisted@company.com": {
    password: "password123",
    profile: {
      role: "company",
      email: "blacklisted@company.com",
      name: "Blacklisted Company",
      companyName: "Blacklisted Test Ltd",
    },
  },
};

// Helper function to determine role for company logins
const determineCompanyRole = (email: string): UserProfile => {
  // Allow specific test company emails for testing different statuses
  const testCompanyEmails = [
    "approved@company.com",
    "testcompany@example.com",
    "demo@company.com",
    "pending@company.com",
    "suspended@company.com",
    "blacklisted@company.com",
  ];

  if (testCompanyEmails.includes(email)) {
    // Return specific profile based on email
    const emailToProfile: Record<
      string,
      Omit<UserProfile, "role" | "email">
    > = {
      "approved@company.com": {
        name: "Approved Test Company",
        companyName: "Approved Test Ltd",
      },
      "testcompany@example.com": {
        name: "Test Company Representative",
        companyName: "Test Company Ltd",
      },
      "demo@company.com": {
        name: "Demo Company User",
        companyName: "Demo Company Ltd",
      },
      "pending@company.com": {
        name: "Pending Approval Company",
        companyName: "Pending Test Ltd",
      },
      "suspended@company.com": {
        name: "Suspended Company",
        companyName: "Suspended Test Ltd",
      },
      "blacklisted@company.com": {
        name: "Blacklisted Company",
        companyName: "Blacklisted Test Ltd",
      },
    };

    return {
      role: "company",
      email: email,
      ...emailToProfile[email],
    };
  }

  // Default for any other company email
  return {
    role: "company",
    email: email,
    name: "Company Representative",
    companyName: "Generic Company Ltd",
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    setLoading(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check for specific admin/superuser credentials
    const demoUser = demoCredentials[email];
    if (demoUser && demoUser.password === password) {
      const mockUser = {
        email: demoUser.profile.email,
        uid: `demo-${Date.now()}`,
      };
      setUser(mockUser);
      setUserProfile(demoUser.profile);
    } else if (email.trim() && password.trim() && email.includes("@")) {
      // For company logins, accept any valid email/password
      const mockUser = { email, uid: `demo-${Date.now()}` };
      const profile = determineCompanyRole(email);

      setUser(mockUser);
      setUserProfile(profile);
    } else {
      throw new Error("Invalid username or password");
    }

    setLoading(false);
  };

  const signOut = async () => {
    setUser(null);
    setUserProfile(null);
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "superuser" | "company" | "ministry";
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user, userProfile, loading } = useAuth();

  // Handle ministry authentication separately (uses localStorage)
  if (requiredRole === "ministry") {
    const ministryUser = localStorage.getItem("ministryUser");
    if (!ministryUser) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8 p-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">
                Access Denied
              </h2>
              <p className="mt-2 text-gray-600">
                Please sign in to access this page.
              </p>
              <div className="mt-4 p-4 bg-orange-50 rounded-lg text-sm text-orange-700">
                <p>
                  <strong>
                    Ministry Demo Credentials (Password: ministry123):
                  </strong>
                </p>
                <div className="space-y-1 mt-2">
                  <p>
                    Ministry of Health: <code>ministry</code>
                  </p>
                  <p>
                    Ministry of Works: <code>ministry2</code>
                  </p>
                  <p>
                    Ministry of Education: <code>ministry3</code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    try {
      const parsedUser = JSON.parse(ministryUser);
      if (parsedUser.role !== "ministry") {
        throw new Error("Invalid ministry role");
      }
    } catch {
      localStorage.removeItem("ministryUser");
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8 p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Session Invalid
            </h2>
            <p className="text-gray-600">Please sign in again.</p>
          </div>
        </div>
      );
    }

    return <>{children}</>;
  }

  // Handle regular auth context authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Access Denied</h2>
            <p className="mt-2 text-gray-600">
              Please sign in to access this page.
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
              <p>
                <strong>Test Credentials for Superuser:</strong>
              </p>
              <p>
                Admin: username <code>admin</code> / password{" "}
                <code>admin123</code>
              </p>
              <p>
                Super User: username <code>superuser</code> / password{" "}
                <code>superuser123</code>
              </p>
              <p className="mt-2">
                <strong>Company Approval Status:</strong>
              </p>
              <p>
                ✅ <code>approved@company.com</code> / <code>password123</code>
              </p>
              <p>
                ✅ <code>testcompany@example.com</code> / <code>test123</code>
              </p>
              <p>
                ✅ <code>demo@company.com</code> / <code>demo123</code>
              </p>
              <p>
                ⏳ <code>pending@company.com</code> / <code>password123</code>
              </p>
              <p className="mt-2">
                <strong>Company Status:</strong>
              </p>
              <p>
                ⚠️ <code>suspended@company.com</code> / <code>password123</code>
              </p>
              <p>
                ❌ <code>blacklisted@company.com</code> /{" "}
                <code>password123</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (requiredRole && userProfile.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
