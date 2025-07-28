import { useAuth } from '@/contexts/StaticAuthContext';

export default function AppStatus() {
  const { user, userProfile } = useAuth();

  if (import.meta.env.PROD) {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="font-semibold text-sm mb-2">📱 App Status</h3>
      
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span>Mode:</span>
          <span className="text-green-600 font-medium">Static Demo</span>
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
          <div>📊 Demo Data Available:</div>
          <div className="ml-2">
            <div>✓ Sample Tenders</div>
            <div>✓ Company Profiles</div>
            <div>✓ Admin Functions</div>
          </div>
        </div>
      </div>
      
      <div className="mt-2 pt-2 border-t text-xs text-gray-500">
        Environment: {import.meta.env.DEV ? 'Development' : 'Production'}
      </div>

      {!user && (
        <div className="mt-2 pt-2 border-t text-xs text-blue-600">
          <div><strong>Demo Login:</strong></div>
          <div>admin@kanoproc.gov.ng</div>
          <div>company@example.com</div>
        </div>
      )}
    </div>
  );
}
