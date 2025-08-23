import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/StaticAuthContext";
import { getMinistryByCredentials } from "@shared/ministries";
import {
  Building2,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  UserCheck,
  Shield,
  Crown,
  Users,
  Zap,
} from "lucide-react";

type UserType = "company" | "admin" | "superuser" | "ministry" | "governor";

interface LoginData {
  email?: string;
  username?: string;
  password: string;
}

interface UserTypeConfig {
  id: UserType;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  bgGradient: string;
  iconBg: string;
  useEmail: boolean;
  demoCredentials: {
    identifier: string;
    password: string;
  };
  navigation: string;
}

const userTypes: UserTypeConfig[] = [
  {
    id: "company",
    title: "Company Login",
    subtitle: "Access your company account to view tenders and submit bids",
    icon: <Building2 className="h-6 w-6" />,
    bgGradient: "from-green-50 to-green-100",
    iconBg: "bg-green-100 text-green-600",
    useEmail: true,
    demoCredentials: {
      identifier: "approved@company.com",
      password: "password123",
    },
    navigation: "/company/dashboard",
  },
  {
    id: "admin",
    title: "Admin Login",
    subtitle: "Registration Validator Access",
    icon: <Shield className="h-6 w-6" />,
    bgGradient: "from-blue-50 to-blue-100",
    iconBg: "bg-blue-100 text-blue-600",
    useEmail: false,
    demoCredentials: {
      identifier: "admin",
      password: "password",
    },
    navigation: "/admin/dashboard",
  },
  {
    id: "superuser",
    title: "Super User Login",
    subtitle: "Administrative Access • Full System Control",
    icon: <Crown className="h-6 w-6" />,
    bgGradient: "from-purple-50 to-purple-100",
    iconBg: "bg-purple-100 text-purple-600",
    useEmail: false,
    demoCredentials: {
      identifier: "superuser",
      password: "admin123",
    },
    navigation: "/superuser/dashboard",
  },
  {
    id: "governor",
    title: "Governor Login",
    subtitle: "Executive Command Center • State-wide Overview",
    icon: <Zap className="h-6 w-6" />,
    bgGradient: "from-emerald-50 to-green-100",
    iconBg: "bg-emerald-100 text-emerald-600",
    useEmail: false,
    demoCredentials: {
      identifier: "governor",
      password: "governor123",
    },
    navigation: "/governor/dashboard",
  },
  {
    id: "ministry",
    title: "Ministry Login",
    subtitle: "Procurement Management Access • Multiple Ministries Available",
    icon: <Users className="h-6 w-6" />,
    bgGradient: "from-orange-50 to-orange-100",
    iconBg: "bg-orange-100 text-orange-600",
    useEmail: false,
    demoCredentials: {
      identifier: "ministry/ministry2/ministry3",
      password: "ministry123",
    },
    navigation: "/ministry/dashboard",
  },
];

export default function Login() {
  const [selectedUserType, setSelectedUserType] = useState<UserType>("company");
  const [formData, setFormData] = useState<LoginData>({
    email: "",
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const currentConfig = userTypes.find((type) => type.id === selectedUserType)!;

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

    if (currentConfig.useEmail) {
      if (!formData.email?.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    } else {
      if (!formData.username?.trim()) {
        newErrors.username = "Username is required";
      }
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
      if (selectedUserType === "ministry") {
        // Handle ministry login with dynamic ministry system
        setTimeout(() => {
          const identifier = currentConfig.useEmail
            ? formData.email!
            : formData.username!;

          const ministry = getMinistryByCredentials(
            identifier,
            formData.password,
          );

          if (ministry) {
            localStorage.setItem(
              "ministryUser",
              JSON.stringify({
                username: identifier,
                role: "ministry",
                ministryId: ministry.id,
                ministryName: ministry.name,
                ministryCode: ministry.code,
              }),
            );
            navigate(currentConfig.navigation);
          } else {
            // Check for dynamic MDA credentials
            const mdas = JSON.parse(localStorage.getItem("mdas") || "[]");

            // Simplified MDA login: just check if it's an MDA ID with mda123 password
            const mda = mdas.find(
              (m: any) => m.id.toLowerCase() === identifier.toLowerCase(),
            );

            if (mda && formData.password === "mda123") {
              localStorage.setItem(
                "ministryUser",
                JSON.stringify({
                  username: identifier,
                  role: "mda",
                  ministryId: mda.id,
                  ministryName: mda.name,
                  ministryCode: mda.id.toUpperCase(),
                  mdaType: mda.type,
                }),
              );
              navigate(currentConfig.navigation);
            } else {
              setErrors({
                general: `Invalid credentials. Available accounts: ministry, ministry2, ministry3 (password: ministry123) OR use your MDA ID with password: mda123`,
              });
            }
          }
          setIsLoading(false);
        }, 1000);
      } else {
        // Handle other login types with auth context
        const identifier = currentConfig.useEmail
          ? formData.email!
          : formData.username!;
        await signIn(identifier, formData.password);
        navigate(currentConfig.navigation);
      }
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Login failed. Please try again.",
      });
    } finally {
      if (selectedUserType !== "ministry") {
        setIsLoading(false);
      }
    }
  };

  const fillTestAccount = (identifier: string, password: string) => {
    if (currentConfig.useEmail) {
      setFormData({ email: identifier, password, username: "" });
    } else {
      setFormData({ username: identifier, password, email: "" });
    }
    setErrors({});
  };

  const handleUserTypeChange = (userType: UserType) => {
    setSelectedUserType(userType);
    setFormData({ email: "", username: "", password: "" });
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
              <p className="text-sm text-gray-600">Secure Portal Access</p>
            </div>
          </div>
        </Link>

        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Login
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Choose your account type and sign in to continue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* User Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Account Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {userTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => handleUserTypeChange(type.id)}
                className={`relative p-3 rounded-lg border-2 transition-all duration-200 ${
                  selectedUserType === type.id
                    ? `border-green-500 bg-gradient-to-br ${type.bgGradient}`
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      selectedUserType === type.id
                        ? type.iconBg
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {type.icon}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      selectedUserType === type.id
                        ? "text-gray-800"
                        : "text-gray-600"
                    }`}
                  >
                    {type.title.replace(" Login", "")}
                  </span>
                </div>
                {selectedUserType === type.id && (
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border">
          {/* Selected User Type Header */}
          <div
            className={`mb-6 p-4 rounded-lg bg-gradient-to-br ${currentConfig.bgGradient} border`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${currentConfig.iconBg}`}
              >
                {currentConfig.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {currentConfig.title}
                </h3>
                <p className="text-xs text-gray-600">
                  {currentConfig.subtitle}
                </p>
              </div>
            </div>
          </div>

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
                htmlFor={currentConfig.useEmail ? "email" : "username"}
                className="block text-sm font-medium text-gray-700"
              >
                {currentConfig.useEmail ? "Email Address" : "Username"}
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {currentConfig.useEmail ? (
                    <Mail className="h-5 w-5 text-gray-400" />
                  ) : (
                    <User className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <input
                  id={currentConfig.useEmail ? "email" : "username"}
                  name={currentConfig.useEmail ? "email" : "username"}
                  type={currentConfig.useEmail ? "email" : "text"}
                  autoComplete={currentConfig.useEmail ? "email" : "username"}
                  required
                  value={
                    currentConfig.useEmail
                      ? formData.email || ""
                      : formData.username || ""
                  }
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors[currentConfig.useEmail ? "email" : "username"]
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder={`Enter your ${currentConfig.useEmail ? "email" : "username"}`}
                />
              </div>
              {errors[currentConfig.useEmail ? "email" : "username"] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors[currentConfig.useEmail ? "email" : "username"]}
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

            {selectedUserType === "company" && (
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
            )}

            {selectedUserType !== "company" && (
              <div className="flex items-center justify-end">
                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-green-600 hover:text-green-500"
                  >
                    Forgot your password?
                  </a>
                </div>
              </div>
            )}

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
                  `Sign in to ${currentConfig.title.replace(" Login", "")} Account`
                )}
              </button>
            </div>
          </form>

          {selectedUserType === "company" && (
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
          )}

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

      {/* Demo Credentials */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div
          className={`bg-gradient-to-br ${currentConfig.bgGradient} border border-gray-200 rounded-lg p-4`}
        >
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Demo Credentials
              </h4>
              <div className="mt-2">
                {selectedUserType === "ministry" ? (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-700 font-medium">
                      Available Ministry Accounts:
                    </p>
                    {[
                      { username: "ministry", name: "Ministry of Health" },
                      { username: "ministry2", name: "Ministry of Works" },
                      { username: "ministry3", name: "Ministry of Education" },
                    ].map((ministry) => (
                      <div
                        key={ministry.username}
                        className="bg-white p-2 rounded border"
                      >
                        <p className="text-xs text-gray-700">
                          <strong>{ministry.name}:</strong>{" "}
                          <button
                            onClick={() =>
                              fillTestAccount(ministry.username, "ministry123")
                            }
                            className="bg-gray-50 px-2 py-1 rounded text-xs hover:bg-gray-100 cursor-pointer transition-colors border mx-1"
                          >
                            {ministry.username}
                          </button>
                          <span className="text-gray-500">/ ministry123</span>
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-gray-700">
                      <strong>
                        {currentConfig.useEmail ? "Email" : "Username"}:
                      </strong>{" "}
                      <button
                        onClick={() =>
                          fillTestAccount(
                            currentConfig.demoCredentials.identifier.split(
                              "/",
                            )[0],
                            currentConfig.demoCredentials.password,
                          )
                        }
                        className="bg-white px-2 py-1 rounded text-xs hover:bg-gray-50 cursor-pointer transition-colors border"
                      >
                        {currentConfig.demoCredentials.identifier.split("/")[0]}
                      </button>
                    </p>
                    <p className="text-xs text-gray-700 mt-1">
                      <strong>Password:</strong>{" "}
                      <code className="bg-white px-2 py-1 rounded text-xs border">
                        {currentConfig.demoCredentials.password}
                      </code>
                    </p>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                💡 <strong>Quick Login:</strong> Click the{" "}
                {currentConfig.useEmail ? "email" : "username"} above to
                auto-fill the form
              </p>
            </div>
          </div>
        </div>
      </div>

      {selectedUserType === "company" && (
        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-2xl">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 text-center">
              Test Company Accounts
            </h3>
            <p className="text-sm text-blue-700 mb-4 text-center">
              Login with these test accounts to experience different company
              statuses
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  status: "✅ Approved Company",
                  description: "Full access to all features",
                  email: "approved@company.com",
                  password: "password123",
                  bgColor: "bg-green-50 border-green-200",
                  textColor: "text-green-900",
                  buttonBg: "bg-green-100 hover:bg-green-200",
                },
                {
                  status: "🔵 Pending Approval",
                  description: "Limited access, awaiting BPP review",
                  email: "pending@company.com",
                  password: "password123",
                  bgColor: "bg-blue-50 border-blue-200",
                  textColor: "text-blue-900",
                  buttonBg: "bg-blue-100 hover:bg-blue-200",
                },
                {
                  status: "🟠 Suspended Account",
                  description: "Suspended due to expired documents",
                  email: "suspended@company.com",
                  password: "password123",
                  bgColor: "bg-orange-50 border-orange-200",
                  textColor: "text-orange-900",
                  buttonBg: "bg-orange-100 hover:bg-orange-200",
                },
                {
                  status: "🔴 Blacklisted Account",
                  description: "Banned from all procurement activities",
                  email: "blacklisted@company.com",
                  password: "password123",
                  bgColor: "bg-red-50 border-red-200",
                  textColor: "text-red-900",
                  buttonBg: "bg-red-100 hover:bg-red-200",
                },
              ].map((account, index) => (
                <div
                  key={index}
                  className={`${account.bgColor} border rounded-lg p-4`}
                >
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <h4 className={`font-medium ${account.textColor}`}>
                      {account.status}
                    </h4>
                  </div>
                  <p
                    className={`text-xs ${account.textColor.replace("900", "700")} mb-3`}
                  >
                    {account.description}
                  </p>
                  <div className="space-y-1">
                    <p
                      className={`text-sm ${account.textColor.replace("900", "800")}`}
                    >
                      <strong>Email:</strong>{" "}
                      <button
                        onClick={() =>
                          fillTestAccount(account.email, account.password)
                        }
                        className={`${account.buttonBg} px-1 rounded text-xs cursor-pointer transition-colors`}
                      >
                        {account.email}
                      </button>
                    </p>
                    <p
                      className={`text-sm ${account.textColor.replace("900", "800")}`}
                    >
                      <strong>Password:</strong>{" "}
                      <code
                        className={`${account.buttonBg.split(" ")[0]} px-1 rounded text-xs`}
                      >
                        {account.password}
                      </code>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
