import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import authService, { UserProfile, AuthContextType } from '@/lib/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user, profile) => {
      setUser(user);
      setUserProfile(profile);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      const profile = await authService.signIn(email, password);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    profileData: Partial<UserProfile>
  ): Promise<UserProfile> => {
    setLoading(true);
    try {
      const profile = await authService.signUp(email, password, profileData);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    try {
      await authService.signOut();
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    await authService.resetPassword(email);
  };

  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (user) {
      await authService.updateUserProfile(user.uid, updates);
      // Update local state
      if (userProfile) {
        setUserProfile({ ...userProfile, ...updates });
      }
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// HOC for protecting routes
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'company' | 'admin' | 'superuser' | 'mda_admin' | 'mda_user';
  requiredMDAId?: string; // For MDA-specific routes
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredMDAId,
  fallback = <div>Access Denied</div>
}) => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user || !userProfile) {
    // Redirect to login
    window.location.href = '/login';
    return null;
  }

  // Check role requirement
  if (requiredRole && userProfile.role !== requiredRole && userProfile.role !== 'superuser') {
    return <>{fallback}</>;
  }

  // Check MDA access requirement
  if (requiredMDAId && !authService.hasAccessToMDA(userProfile, requiredMDAId)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Hook for checking roles
export const useRole = () => {
  const { userProfile } = useAuth();

  return {
    isCompany: userProfile?.role === 'company',
    isAdmin: userProfile?.role === 'admin' || userProfile?.role === 'superuser',
    isSuperUser: userProfile?.role === 'superuser',
    isMDAAdmin: userProfile?.role === 'mda_admin',
    isMDAUser: userProfile?.role === 'mda_user',
    isMDASuperAdmin: userProfile?.role === 'mda_admin' && userProfile?.mdaRole === 'mda_super_admin',
    role: userProfile?.role,
    mdaRole: userProfile?.mdaRole,
    mdaId: userProfile?.mdaId,
    department: userProfile?.department,
    permissions: authService.getUserPermissions(userProfile),
    hasAccessToMDA: (mdaId: string) => authService.hasAccessToMDA(userProfile, mdaId),
    canManageMDASettings: () => authService.canManageMDASettings(userProfile),
    canCreateMDAUsers: () => authService.canCreateMDAUsers(userProfile)
  };
};

// Hook for checking if user is authenticated
export const useAuthState = () => {
  const { user, userProfile, loading } = useAuth();

  return {
    isAuthenticated: !!user && !!userProfile,
    isLoading: loading,
    user,
    userProfile
  };
};
