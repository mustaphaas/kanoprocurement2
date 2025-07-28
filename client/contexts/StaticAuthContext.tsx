import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  email: string;
  uid: string;
}

interface UserProfile {
  role: 'admin' | 'superuser' | 'company';
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Helper function to determine role based on email/username
const determineUserRole = (email: string): UserProfile => {
  const lowerEmail = email.toLowerCase();

  if (lowerEmail.includes('admin') || lowerEmail.includes('administrator')) {
    return {
      role: 'admin',
      email: email,
      name: 'System Administrator'
    };
  }

  if (lowerEmail.includes('super') || lowerEmail.includes('superuser')) {
    return {
      role: 'superuser',
      email: email,
      name: 'Super User'
    };
  }

  // Default to company role
  return {
    role: 'company',
    email: email,
    name: 'Company Representative',
    companyName: 'Demo Company Ltd'
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    setLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demo purposes, accept any credentials as long as they're not empty
    if (email.trim() && password.trim()) {
      const mockUser = { email, uid: `demo-${Date.now()}` };
      const profile = determineUserRole(email);

      setUser(mockUser);
      setUserProfile(profile);
    } else {
      throw new Error('Email and password are required');
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
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'superuser' | 'company';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, userProfile, loading } = useAuth();

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
            <p className="mt-2 text-gray-600">Please sign in to access this page.</p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
              <p><strong>Demo Mode:</strong></p>
              <p>Use any email/username and password to login</p>
              <p>• Include "admin" for admin access</p>
              <p>• Include "super" for superuser access</p>
              <p>• Any other email for company access</p>
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
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
