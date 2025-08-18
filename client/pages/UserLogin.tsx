import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { logUserAction } from "@/lib/auditLogStorage";
import {
  Building2,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

interface UserLoginData {
  email: string;
  password: string;
}

interface MDAUser {
  id: string;
  mdaId: string;
  userId: string;
  email: string;
  displayName: string;
  role: "procurement_officer" | "evaluator" | "accountant" | "viewer";
  department: string;
  permissions: any;
  assignedBy: string;
  assignedAt: Date;
  isActive: boolean;
}

export default function UserLogin() {
  const [formData, setFormData] = useState<UserLoginData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const authenticateUser = (
    email: string,
    password: string,
  ): { success: boolean; user?: MDAUser; error?: string } => {
    try {
      // Get all MDA users
      const allUsers = JSON.parse(localStorage.getItem("mda_users") || "[]");

      // Find user by email
      const user = allUsers.find(
        (u: MDAUser) =>
          u.email?.toLowerCase() === email.toLowerCase() && u.isActive,
      );

      if (!user) {
        return { success: false, error: "Invalid email or password" };
      }

      // For demo purposes, accept any password (in production, verify against secure password)
      if (!password) {
        return { success: false, error: "Password is required" };
      }

      return { success: true, user };
    } catch (error) {
      console.error("Error during user authentication:", error);
      return { success: false, error: "Authentication failed" };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Authenticate user
      const authResult = authenticateUser(formData.email, formData.password);

      if (authResult.success && authResult.user) {
        const user = authResult.user;

        // Store user session
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            role: user.role,
            department: user.department,
            mdaId: user.mdaId,
            permissions: user.permissions,
            loginTime: new Date().toISOString(),
            userType: "mda_user",
          }),
        );

        // Get MDA information
        const allMDAs = JSON.parse(localStorage.getItem("mdas") || "[]");
        const userMDA = allMDAs.find((mda: any) => mda.id === user.mdaId);

        // Log successful user login
        logUserAction(
          user.displayName,
          "mda_user",
          "MDA_USER_LOGIN_SUCCESS",
          userMDA?.name || "MDA Portal",
          `User ${user.displayName} (${user.role}) successfully logged in to ${userMDA?.name || "MDA"}`,
          "LOW",
          user.id,
          {
            loginTime: new Date().toISOString(),
            userAgent: navigator.userAgent,
            loginMethod: "user_credentials",
            mdaId: user.mdaId,
            mdaName: userMDA?.name,
            userRole: user.role,
            department: user.department,
            email: user.email,
          },
        );

        // Redirect to user dashboard (you would create this)
        navigate("/user/dashboard");
      } else {
        setErrors({ general: authResult.error || "Invalid credentials" });

        // Log failed login attempt
        logUserAction(
          formData.email,
          "anonymous",
          "MDA_USER_LOGIN_FAILED",
          "User Portal",
          `Failed login attempt for user ${formData.email}`,
          "MEDIUM",
          undefined,
          {
            failureReason: authResult.error || "Invalid credentials",
            attemptTime: new Date().toISOString(),
            userAgent: navigator.userAgent,
            attemptedEmail: formData.email,
          },
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ general: "Login failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-blue-600">KanoProc</h1>
              <p className="text-sm text-gray-600">User Portal</p>
            </div>
          </div>
        </Link>

        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          User Login
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Access your departmental dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Authentication Error
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{errors.general}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="your.email@ministry.gov.ng"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
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
                  className={`appearance-none block w-full pl-10 pr-10 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.password ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
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
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
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
                <span className="px-2 bg-white text-gray-500">Need help?</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Contact your MDA administrator for login credentials or
                technical support.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Link
              to="/ministry/login"
              className="flex items-center justify-center text-sm text-blue-600 hover:text-blue-500"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Administrator Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
