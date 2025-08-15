import { CheckCircle, Database, Info } from "lucide-react";

interface FirebaseStatusProps {
  variant?: "banner" | "badge" | "inline";
  showDetails?: boolean;
}

export default function FirebaseStatus({
  variant = "badge",
  showDetails = false
}: FirebaseStatusProps) {
  // Check if localStorage is available
  const hasLocalStorage = typeof Storage !== "undefined";

  if (variant === "banner") {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Database className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              LocalStorage Data Storage Active
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Your MDA data is stored locally in your browser. Changes persist across sessions.
              </p>
              {showDetails && (
                <div className="mt-2">
                  <p className="font-medium">Current storage features:</p>
                  <ul className="mt-1 list-disc list-inside space-y-1">
                    <li>Data persists in your browser</li>
                    <li>Fast local performance</li>
                    <li>No network dependency required</li>
                    <li>Export/import functionality available</li>
                  </ul>
                  <div className="mt-3">
                    <p className="text-xs text-blue-600">
                      💡 All MDA management features are fully functional with localStorage
                    </p>
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
      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
        <Database className="w-3 h-3 mr-1" />
        LocalStorage Active
      </span>
    );
  }

  if (variant === "inline") {
    return (
      <div className="flex items-center text-sm text-blue-600">
        <CheckCircle className="w-4 h-4 mr-2" />
        LocalStorage data storage active
      </div>
    );
  }

  return null;
}

// Export Firebase status for other components to use
export { hasFirebaseConfig };
