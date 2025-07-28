import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';

interface FirebaseStatus {
  auth: 'connected' | 'error' | 'loading';
  firestore: 'connected' | 'error' | 'loading';
  userCount: number;
  tenderCount: number;
  companyCount: number;
}

export default function FirebaseStatus() {
  const { user, userProfile, loading } = useAuth();
  const [status, setStatus] = useState<FirebaseStatus>({
    auth: 'loading',
    firestore: 'loading',
    userCount: 0,
    tenderCount: 0,
    companyCount: 0
  });

  useEffect(() => {
    const checkFirebaseStatus = async () => {
      try {
        // Check Firestore connection
        const usersQuery = query(collection(db, 'users'), limit(1));
        const tendersQuery = query(collection(db, 'tenders'), limit(1));
        const companiesQuery = query(collection(db, 'companies'), limit(1));

        const [usersSnap, tendersSnap, companiesSnap] = await Promise.all([
          getDocs(usersQuery),
          getDocs(tendersQuery),
          getDocs(companiesQuery)
        ]);

        setStatus({
          auth: user ? 'connected' : 'error',
          firestore: 'connected',
          userCount: usersSnap.size,
          tenderCount: tendersSnap.size,
          companyCount: companiesSnap.size
        });
      } catch (error) {
        console.error('Firebase status check failed:', error);
        setStatus(prev => ({
          ...prev,
          auth: user ? 'connected' : 'error',
          firestore: 'error'
        }));
      }
    };

    if (!loading) {
      checkFirebaseStatus();
    }
  }, [user, loading]);

  if (import.meta.env.PROD) {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="font-semibold text-sm mb-2">🔥 Firebase Status</h3>
      
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span>Authentication:</span>
          <StatusIndicator status={status.auth} />
        </div>
        
        <div className="flex items-center justify-between">
          <span>Firestore:</span>
          <StatusIndicator status={status.firestore} />
        </div>
        
        {user && (
          <div className="pt-2 border-t">
            <div className="text-green-600 font-medium">
              👤 {userProfile?.role || 'Unknown Role'}
            </div>
            <div className="text-gray-600">
              {user.email}
            </div>
          </div>
        )}
        
        <div className="pt-2 border-t">
          <div>📊 Data Count:</div>
          <div className="ml-2">
            <div>Users: {status.userCount}</div>
            <div>Tenders: {status.tenderCount}</div>
            <div>Companies: {status.companyCount}</div>
          </div>
        </div>
      </div>
      
      <div className="mt-2 pt-2 border-t text-xs text-gray-500">
        Environment: {import.meta.env.DEV ? 'Development' : 'Production'}
      </div>
    </div>
  );
}

function StatusIndicator({ status }: { status: 'connected' | 'error' | 'loading' }) {
  const colors = {
    connected: 'bg-green-500',
    error: 'bg-red-500',
    loading: 'bg-yellow-500'
  };

  const labels = {
    connected: '✓',
    error: '✗',
    loading: '...'
  };

  return (
    <div className="flex items-center space-x-1">
      <div className={`w-2 h-2 rounded-full ${colors[status]}`}></div>
      <span>{labels[status]}</span>
    </div>
  );
}
