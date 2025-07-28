import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Home,
  Info,
  HelpCircle,
  Globe,
  ExternalLink,
  Phone,
  LogOut,
  AlertTriangle,
  CheckCircle,
  Ban,
  FileText,
  TrendingUp,
  Users,
  Clock,
  Bell,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Plus,
  Mail,
  Send,
  DollarSign,
  Award,
  Calendar,
  MapPin,
  Star,
  Upload,
  Settings,
  MessageSquare,
  CreditCard,
  BarChart3,
  FileCheck,
  AlertCircle,
  ChevronRight,
  Menu,
  X,
  Target,
  Bookmark,
  History,
  Shield,
  Gavel
} from "lucide-react";

type CompanyStatus = "Approved" | "Suspended" | "Blacklisted";
type ActiveSection = 
  | "dashboard"
  | "tender-ads"
  | "purchased-bids"
  | "awarded-bids"
  | "my-profile"
  | "my-documents"
  | "detailed-compliance"
  | "new-clarifications"
  | "existing-clarifications"
  | "messages"
  | "transaction-history"
  | "contracts-awarded"
  | "annual-report"
  | "grievance";

interface CompanyData {
  name: string;
  email: string;
  status: CompanyStatus;
  suspensionReason?: string;
  blacklistReason?: string;
  totalAdverts: number;
  bidsExpressedInterest: number;
  activeBids: number;
  notActiveBids: number;
  totalContractValue: string;
}

interface Tender {
  id: string;
  title: string;
  ministry: string;
  category: string;
  value: string;
  deadline: string;
  location: string;
  status: "Open" | "Closed" | "Awarded" | "Cancelled";
  hasExpressedInterest: boolean;
  hasBid: boolean;
  unspscCode?: string;
  procurementMethod: string;
}

interface Notification {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  date: string;
  read: boolean;
}

interface Contract {
  id: string;
  projectTitle: string;
  awardingMinistry: string;
  contractValue: string;
  awardDate: string;
  status: "Active" | "Completed" | "Terminated";
  progress?: number;
}

export default function CompanyDashboard() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const navigate = useNavigate();

  // Mock company data
  const companyData: CompanyData = {
    name: "Northern Construction Ltd",
    email: "contact@northernconstruction.com",
    status: "Approved", // Can be "Approved", "Suspended", or "Blacklisted"
    totalAdverts: 150,
    bidsExpressedInterest: 25,
    activeBids: 10,
    notActiveBids: 15,
    totalContractValue: "₦2.3B"
  };

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "info",
      title: "New Addendum",
      message: "New Addendum issued for Hospital Equipment Supply tender.",
      date: "2024-01-22",
      read: false
    },
    {
      id: "2",
      type: "warning",
      title: "Bid Under Evaluation",
      message: "Your bid for Road Construction Project is currently under evaluation.",
      date: "2024-01-21",
      read: false
    },
    {
      id: "3",
      type: "success",
      title: "Contract Awarded",
      message: "Congratulations! You have been awarded the contract for ICT Infrastructure Upgrade.",
      date: "2024-01-20",
      read: true
    },
    {
      id: "4",
      type: "warning",
      title: "Document Expiry Alert",
      message: "Important: Your Tax Clearance Certificate expires on 2024-03-15. Please upload an updated copy to avoid automatic suspension.",
      date: "2024-01-19",
      read: false
    }
  ]);

  const [tenders, setTenders] = useState<Tender[]>([
    {
      id: "KS-2024-015",
      title: "Supply of Medical Equipment",
      ministry: "Ministry of Health",
      category: "Healthcare",
      value: "₦850M",
      deadline: "2024-02-28",
      location: "Kano Municipal",
      status: "Open",
      hasExpressedInterest: true,
      hasBid: false,
      unspscCode: "42181500",
      procurementMethod: "Open Tendering"
    },
    {
      id: "KS-2024-016",
      title: "Construction of Primary School",
      ministry: "Ministry of Education",
      category: "Infrastructure",
      value: "₦1.2B",
      deadline: "2024-03-15",
      location: "Kano North LGA",
      status: "Open",
      hasExpressedInterest: false,
      hasBid: false,
      unspscCode: "72141100",
      procurementMethod: "Open Tendering"
    },
    {
      id: "KS-2024-012",
      title: "Road Rehabilitation Project",
      ministry: "Ministry of Works",
      category: "Infrastructure",
      value: "₦3.5B",
      deadline: "2024-02-15",
      location: "Multiple LGAs",
      status: "Open",
      hasExpressedInterest: true,
      hasBid: true,
      unspscCode: "72141200",
      procurementMethod: "Selective Tendering"
    }
  ]);

  const [contracts, setContracts] = useState<Contract[]>([
    {
      id: "CON-2024-001",
      projectTitle: "ICT Infrastructure Upgrade",
      awardingMinistry: "Ministry of Science and Technology",
      contractValue: "₦1.1B",
      awardDate: "2024-01-20",
      status: "Active",
      progress: 35
    },
    {
      id: "CON-2023-045",
      projectTitle: "Hospital Equipment Installation",
      awardingMinistry: "Ministry of Health",
      contractValue: "₦650M",
      awardDate: "2023-08-15",
      status: "Completed",
      progress: 100
    }
  ]);

  const recommendedTenders = [
    {
      id: "KS-2024-017",
      title: "Network Infrastructure Upgrade",
      ministry: "Ministry of Science and Technology",
      deadline: "2024-03-10"
    },
    {
      id: "KS-2024-018",
      title: "Fiber Optic Cable Installation", 
      ministry: "Ministry of Communications",
      deadline: "2024-03-20"
    }
  ];

  const handleLogout = () => {
    navigate("/");
  };

  const getStatusAlert = () => {
    switch (companyData.status) {
      case "Suspended":
        return (
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              <div className="ml-3">
                <p className="text-sm text-orange-700">
                  <strong>Account Suspended:</strong> Your account is suspended due to expired certificates. 
                  Please update your documents in 'My Documents' to regain full access.
                </p>
              </div>
            </div>
          </div>
        );
      case "Blacklisted":
        return (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <Ban className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <strong>Account Blacklisted:</strong> Your company has been blacklisted from participating in 
                  Kano State Government procurements due to {companyData.blacklistReason || "policy violations"}. 
                  Please contact the BPP for more information.
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-6">
            {/* Welcome Message */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {companyData.name}!</h1>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Account Status:</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                  companyData.status === "Approved" ? "bg-green-100 text-green-800" :
                  companyData.status === "Suspended" ? "bg-orange-100 text-orange-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {companyData.status === "Approved" && <CheckCircle className="h-4 w-4 mr-1" />}
                  {companyData.status === "Suspended" && <AlertTriangle className="h-4 w-4 mr-1" />}
                  {companyData.status === "Blacklisted" && <Ban className="h-4 w-4 mr-1" />}
                  {companyData.status}
                </span>
              </div>
            </div>

            {/* Status Alert */}
            {getStatusAlert()}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Adverts</p>
                    <p className="text-3xl font-bold text-blue-600">{companyData.totalAdverts}</p>
                    <p className="text-sm text-gray-500">Active tenders available</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Bids Expressed Interest</p>
                    <p className="text-3xl font-bold text-green-600">{companyData.bidsExpressedInterest}</p>
                    <p className="text-sm text-gray-500">Tenders you're interested in</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Bids</p>
                    <p className="text-3xl font-bold text-orange-600">{companyData.activeBids}</p>
                    <p className="text-sm text-gray-500">Under evaluation</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Not Active Bids</p>
                    <p className="text-3xl font-bold text-gray-600">{companyData.notActiveBids}</p>
                    <p className="text-sm text-gray-500">Closed/Completed</p>
                  </div>
                  <FileCheck className="h-8 w-8 text-gray-600" />
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Notifications & Alerts</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div key={notification.id} className={`p-4 rounded-lg border-l-4 ${
                      notification.type === "success" ? "bg-green-50 border-green-400" :
                      notification.type === "warning" ? "bg-orange-50 border-orange-400" :
                      notification.type === "error" ? "bg-red-50 border-red-400" :
                      "bg-blue-50 border-blue-400"
                    } ${!notification.read ? "font-medium" : ""}`}>
                      <div className="flex items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{notification.title}</p>
                          <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-2">{new Date(notification.date).toLocaleDateString()}</p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => setActiveSection("tender-ads")}
                className="bg-white rounded-lg shadow-sm border p-6 text-left hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <Search className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">Browse Latest Tenders</h3>
                    <p className="text-sm text-gray-600">View all available opportunities</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setActiveSection("my-profile")}
                className="bg-white rounded-lg shadow-sm border p-6 text-left hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <Edit className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">Update Company Profile</h3>
                    <p className="text-sm text-gray-600">Manage your company information</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setActiveSection("contracts-awarded")}
                className="bg-white rounded-lg shadow-sm border p-6 text-left hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <Award className="h-6 w-6 text-purple-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">View My Awarded Contracts</h3>
                    <p className="text-sm text-gray-600">Track contract performance</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Personalized Tender Recommendations */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Target className="h-5 w-5 text-purple-600 mr-2" />
                  Personalized Tender Recommendations
                </h2>
                <p className="text-sm text-gray-600 mt-1">Based on your profile, you might be interested in:</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recommendedTenders.map((tender) => (
                    <div key={tender.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{tender.title}</h3>
                        <p className="text-sm text-gray-600">{tender.ministry} • Deadline: {new Date(tender.deadline).toLocaleDateString()}</p>
                      </div>
                      <button className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* User Feedback Prompt */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Help us improve KanoProc</h3>
                  <p className="text-sm text-gray-600 mt-1">Share your experience to help us serve you better</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Give Feedback
                </button>
              </div>
            </div>
          </div>
        );

      case "tender-ads":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Tender Advertisements</h1>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Filter
                </button>
                <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tenders by title, ministry, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {filterOpen && (
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-4 border-t">
                    <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="">All Ministries</option>
                      <option value="health">Ministry of Health</option>
                      <option value="education">Ministry of Education</option>
                      <option value="works">Ministry of Works</option>
                    </select>
                    <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="">All Categories</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="infrastructure">Infrastructure</option>
                      <option value="technology">Technology</option>
                    </select>
                    <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="">All Locations</option>
                      <option value="kano-municipal">Kano Municipal</option>
                      <option value="kano-north">Kano North LGA</option>
                    </select>
                    <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="">Project Value</option>
                      <option value="0-100m">₦0 - ₦100M</option>
                      <option value="100m-1b">₦100M - ₦1B</option>
                      <option value="1b+">₦1B+</option>
                    </select>
                    <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="">All Methods</option>
                      <option value="open">Open Tendering</option>
                      <option value="selective">Selective Tendering</option>
                      <option value="limited">Limited Tendering</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Tender List */}
            <div className="space-y-4">
              {tenders.map((tender) => (
                <div key={tender.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-gray-500">{tender.id}</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            tender.status === "Open" ? "bg-green-100 text-green-800" :
                            tender.status === "Closed" ? "bg-gray-100 text-gray-800" :
                            tender.status === "Awarded" ? "bg-blue-100 text-blue-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {tender.status}
                          </span>
                          {tender.hasExpressedInterest && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              <Bookmark className="h-3 w-3 mr-1" />
                              Interested
                            </span>
                          )}
                          {tender.hasBid && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                              <Send className="h-3 w-3 mr-1" />
                              Bid Submitted
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{tender.title}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 mr-1" />
                            {tender.ministry}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {tender.value}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Deadline: {new Date(tender.deadline).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {tender.location}
                          </div>
                        </div>
                        {tender.unspscCode && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">UNSPSC Code:</span> {tender.unspscCode}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col space-y-2 ml-4">
                        <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </button>
                        {companyData.status === "Approved" && tender.status === "Open" && (
                          <>
                            {!tender.hasExpressedInterest ? (
                              <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                                <Plus className="h-4 w-4 mr-1" />
                                Express Interest
                              </button>
                            ) : !tender.hasBid ? (
                              <button className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                                <Send className="h-4 w-4 mr-1" />
                                Submit Bid
                              </button>
                            ) : null}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "contracts-awarded":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Contracts Awarded</h1>
                <p className="text-gray-600">Total Contract Value: <span className="font-semibold text-green-600">{companyData.totalContractValue}</span></p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Awarding Ministry</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contract Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Award Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contracts.map((contract) => (
                      <tr key={contract.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{contract.projectTitle}</div>
                            <div className="text-sm text-gray-500">{contract.id}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {contract.awardingMinistry}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {contract.contractValue}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(contract.awardDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              contract.status === "Active" ? "bg-green-100 text-green-800" :
                              contract.status === "Completed" ? "bg-blue-100 text-blue-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {contract.status}
                            </span>
                            {contract.progress !== undefined && (
                              <span className="ml-2 text-sm text-gray-600">{contract.progress}%</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900">View Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Settings className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{activeSection.replace("-", " ").toUpperCase()}</h3>
            <p className="text-gray-600">This section is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-green-700">Kano State Government</h1>
                <p className="text-xs text-gray-600">E-Tendering & Open Contracting Portal</p>
              </div>
            </div>

            {/* Top Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link to="/" className="text-sm font-medium text-gray-700 hover:text-green-700 flex items-center">
                <Home className="h-4 w-4 mr-1" />
                Home
              </Link>
              <Link to="#" className="text-sm font-medium text-gray-700 hover:text-green-700 flex items-center">
                <Info className="h-4 w-4 mr-1" />
                About Us
              </Link>
              <Link to="#" className="text-sm font-medium text-gray-700 hover:text-green-700 flex items-center">
                <HelpCircle className="h-4 w-4 mr-1" />
                How it Works
              </Link>
              <Link to="#" className="text-sm font-medium text-gray-700 hover:text-green-700 flex items-center">
                <Globe className="h-4 w-4 mr-1" />
                ePortal
              </Link>
              <Link to="#" className="text-sm font-medium text-gray-700 hover:text-green-700 flex items-center">
                <ExternalLink className="h-4 w-4 mr-1" />
                Open Contracting Portal
              </Link>
              <Link to="#" className="text-sm font-medium text-gray-700 hover:text-green-700 flex items-center">
                <Phone className="h-4 w-4 mr-1" />
                Contact Us
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-green-700">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 bg-red-400 rounded-full"></span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-gray-600"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-0'} overflow-hidden transition-all duration-300 bg-white border-r border-gray-200 h-screen sticky top-16`}>
          <nav className="p-4 space-y-2">
            <div className="mb-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bid Activity</h2>
            </div>
            
            <button
              onClick={() => setActiveSection("tender-ads")}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                activeSection === "tender-ads" ? "bg-green-100 text-green-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FileText className="h-4 w-4 mr-3" />
              Tender Advertisements
            </button>
            
            <button
              onClick={() => setActiveSection("purchased-bids")}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                activeSection === "purchased-bids" ? "bg-green-100 text-green-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Bookmark className="h-4 w-4 mr-3" />
              Purchased Bids
            </button>
            
            <button
              onClick={() => setActiveSection("awarded-bids")}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                activeSection === "awarded-bids" ? "bg-green-100 text-green-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Award className="h-4 w-4 mr-3" />
              Awarded Bids
            </button>

            <div className="pt-4 mb-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Company Profile & Compliance</h2>
            </div>
            
            <button
              onClick={() => setActiveSection("my-profile")}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                activeSection === "my-profile" ? "bg-green-100 text-green-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Users className="h-4 w-4 mr-3" />
              My Profile
            </button>
            
            <button
              onClick={() => setActiveSection("my-documents")}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                activeSection === "my-documents" ? "bg-green-100 text-green-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Upload className="h-4 w-4 mr-3" />
              My Documents
            </button>
            
            <button
              onClick={() => setActiveSection("detailed-compliance")}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                activeSection === "detailed-compliance" ? "bg-green-100 text-green-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Shield className="h-4 w-4 mr-3" />
              Detailed Compliance
            </button>

            <div className="pt-4 mb-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Communication</h2>
            </div>
            
            <button
              onClick={() => setActiveSection("new-clarifications")}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                activeSection === "new-clarifications" ? "bg-green-100 text-green-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Plus className="h-4 w-4 mr-3" />
              New Clarifications
            </button>
            
            <button
              onClick={() => setActiveSection("existing-clarifications")}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                activeSection === "existing-clarifications" ? "bg-green-100 text-green-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <History className="h-4 w-4 mr-3" />
              Existing Clarifications
            </button>
            
            <button
              onClick={() => setActiveSection("messages")}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                activeSection === "messages" ? "bg-green-100 text-green-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Mail className="h-4 w-4 mr-3" />
              Messages
            </button>

            <div className="pt-4 mb-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Business</h2>
            </div>
            
            <button
              onClick={() => setActiveSection("transaction-history")}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                activeSection === "transaction-history" ? "bg-green-100 text-green-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <CreditCard className="h-4 w-4 mr-3" />
              Transaction History
            </button>
            
            <button
              onClick={() => setActiveSection("contracts-awarded")}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                activeSection === "contracts-awarded" ? "bg-green-100 text-green-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FileCheck className="h-4 w-4 mr-3" />
              Contracts Awarded
            </button>
            
            <button
              onClick={() => setActiveSection("annual-report")}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                activeSection === "annual-report" ? "bg-green-100 text-green-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <BarChart3 className="h-4 w-4 mr-3" />
              Annual Report
            </button>
            
            <button
              onClick={() => setActiveSection("grievance")}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                activeSection === "grievance" ? "bg-green-100 text-green-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Gavel className="h-4 w-4 mr-3" />
              Grievance Redress
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
}
