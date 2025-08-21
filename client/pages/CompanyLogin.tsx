import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/StaticAuthContext";
import { logUserAction } from "@/lib/auditLogStorage";
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  UserCheck,
} from "lucide-react";

interface LoginData {
  email: string;
  password: string;
}

export default function CompanyLogin() {
  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await signIn(formData.email, formData.password);

      // Log successful company login
      logUserAction(
        formData.email.toLowerCase(),
        "company_user",
        "COMPANY_LOGIN_SUCCESS",
        "Company Portal",
        `Company user ${formData.email} successfully logged in`,
        "LOW",
        undefined,
        {
          loginTime: new Date().toISOString(),
          userAgent: navigator.userAgent,
          loginMethod: "credentials",
          email: formData.email.toLowerCase(),
        },
      );

      navigate("/company/dashboard");
    } catch (error) {
      // Log failed company login attempt
      logUserAction(
        formData.email.toLowerCase() || "Unknown",
        "anonymous",
        "COMPANY_LOGIN_FAILED",
        "Company Portal",
        `Failed company login attempt for user: ${formData.email}`,
        "MEDIUM",
        undefined,
        {
          attemptTime: new Date().toISOString(),
          userAgent: navigator.userAgent,
          errorMessage: error instanceof Error ? error.message : "Login failed",
          email: formData.email.toLowerCase(),
          ipAddress: "127.0.0.1",
        },
      );

      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Login failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fillTestAccount = (email: string, password: string) => {
    setFormData({ email, password });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-700 rounded-lg flex items-center justify-center">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-700">KanoProc</h1>
              <p className="text-sm text-gray-600">Company Portal</p>
            </div>
          </div>
        </Link>

        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Company Login
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Access your company account to view tenders and submit bids
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {errors.general}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Company Email Address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your company email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-green-600 hover:text-green-500"
                >
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign in to Company Account"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  New to KanoProc?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/register"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-500 bg-white hover:bg-gray-50"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Register Your Company
              </Link>
            </div>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Admin access
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link
                to="/admin/login"
                className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-500 bg-white hover:bg-gray-50"
              >
                Admin Login
              </Link>
              <Link
                to="/superuser/login"
                className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-500 bg-white hover:bg-gray-50"
              >
                Super User
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-green-600"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Test Accounts for Different Statuses */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 text-center">
            Test Company Accounts
          </h3>
          <p className="text-sm text-blue-700 mb-4 text-center">
            Login with these test accounts to experience different company
            statuses
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Approved Company */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <h4 className="font-medium text-green-900">
                  ✅ Approved Company
                </h4>
              </div>
              <p className="text-xs text-green-700 mb-3">
                Full access to all features
              </p>
              <div className="space-y-1">
                <p className="text-sm text-green-800">
                  <strong>Email:</strong>{" "}
                  <button
                    onClick={() =>
                      fillTestAccount("approved@company.com", "password123")
                    }
                    className="bg-green-100 px-1 rounded text-xs hover:bg-green-200 cursor-pointer transition-colors"
                  >
                    approved@company.com
                  </button>
                </p>
                <p className="text-sm text-green-800">
                  <strong>Password:</strong>{" "}
                  <code className="bg-green-100 px-1 rounded text-xs">
                    password123
                  </code>
                </p>
              </div>
            </div>

            {/* Pending Company */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <h4 className="font-medium text-blue-900">
                  🔵 Pending Approval
                </h4>
              </div>
              <p className="text-xs text-blue-700 mb-3">
                Limited access, awaiting BPP review
              </p>
              <div className="space-y-1">
                <p className="text-sm text-blue-800">
                  <strong>Email:</strong>{" "}
                  <button
                    onClick={() =>
                      fillTestAccount("pending@company.com", "password123")
                    }
                    className="bg-blue-100 px-1 rounded text-xs hover:bg-blue-200 cursor-pointer transition-colors"
                  >
                    pending@company.com
                  </button>
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Password:</strong>{" "}
                  <code className="bg-blue-100 px-1 rounded text-xs">
                    password123
                  </code>
                </p>
              </div>
            </div>

            {/* Suspended Company */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                <h4 className="font-medium text-orange-900">
                  🟠 Suspended Account
                </h4>
              </div>
              <p className="text-xs text-orange-700 mb-3">
                Suspended due to expired documents
              </p>
              <div className="space-y-1">
                <p className="text-sm text-orange-800">
                  <strong>Email:</strong>{" "}
                  <button
                    onClick={() =>
                      fillTestAccount("suspended@company.com", "password123")
                    }
                    className="bg-orange-100 px-1 rounded text-xs hover:bg-orange-200 cursor-pointer transition-colors"
                  >
                    suspended@company.com
                  </button>
                </p>
                <p className="text-sm text-orange-800">
                  <strong>Password:</strong>{" "}
                  <code className="bg-orange-100 px-1 rounded text-xs">
                    password123
                  </code>
                </p>
              </div>
            </div>

            {/* Blacklisted Company */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <h4 className="font-medium text-red-900">
                  🔴 Blacklisted Account
                </h4>
              </div>
              <p className="text-xs text-red-700 mb-3">
                Banned from all procurement activities
              </p>
              <div className="space-y-1">
                <p className="text-sm text-red-800">
                  <strong>Email:</strong>{" "}
                  <button
                    onClick={() =>
                      fillTestAccount("blacklisted@company.com", "password123")
                    }
                    className="bg-red-100 px-1 rounded text-xs hover:bg-red-200 cursor-pointer transition-colors"
                  >
                    blacklisted@company.com
                  </button>
                </p>
                <p className="text-sm text-red-800">
                  <strong>Password:</strong>{" "}
                  <code className="bg-red-100 px-1 rounded text-xs">
                    password123
                  </code>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-600 text-center">
              💡 <strong>Quick Login Tip:</strong> Click on any email above to
              auto-fill the login form
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
