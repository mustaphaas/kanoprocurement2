import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Users,
  Plus,
  Settings,
  Eye,
  Edit,
  Trash2,
  LogOut,
  Bell,
  Search,
  Filter,
  Download,
  BarChart3,
  Shield,
  CheckCircle,
  AlertTriangle,
  X,
  UserPlus,
  Building,
  Briefcase,
} from "lucide-react";
import {
  MDA,
  MDAAdmin,
  SuperuserDashboardStats,
  EnhancedUserProfile,
} from "@shared/api";

interface SuperuserDashboardProps {}

export default function SuperuserDashboard({}: SuperuserDashboardProps) {
  const [currentView, setCurrentView] = useState<
    "overview" | "mdas" | "admins" | "createMDA" | "createAdmin"
  >("overview");
  const [mdas, setMDAs] = useState<MDA[]>([]);
  const [mdaAdmins, setMDAAdmins] = useState<
    (MDAAdmin & { user: EnhancedUserProfile; mda: MDA })[]
  >([]);
  const [stats, setStats] = useState<SuperuserDashboardStats | null>(null);
  const [selectedMDA, setSelectedMDA] = useState<MDA | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "ministry" | "department" | "agency"
  >("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  // Mock data
  useEffect(() => {
    const mockMDAs: MDA[] = [
      {
        id: "mda-001",
        name: "Ministry of Health",
        type: "ministry",
        description: "Responsible for healthcare policy and administration",
        contactEmail: "info@health.kano.gov.ng",
        contactPhone: "+234 64 123 4567",
        address: "Health Ministry Complex, Kano",
        headOfMDA: "Dr. Amina Kano",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-15"),
        isActive: true,
        settings: {
          procurementThresholds: {
            level1: 5000000,
            level2: 25000000,
            level3: 100000000,
          },
          allowedCategories: [
            "Medical Equipment",
            "Pharmaceuticals",
            "Healthcare Services",
          ],
          customWorkflows: true,
          budgetYear: "2024",
          totalBudget: 5000000000,
        },
      },
      {
        id: "mda-002",
        name: "Ministry of Education",
        type: "ministry",
        description: "Manages education policy and school administration",
        contactEmail: "info@education.kano.gov.ng",
        contactPhone: "+234 64 123 4568",
        address: "Education Ministry, Kano",
        headOfMDA: "Prof. Muhammad Usman",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-15"),
        isActive: true,
        settings: {
          procurementThresholds: {
            level1: 5000000,
            level2: 25000000,
            level3: 100000000,
          },
          allowedCategories: [
            "Educational Materials",
            "School Infrastructure",
            "ICT Equipment",
          ],
          customWorkflows: false,
          budgetYear: "2024",
          totalBudget: 8000000000,
        },
      },
      {
        id: "mda-003",
        name: "Kano State Urban Development Board",
        type: "agency",
        description: "Urban planning and development coordination",
        contactEmail: "info@ksudb.kano.gov.ng",
        contactPhone: "+234 64 123 4569",
        address: "KSUDB Complex, Kano",
        headOfMDA: "Engr. Fatima Aliyu",
        createdAt: new Date("2024-01-05"),
        updatedAt: new Date("2024-01-20"),
        isActive: true,
        settings: {
          procurementThresholds: {
            level1: 3000000,
            level2: 15000000,
            level3: 50000000,
          },
          allowedCategories: [
            "Construction",
            "Urban Planning",
            "Infrastructure",
          ],
          customWorkflows: true,
          budgetYear: "2024",
          totalBudget: 3000000000,
        },
      },
    ];

    const mockAdmins: (MDAAdmin & { user: EnhancedUserProfile; mda: MDA })[] = [
      {
        id: "admin-001",
        mdaId: "mda-001",
        userId: "user-001",
        role: "mda_super_admin",
        permissions: {
          canCreateUsers: true,
          canManageTenders: true,
          canApproveContracts: true,
          canViewReports: true,
          canManageSettings: true,
          maxApprovalAmount: 50000000,
        },
        assignedBy: "superuser-001",
        assignedAt: new Date("2024-01-02"),
        isActive: true,
        user: {
          uid: "user-001",
          email: "admin.health@kano.gov.ng",
          displayName: "Dr. Aisha Muhammad",
          role: "mda_admin",
          mdaId: "mda-001",
          mdaRole: "mda_super_admin",
          createdAt: new Date("2024-01-02"),
          lastLoginAt: new Date("2024-01-25"),
          emailVerified: true,
        },
        mda: mockMDAs[0],
      },
      {
        id: "admin-002",
        mdaId: "mda-002",
        userId: "user-002",
        role: "mda_admin",
        permissions: {
          canCreateUsers: true,
          canManageTenders: true,
          canApproveContracts: false,
          canViewReports: true,
          canManageSettings: false,
          maxApprovalAmount: 10000000,
        },
        assignedBy: "superuser-001",
        assignedAt: new Date("2024-01-03"),
        isActive: true,
        user: {
          uid: "user-002",
          email: "admin.education@kano.gov.ng",
          displayName: "Malam Ibrahim Hassan",
          role: "mda_admin",
          mdaId: "mda-002",
          mdaRole: "mda_admin",
          createdAt: new Date("2024-01-03"),
          lastLoginAt: new Date("2024-01-24"),
          emailVerified: true,
        },
        mda: mockMDAs[1],
      },
    ];

    const mockStats: SuperuserDashboardStats = {
      totalMDAs: 3,
      activeMDAs: 3,
      totalAdmins: 2,
      totalUsers: 15,
      systemWideStats: {
        totalTenders: 45,
        totalValue: 16000000000,
        averageEfficiency: 85.5,
      },
      mdaPerformance: [
        {
          mdaId: "mda-001",
          mdaName: "Ministry of Health",
          tendersCount: 18,
          totalValue: 5000000000,
          efficiency: 92.3,
        },
        {
          mdaId: "mda-002",
          mdaName: "Ministry of Education",
          tendersCount: 22,
          totalValue: 8000000000,
          efficiency: 88.7,
        },
        {
          mdaId: "mda-003",
          mdaName: "KSUDB",
          tendersCount: 5,
          totalValue: 3000000000,
          efficiency: 75.2,
        },
      ],
    };

    setMDAs(mockMDAs);
    setMDAAdmins(mockAdmins);
    setStats(mockStats);
  }, []);

  const filteredMDAs = mdas.filter((mda) => {
    const matchesSearch =
      mda.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mda.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || mda.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleLogout = () => {
    navigate("/");
  };

  const handleCreateMDA = () => {
    setCurrentView("createMDA");
  };

  const handleCreateAdmin = () => {
    setCurrentView("createAdmin");
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total MDAs</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats?.totalMDAs}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Admins</p>
              <p className="text-3xl font-bold text-green-600">
                {stats?.totalAdmins}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-purple-600">
                {stats?.totalUsers}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                System Efficiency
              </p>
              <p className="text-3xl font-bold text-orange-600">
                {stats?.systemWideStats.averageEfficiency}%
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* MDA Performance */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            MDA Performance Overview
          </h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MDA Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Efficiency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats?.mdaPerformance.map((perf) => (
                  <tr key={perf.mdaId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {perf.mdaName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {perf.tendersCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ₦{(perf.totalValue / 1000000000).toFixed(1)}B
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          perf.efficiency >= 90
                            ? "bg-green-100 text-green-800"
                            : perf.efficiency >= 80
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {perf.efficiency}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        <Eye className="h-4 w-4 inline mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMDAList = () => (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage MDAs</h2>
          <p className="text-gray-600">
            Create and manage Ministries, Departments, and Agencies
          </p>
        </div>
        <button
          onClick={handleCreateMDA}
          className="flex items-center px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create MDA
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search MDAs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="sm:w-40">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Types</option>
              <option value="ministry">Ministries</option>
              <option value="department">Departments</option>
              <option value="agency">Agencies</option>
            </select>
          </div>
        </div>
      </div>

      {/* MDA Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMDAs.map((mda) => (
          <div
            key={mda.id}
            className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      mda.type === "ministry"
                        ? "bg-blue-100"
                        : mda.type === "department"
                          ? "bg-green-100"
                          : "bg-purple-100"
                    }`}
                  >
                    {mda.type === "ministry" ? (
                      <Building
                        className={`h-6 w-6 ${
                          mda.type === "ministry"
                            ? "text-blue-600"
                            : mda.type === "department"
                              ? "text-green-600"
                              : "text-purple-600"
                        }`}
                      />
                    ) : mda.type === "department" ? (
                      <Building2 className="h-6 w-6 text-green-600" />
                    ) : (
                      <Briefcase className="h-6 w-6 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        mda.type === "ministry"
                          ? "bg-blue-100 text-blue-800"
                          : mda.type === "department"
                            ? "bg-green-100 text-green-800"
                            : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {mda.type.charAt(0).toUpperCase() + mda.type.slice(1)}
                    </span>
                  </div>
                </div>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    mda.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {mda.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {mda.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {mda.description}
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Head of MDA:</span>
                  <span className="font-medium">{mda.headOfMDA}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Budget:</span>
                  <span className="font-medium">
                    ₦{(mda.settings.totalBudget / 1000000000).toFixed(1)}B
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-900">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="text-green-600 hover:text-green-900">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={() => {
                    setSelectedMDA(mda);
                    setCurrentView("createAdmin");
                  }}
                  className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full hover:bg-green-200"
                >
                  Add Admin
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMDAs.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No MDAs found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterType !== "all"
              ? "Try adjusting your search or filter criteria."
              : "Start by creating your first MDA."}
          </p>
        </div>
      )}
    </div>
  );

  const renderAdminList = () => (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            MDA Administrators
          </h2>
          <p className="text-gray-600">
            Manage MDA administrators and their permissions
          </p>
        </div>
        <button
          onClick={handleCreateAdmin}
          className="flex items-center px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Admin
        </button>
      </div>

      {/* Admin List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Administrator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MDA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mdaAdmins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {admin.user.displayName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {admin.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {admin.mda.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {admin.mda.type}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        admin.role === "mda_super_admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {admin.role === "mda_super_admin"
                        ? "Super Admin"
                        : "Admin"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {admin.user.lastLoginAt.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        admin.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {admin.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Eye className="h-4 w-4 inline mr-1" />
                      View
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <Edit className="h-4 w-4 inline mr-1" />
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4 inline mr-1" />
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-green-700">
                  KanoProc SuperUser
                </h1>
                <p className="text-xs text-gray-600">
                  System Administration Portal
                </p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => setCurrentView("overview")}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === "overview"
                    ? "text-green-700 bg-green-50"
                    : "text-gray-700 hover:text-green-700"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => setCurrentView("mdas")}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === "mdas"
                    ? "text-green-700 bg-green-50"
                    : "text-gray-700 hover:text-green-700"
                }`}
              >
                <Building2 className="h-4 w-4" />
                <span>MDAs</span>
              </button>
              <button
                onClick={() => setCurrentView("admins")}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === "admins"
                    ? "text-green-700 bg-green-50"
                    : "text-gray-700 hover:text-green-700"
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Admins</span>
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              <Bell className="h-5 w-5 text-gray-600" />
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome, SuperUser!
          </h1>
          <p className="text-gray-600">
            Manage the entire KanoProc system, create MDAs, and oversee all
            procurement activities.
          </p>
        </div>

        {/* Content based on current view */}
        {currentView === "overview" && renderOverview()}
        {currentView === "mdas" && renderMDAList()}
        {currentView === "admins" && renderAdminList()}
        {currentView === "createMDA" && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Create New MDA
              </h2>
              <button
                onClick={() => setCurrentView("mdas")}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-600">
              MDA creation form will be implemented here...
            </p>
          </div>
        )}
        {currentView === "createAdmin" && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Add MDA Administrator
              </h2>
              <button
                onClick={() => setCurrentView("admins")}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-600">
              Admin creation form will be implemented here...
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
