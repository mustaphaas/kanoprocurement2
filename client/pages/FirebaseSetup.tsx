import { Link } from "react-router-dom";
import { hasFirebaseConfig } from "@/lib/firebase";
import FirebaseStatus from "@/components/FirebaseStatus";
import {
  ArrowLeft,
  CheckCircle,
  Copy,
  ExternalLink,
  FileText,
  Settings,
  Database,
  Shield,
  Globe,
} from "lucide-react";

export default function FirebaseSetup() {
  const envTemplate = `# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/superuser/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Firebase Setup Guide
          </h1>
          <p className="text-gray-600">
            Configure Firebase to enable full application functionality
          </p>

          <div className="mt-4">
            <FirebaseStatus variant="inline" />
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Current Status
          </h2>

          {hasFirebaseConfig ? (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">
                Firebase is configured and active
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              <FirebaseStatus variant="banner" showDetails={false} />
              <div className="text-sm text-gray-600">
                <p>
                  <strong>Current limitations in demo mode:</strong>
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Data is stored locally and will not persist</li>
                  <li>Real-time updates are not available</li>
                  <li>User authentication is simulated</li>
                  <li>File uploads are not supported</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Setup Steps */}
        <div className="space-y-8">
          {/* Step 1 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-medium">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Create Firebase Project
              </h3>
            </div>

            <div className="ml-11 space-y-3">
              <p className="text-gray-600">
                Create a new Firebase project in the Firebase Console
              </p>
              <a
                href="https://console.firebase.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Open Firebase Console
              </a>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-medium">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Enable Firebase Services
              </h3>
            </div>

            <div className="ml-11 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center p-3 border rounded-lg">
                  <Shield className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <div className="font-medium">Authentication</div>
                    <div className="text-sm text-gray-600">
                      Enable Email/Password
                    </div>
                  </div>
                </div>

                <div className="flex items-center p-3 border rounded-lg">
                  <Database className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <div className="font-medium">Firestore Database</div>
                    <div className="text-sm text-gray-600">Production mode</div>
                  </div>
                </div>

                <div className="flex items-center p-3 border rounded-lg">
                  <FileText className="h-5 w-5 text-purple-600 mr-3" />
                  <div>
                    <div className="font-medium">Storage</div>
                    <div className="text-sm text-gray-600">
                      For file uploads
                    </div>
                  </div>
                </div>

                <div className="flex items-center p-3 border rounded-lg">
                  <Globe className="h-5 w-5 text-orange-600 mr-3" />
                  <div>
                    <div className="font-medium">Hosting</div>
                    <div className="text-sm text-gray-600">For deployment</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-medium">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Get Configuration
              </h3>
            </div>

            <div className="ml-11 space-y-3">
              <p className="text-gray-600">
                Add a web app to your Firebase project and copy the
                configuration
              </p>
              <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                <li>Go to Project Settings (gear icon)</li>
                <li>Scroll to "Your apps" section</li>
                <li>Click "Web app" ({"</>"}) to create a web app</li>
                <li>Register app with name "KanoProc Portal"</li>
                <li>Copy the configuration object</li>
              </ol>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-medium">4</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Configure Environment Variables
              </h3>
            </div>

            <div className="ml-11 space-y-4">
              <p className="text-gray-600">
                Add your Firebase configuration to the environment variables
              </p>

              <div className="bg-gray-900 text-gray-100 rounded-lg p-4 relative">
                <button
                  onClick={() => copyToClipboard(envTemplate)}
                  className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white"
                  title="Copy to clipboard"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <pre className="text-sm overflow-x-auto">
                  <code>{envTemplate}</code>
                </pre>
              </div>

              <div className="text-sm text-gray-600">
                <p>
                  <strong>Note:</strong> Replace the placeholder values with
                  your actual Firebase configuration values.
                </p>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Restart Application
              </h3>
            </div>

            <div className="ml-11 space-y-3">
              <p className="text-gray-600">
                After setting up the environment variables, restart the
                application to enable Firebase services.
              </p>
              <div className="bg-gray-100 rounded-lg p-3">
                <code className="text-sm">npm run dev</code>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Need Help?
          </h3>
          <p className="text-blue-800 mb-4">
            For detailed setup instructions, see the Firebase setup
            documentation.
          </p>
          <div className="flex space-x-4">
            <a
              href="/FIREBASE_SETUP.md"
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <FileText className="h-4 w-4 mr-1" />
              Detailed Setup Guide
            </a>
            <a
              href="https://firebase.google.com/docs/web/setup"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Firebase Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
