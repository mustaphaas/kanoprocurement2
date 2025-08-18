import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logUserAction } from "@/lib/auditLogStorage";
import {
  Building2,
  User,
  FileText,
  BarChart3,
  LogOut,
  Bell,
  Settings,
  Eye,
  Plus,
  Filter,
  Search,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";

interface CurrentUser {
  id: string;
  email: string;
  displayName: string;
  role: "procurement_officer" | "evaluator" | "accountant" | "viewer";
  department: string;
  mdaId: string;
  permissions: any;
  loginTime: string;
  userType: string;
}

interface MDA {
  id: string;
  name: string;
  type: string;
  description: string;
}

export default function UserDashboard() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [currentMDA, setCurrentMDA] = useState<MDA | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "tenders" | "reports"
  >("overview");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("currentUser");
    if (!userData) {
      navigate("/user/login");
      return;
    }

    try {
      const user = JSON.parse(userData);
      setCurrentUser(user);

      // Get MDA information
      const allMDAs = JSON.parse(localStorage.getItem("mdas") || "[]");
      const userMDA = allMDAs.find((mda: MDA) => mda.id === user.mdaId);
      setCurrentMDA(userMDA);

      // Log dashboard access
      logUserAction(
        user.displayName,
        "mda_user",
        "USER_DASHBOARD_ACCESSED",
        userMDA?.name || "User Dashboard",
        `User ${user.displayName} (${user.role}) accessed their dashboard`,
        "LOW",
        user.id,
        {
          accessTime: new Date().toISOString(),
          userAgent: navigator.userAgent,
          mdaId: user.mdaId,
          userRole: user.role,
          department: user.department,
        },
      );
    } catch (error) {
      console.error("Error loading user data:", error);
      navigate("/user/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    if (currentUser) {
      // Log user logout
      logUserAction(
        currentUser.displayName,
        "mda_user",
        "USER_LOGOUT",
        currentMDA?.name || "User Portal",
        `User ${currentUser.displayName} logged out`,
        "LOW",
        currentUser.id,
        {
          logoutTime: new Date().toISOString(),
          sessionDuration: "N/A", // Could calculate actual session duration
          mdaId: currentUser.mdaId,
        },
      );
    }

    localStorage.removeItem("currentUser");
    navigate("/user/login");
  };

  if (!currentUser || !currentMDA) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "procurement_officer":
        return "Procurement Officer";
      case "evaluator":
        return "Evaluator";
      case "accountant":
        return "Accountant";
      case "viewer":
        return "Viewer";
      default:
        return role;
    }
  };

  const getPermissionSummary = () => {
    const perms = currentUser.permissions;
    const allowed = [];
    if (perms.canCreateTenders) allowed.push("Create Tenders");
    if (perms.canEvaluateBids) allowed.push("Evaluate Bids");
    if (perms.canViewFinancials) allowed.push("View Financials");
    if (perms.canGenerateReports) allowed.push("Generate Reports");
    return allowed;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-600">
                  {currentMDA.name}
                </h1>
                <p className="text-xs text-gray-600">User Dashboard</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Bell className="h-5 w-5 text-gray-600" />
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-700">
                  {currentUser.displayName}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {["overview", "tenders", "reports"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome, {currentUser.displayName}!
              </h1>
              <p className="text-gray-600">
                {getRoleDisplayName(currentUser.role)} •{" "}
                {currentUser.department}
              </p>
            </div>

            {/* User Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <User className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Role</p>
                    <p className="text-lg font-bold text-gray-900">
                      {getRoleDisplayName(currentUser.role)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <Building2 className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      Department
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {currentUser.department}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <Settings className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      Access Level
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {currentUser.permissions.accessLevel || "Read"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Your Permissions
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getPermissionSummary().map((permission, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-sm text-gray-700">
                        {permission}
                      </span>
                    </div>
                  ))}
                </div>
                {getPermissionSummary().length === 0 && (
                  <p className="text-sm text-gray-500">
                    No specific permissions configured.
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {currentUser.permissions.canCreateTenders && (
                    <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <Plus className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="text-sm font-medium text-gray-700">
                        Create New Tender
                      </span>
                    </button>
                  )}

                  {currentUser.permissions.canEvaluateBids && (
                    <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <FileText className="h-5 w-5 text-green-600 mr-3" />
                      <span className="text-sm font-medium text-gray-700">
                        Evaluate Bids
                      </span>
                    </button>
                  )}

                  {currentUser.permissions.canGenerateReports && (
                    <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <BarChart3 className="h-5 w-5 text-purple-600 mr-3" />
                      <span className="text-sm font-medium text-gray-700">
                        Generate Report
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "tenders" && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Tender Management
            </h2>
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                Tender management functionality will be implemented based on
                your role permissions.
              </p>
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Reports & Analytics
            </h2>
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {currentUser.permissions.canGenerateReports
                  ? "Report generation tools will be available here."
                  : "You don't have permission to generate reports."}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
