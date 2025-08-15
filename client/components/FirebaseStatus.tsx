import { CheckCircle, Database, Info } from "lucide-react";

interface FirebaseStatusProps {
  variant?: "banner" | "badge" | "inline";
  showDetails?: boolean;
}

export default function FirebaseStatus({ 
  variant = "badge", 
  showDetails = false 
}: FirebaseStatusProps) {
  if (variant === "banner" && !hasFirebaseConfig) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Demo Mode Active
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                You're currently running in demo mode. Data is stored locally and will not persist between sessions.
              </p>
              {showDetails && (
                <div className="mt-2">
                  <p className="font-medium">To enable full functionality:</p>
                  <ul className="mt-1 list-disc list-inside space-y-1">
                    <li>Set up a Firebase project</li>
                    <li>Add Firebase configuration environment variables</li>
                    <li>Restart the application</li>
                  </ul>
                  <div className="mt-3">
                    <a
                      href="/firebase-setup"
                      className="inline-flex items-center text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
                    >
                      View setup guide →
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "badge") {
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
        hasFirebaseConfig 
          ? "bg-green-100 text-green-800" 
          : "bg-yellow-100 text-yellow-800"
      }`}>
        {hasFirebaseConfig ? (
          <>
            <CheckCircle className="w-3 h-3 mr-1" />
            Firebase Connected
          </>
        ) : (
          <>
            <AlertTriangle className="w-3 h-3 mr-1" />
            Demo Mode
          </>
        )}
      </span>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`flex items-center text-sm ${
        hasFirebaseConfig ? "text-green-600" : "text-yellow-600"
      }`}>
        {hasFirebaseConfig ? (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Firebase services active
          </>
        ) : (
          <>
            <Info className="w-4 h-4 mr-2" />
            Running in demo mode
          </>
        )}
      </div>
    );
  }

  return null;
}

// Export Firebase status for other components to use
export { hasFirebaseConfig };
