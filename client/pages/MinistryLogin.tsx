import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Building2, Mail, Lock, Eye, EyeOff, ArrowLeft, Shield } from "lucide-react";

export default function MinistryLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedMinistry, setSelectedMinistry] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const ministries = [
    { code: "MOH", name: "Ministry of Health", email: "health@kanostate.gov.ng" },
    { code: "MOE", name: "Ministry of Education", email: "education@kanostate.gov.ng" },
    { code: "MOW", name: "Ministry of Works", email: "works@kanostate.gov.ng" },
    { code: "MOA", name: "Ministry of Agriculture", email: "agriculture@kanostate.gov.ng" },
    { code: "MOWR", name: "Ministry of Water Resources", email: "water@kanostate.gov.ng" },
    { code: "MOST", name: "Ministry of Science and Technology", email: "science@kanostate.gov.ng" },
    { code: "MOCI", name: "Ministry of Commerce and Industry", email: "commerce@kanostate.gov.ng" },
    { code: "MOF", name: "Ministry of Finance", email: "finance@kanostate.gov.ng" },
    { code: "MOJE", name: "Ministry of Justice", email: "justice@kanostate.gov.ng" },
    { code: "MOENV", name: "Ministry of Environment", email: "environment@kanostate.gov.ng" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMinistry || !email || !password) {
      alert("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    // Simulate authentication
    setTimeout(() => {
      if (email === "ministry@kanostate.gov.ng" && password === "ministry123") {
        // Store ministry info in localStorage for demo
        localStorage.setItem("ministryUser", JSON.stringify({
          ministry: selectedMinistry,
          email: email,
          role: "ministry"
        }));
        navigate("/ministry/dashboard");
      } else {
        alert("Invalid credentials. Use: ministry@kanostate.gov.ng / ministry123");
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link 
            to="/" 
            className="inline-flex items-center text-green-600 hover:text-green-800 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-700 rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900">Ministry Portal</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your ministry's procurement dashboard
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg border" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Ministry Selection */}
            <div>
              <label htmlFor="ministry" className="block text-sm font-medium text-gray-700 mb-2">
                Select Ministry
              </label>
              <select
                id="ministry"
                value={selectedMinistry}
                onChange={(e) => setSelectedMinistry(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                required
              >
                <option value="">Choose your ministry...</option>
                {ministries.map((ministry) => (
                  <option key={ministry.code} value={ministry.code}>
                    {ministry.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Demo Credentials</h4>
                <p className="text-xs text-blue-700 mt-1">
                  Email: ministry@kanostate.gov.ng<br />
                  Password: ministry123
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign in to Ministry Dashboard"
              )}
            </button>
          </div>

          {/* Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Need help accessing your account?{" "}
              <a href="#" className="font-medium text-green-600 hover:text-green-500">
                Contact IT Support
              </a>
            </p>
            <p className="text-xs text-gray-500">
              By signing in, you agree to comply with Kano State procurement regulations
            </p>
          </div>
        </form>

        {/* Other Login Options */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">Other login portals:</p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/login"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Company Portal
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              to="/admin/login"
              className="text-sm text-purple-600 hover:text-purple-500"
            >
              Admin Portal
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              to="/superuser/login"
              className="text-sm text-green-600 hover:text-green-500"
            >
              Super User Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
