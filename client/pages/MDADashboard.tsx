import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Users,
  FileText,
  Plus,
  Eye,
  Edit,
  Trash2,
  LogOut,
  Bell,
  Search,
  Filter,
  Download,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  Calendar,
  Settings,
  UserPlus,
  Award,
  TrendingUp,
  PieChart
} from "lucide-react";
import { 
  MDA, 
  MDADashboardStats, 
  MDATender, 
  MDAUser, 
  EnhancedUserProfile 
} from '@shared/api';

interface MDADashboardProps {
  mdaId?: string;
}

export default function MDADashboard({ mdaId = "mda-001" }: MDADashboardProps) {
  const [currentView, setCurrentView] = useState<'overview' | 'tenders' | 'users' | 'createTender' | 'createUser'>('overview');
  const [mda, setMDA] = useState<MDA | null>(null);
  const [stats, setStats] = useState<MDADashboardStats | null>(null);
  const [tenders, setTenders] = useState<MDATender[]>([]);
  const [users, setUsers] = useState<(MDAUser & { user: EnhancedUserProfile })[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();

  // Mock data
  useEffect(() => {
    const mockMDA: MDA = {
      id: mdaId,
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
          level3: 100000000
        },
        allowedCategories: ["Medical Equipment", "Pharmaceuticals", "Healthcare Services"],
        customWorkflows: true,
        budgetYear: "2024",
        totalBudget: 5000000000
      }
    };

    const mockStats: MDADashboardStats = {
      totalTenders: 18,
      activeTenders: 7,
      totalValue: 850000000,
      averageProcessingTime: 14,
      successfulAwards: 11,
      pendingApprovals: 3,
      monthlyTrends: [
        { month: "Jan", tenders: 3, value: 120000000 },
        { month: "Feb", tenders: 5, value: 180000000 },
        { month: "Mar", tenders: 4, value: 150000000 },
        { month: "Apr", tenders: 6, value: 200000000 },
        { month: "May", tenders: 0, value: 0 }
      ]
    };

    const mockTenders: MDATender[] = [
      {
        id: "tender-001",
        mdaId: mdaId,
        title: "Supply of Medical Equipment for Primary Healthcare Centers",
        description: "Procurement of essential medical equipment including X-ray machines, patient monitors, and laboratory equipment for 15 primary healthcare centers across Kano State.",
        category: "Medical Equipment",
        estimatedValue: 350000000,
        currency: "NGN",
        status: "published",
        publishDate: new Date("2024-01-20"),
        closingDate: new Date("2024-02-20"),
        createdBy: "user-001",
        documents: [
          {
            id: "doc-001",
            name: "Technical Specifications",
            type: "specification",
            url: "/docs/tech-specs.pdf",
            size: 2048576,
            uploadedAt: new Date("2024-01-18")
          }
        ],
        requirements: [
          "Valid CAC registration",
          "ISO certification for medical devices",
          "Minimum 5 years experience",
          "Financial capacity of ₦200M+"
        ],
        evaluationCriteria: [
          {
            id: "eval-001",
            name: "Technical Compliance",
            weight: 40,
            maxScore: 100,
            description: "Compliance with technical specifications"
          },
          {
            id: "eval-002",
            name: "Financial Proposal",
            weight: 35,
            maxScore: 100,
            description: "Cost competitiveness and value for money"
          },
          {
            id: "eval-003",
            name: "Experience",
            weight: 25,
            maxScore: 100,
            description: "Previous experience and track record"
          }
        ],
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-20")
      },
      {
        id: "tender-002",
        mdaId: mdaId,
        title: "Construction of Mother and Child Health Complex",
        description: "Design and construction of a modern 200-bed mother and child health complex with specialized departments.",
        category: "Infrastructure",
        estimatedValue: 2500000000,
        currency: "NGN",
        status: "published",
        publishDate: new Date("2024-01-25"),
        closingDate: new Date("2024-03-15"),
        createdBy: "user-002",
        documents: [],
        requirements: [
          "Category C contractor license",
          "Previous hospital construction experience",
          "Professional indemnity insurance",
          "Financial capacity of ₦1B+"
        ],
        evaluationCriteria: [],
        createdAt: new Date("2024-01-20"),
        updatedAt: new Date("2024-01-25")
      },
      {
        id: "tender-003",
        mdaId: mdaId,
        title: "Pharmaceutical Supplies for State Hospitals",
        description: "Annual supply of essential medicines and pharmaceuticals for all state government hospitals.",
        category: "Pharmaceuticals",
        estimatedValue: 1200000000,
        currency: "NGN",
        status: "draft",
        createdBy: "user-003",
        documents: [],
        requirements: [
          "NAFDAC registration",
          "WHO-GMP certification",
          "Valid pharmaceutical license",
          "Cold chain capability"
        ],
        evaluationCriteria: [],
        createdAt: new Date("2024-01-28"),
        updatedAt: new Date("2024-01-28")
      }
    ];

    const mockUsers: (MDAUser & { user: EnhancedUserProfile })[] = [
      {
        id: "mdauser-001",
        mdaId: mdaId,
        userId: "user-101",
        role: "procurement_officer",
        department: "Procurement Department",
        permissions: {
          canCreateTenders: true,
          canEvaluateBids: true,
          canViewFinancials: true,
          canGenerateReports: true,
          accessLevel: "write"
        },
        createdBy: "admin-001",
        createdAt: new Date("2024-01-05"),
        isActive: true,
        user: {
          uid: "user-101",
          email: "procurement@health.kano.gov.ng",
          displayName: "Hajiya Khadija Ahmed",
          role: "mda_user",
          mdaId: mdaId,
          mdaRole: "procurement_officer",
          createdAt: new Date("2024-01-05"),
          lastLoginAt: new Date("2024-01-25"),
          emailVerified: true
        }
      },
      {
        id: "mdauser-002",
        mdaId: mdaId,
        userId: "user-102",
        role: "evaluator",
        department: "Technical Evaluation",
        permissions: {
          canCreateTenders: false,
          canEvaluateBids: true,
          canViewFinancials: false,
          canGenerateReports: true,
          accessLevel: "read"
        },
        createdBy: "admin-001",
        createdAt: new Date("2024-01-08"),
        isActive: true,
        user: {
          uid: "user-102",
          email: "evaluation@health.kano.gov.ng",
          displayName: "Dr. Muhammad Bello",
          role: "mda_user",
          mdaId: mdaId,
          mdaRole: "evaluator",
          createdAt: new Date("2024-01-08"),
          lastLoginAt: new Date("2024-01-24"),
          emailVerified: true
        }
      }
    ];

    setMDA(mockMDA);
    setStats(mockStats);
    setTenders(mockTenders);
    setUsers(mockUsers);
  }, [mdaId]);

  const filteredTenders = tenders.filter(tender => {
    const matchesSearch = tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tender.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || tender.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleLogout = () => {
    navigate("/");
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tenders</p>
              <p className="text-3xl font-bold text-blue-600">{stats?.totalTenders}</p>
              <p className="text-xs text-gray-500 mt-1">This year</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Tenders</p>
              <p className="text-3xl font-bold text-green-600">{stats?.activeTenders}</p>
              <p className="text-xs text-gray-500 mt-1">Currently open</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-3xl font-bold text-purple-600">₦{(stats?.totalValue || 0 / 1000000).toFixed(0)}M</p>
              <p className="text-xs text-gray-500 mt-1">Contract value</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Processing</p>
              <p className="text-3xl font-bold text-orange-600">{stats?.averageProcessingTime}d</p>
              <p className="text-xs text-gray-500 mt-1">Days to award</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Trends Chart */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Trends</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats?.monthlyTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">{trend.month}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{trend.tenders} tenders</p>
                      <p className="text-xs text-gray-500">₦{(trend.value / 1000000).toFixed(0)}M value</p>
                    </div>
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(trend.value / 200000000) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Tenders */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Recent Tenders</h3>
              <button
                onClick={() => setCurrentView('tenders')}
                className="text-blue-600 hover:text-blue-900 text-sm"
              >
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {tenders.slice(0, 3).map((tender) => (
                <div key={tender.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    tender.status === 'published' ? 'bg-green-100' :
                    tender.status === 'draft' ? 'bg-yellow-100' :
                    'bg-gray-100'
                  }`}>
                    <FileText className={`h-4 w-4 ${
                      tender.status === 'published' ? 'text-green-600' :
                      tender.status === 'draft' ? 'text-yellow-600' :
                      'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{tender.title}</p>
                    <p className="text-xs text-gray-500">₦{(tender.estimatedValue / 1000000).toFixed(0)}M</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                      tender.status === 'published' ? 'bg-green-100 text-green-800' :
                      tender.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {tender.status.charAt(0).toUpperCase() + tender.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setCurrentView('createTender')}
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="text-center">
                <Plus className="mx-auto h-8 w-8 text-gray-400" />
                <span className="mt-2 block text-sm font-medium text-gray-900">Create New Tender</span>
              </div>
            </button>
            
            <button
              onClick={() => setCurrentView('createUser')}
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="text-center">
                <UserPlus className="mx-auto h-8 w-8 text-gray-400" />
                <span className="mt-2 block text-sm font-medium text-gray-900">Add User</span>
              </div>
            </button>
            
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
              <div className="text-center">
                <BarChart3 className="mx-auto h-8 w-8 text-gray-400" />
                <span className="mt-2 block text-sm font-medium text-gray-900">Generate Report</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTenderList = () => (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tender Management</h2>
          <p className="text-gray-600">Create and manage procurement tenders for {mda?.name}</p>
        </div>
        <button
          onClick={() => setCurrentView('createTender')}
          className="flex items-center px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Tender
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
                placeholder="Search tenders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="sm:w-40">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="closed">Closed</option>
              <option value="awarded">Awarded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tender List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tender Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Closing Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTenders.map((tender) => (
                <tr key={tender.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{tender.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{tender.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {tender.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₦{(tender.estimatedValue / 1000000).toFixed(1)}M
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      tender.status === 'published' ? 'bg-green-100 text-green-800' :
                      tender.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      tender.status === 'closed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {tender.status.charAt(0).toUpperCase() + tender.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tender.closingDate ? tender.closingDate.toLocaleDateString() : 'N/A'}
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderUserList = () => (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage users and their access to {mda?.name}</p>
        </div>
        <button
          onClick={() => setCurrentView('createUser')}
          className="flex items-center px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </button>
      </div>

      {/* User List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
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
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.user.displayName}</div>
                        <div className="text-sm text-gray-500">{user.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {user.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.user.lastLoginAt.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
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
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-green-700">{mda?.name}</h1>
                <p className="text-xs text-gray-600">Procurement Dashboard</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => setCurrentView('overview')}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'overview' ? 'text-green-700 bg-green-50' : 'text-gray-700 hover:text-green-700'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => setCurrentView('tenders')}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'tenders' ? 'text-green-700 bg-green-50' : 'text-gray-700 hover:text-green-700'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Tenders</span>
              </button>
              <button
                onClick={() => setCurrentView('users')}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'users' ? 'text-green-700 bg-green-50' : 'text-gray-700 hover:text-green-700'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Users</span>
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              <Bell className="h-5 w-5 text-gray-600" />
              <button className="text-gray-600 hover:text-gray-900">
                <Settings className="h-5 w-5" />
              </button>
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
            Welcome to {mda?.name}
          </h1>
          <p className="text-gray-600">
            Manage procurement activities, tenders, and users for your organization.
          </p>
        </div>

        {/* Content based on current view */}
        {currentView === 'overview' && renderOverview()}
        {currentView === 'tenders' && renderTenderList()}
        {currentView === 'users' && renderUserList()}
        {currentView === 'createTender' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create New Tender</h2>
              <button
                onClick={() => setCurrentView('tenders')}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-600">Tender creation form will be implemented here...</p>
          </div>
        )}
        {currentView === 'createUser' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
              <button
                onClick={() => setCurrentView('users')}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-600">User creation form will be implemented here...</p>
          </div>
        )}
      </main>
    </div>
  );
}
