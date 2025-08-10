import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/StaticAuthContext";
import { formatCurrency } from "@/lib/utils";
import { getDashboardConfig, type CompanyStatus } from "@/lib/dashboardConfig";
import DynamicNavigation from "@/components/DynamicNavigation";
import DynamicDashboardHeader from "@/components/DynamicDashboardHeader";
import StatusDemo from "@/components/StatusDemo";
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
  Gavel,
  Archive,
  Lock,
  RefreshCw,
} from "lucide-react";

type CompanyStatus = "Pending" | "Approved" | "Suspended" | "Blacklisted";
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
  | "grievance"
  | "eportal"
  | "open-contracting-portal";

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
  const [activeSection, setActiveSection] =
    useState<ActiveSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [showExpressInterestModal, setShowExpressInterestModal] =
    useState(false);
  const [showSubmitBidModal, setShowSubmitBidModal] = useState(false);
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [demoStatus, setDemoStatus] = useState<CompanyStatus | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Mock company data - Check for expired documents and auto-suspend
  const hasExpiredDocuments = () => {
    const expiredDocs = [
      { name: "Professional License", expiry: "2024-01-15" },
    ];
    return expiredDocs.some((doc) => new Date(doc.expiry) < new Date());
  };

  const getCompanyStatus = (): CompanyStatus => {
    // Use demo status if set (for testing purposes)
    if (demoStatus) return demoStatus;

    // Check user email to assign specific test account statuses
    const userEmail = user?.email?.toLowerCase() || "";

    // Test account status mapping
    if (userEmail === "pending@company.com") return "Pending";
    if (userEmail === "suspended@company.com") return "Suspended";
    if (userEmail === "blacklisted@company.com") return "Blacklisted";
    if (userEmail === "approved@company.com") return "Approved";

    // For other emails, check for expired documents
    const hasExpired = hasExpiredDocuments();
    if (hasExpired) return "Suspended";

    // Default to Approved for other valid emails
    return "Approved";
  };

  const getCompanyDetails = () => {
    const userEmail = user?.email?.toLowerCase() || "";
    const status = getCompanyStatus();

    // Different company details based on test accounts
    const companyDetails = {
      "pending@company.com": {
        name: "New Ventures Construction Ltd",
        email: userEmail,
        totalAdverts: 150,
        bidsExpressedInterest: 0, // Pending companies can't express interest yet
        activeBids: 0,
        notActiveBids: 0,
        totalContractValue: "₦0",
      },
      "suspended@company.com": {
        name: "Omega Engineering Services",
        email: userEmail,
        totalAdverts: 150,
        bidsExpressedInterest: 15, // Had expressed interest before suspension
        activeBids: 0, // No active bids due to suspension
        notActiveBids: 8,
        totalContractValue: "₦750M",
      },
      "blacklisted@company.com": {
        name: "Restricted Corp Ltd",
        email: userEmail,
        totalAdverts: 150,
        bidsExpressedInterest: 0,
        activeBids: 0,
        notActiveBids: 0,
        totalContractValue: "₦0",
      },
      "approved@company.com": {
        name: "Premier Construction Company",
        email: userEmail,
        totalAdverts: 150,
        bidsExpressedInterest: 25,
        activeBids: 10,
        notActiveBids: 15,
        totalContractValue: "₦2.3B",
      },
    };

    const details = companyDetails[
      userEmail as keyof typeof companyDetails
    ] || {
      name: "Northern Construction Ltd",
      email: "contact@northernconstruction.com",
      totalAdverts: 150,
      bidsExpressedInterest: 25,
      activeBids: 10,
      notActiveBids: 15,
      totalContractValue: "₦2.3B",
    };

    return {
      ...details,
      status,
      suspensionReason:
        status === "Suspended"
          ? userEmail === "suspended@company.com"
            ? "Professional License expired on January 15, 2024"
            : "Professional License expired on January 15, 2024"
          : undefined,
      blacklistReason:
        status === "Blacklisted"
          ? "Violation of procurement guidelines and contract terms"
          : undefined,
    };
  };

  const companyData: CompanyData = getCompanyDetails();

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "info",
      title: "New Addendum",
      message: "New Addendum issued for Hospital Equipment Supply tender.",
      date: "2024-01-22",
      read: false,
    },
    {
      id: "2",
      type: "warning",
      title: "Bid Under Evaluation",
      message:
        "Your bid for Road Construction Project is currently under evaluation.",
      date: "2024-01-21",
      read: false,
    },
    {
      id: "3",
      type: "success",
      title: "Contract Awarded",
      message:
        "Congratulations! You have been awarded the contract for ICT Infrastructure Upgrade.",
      date: "2024-01-20",
      read: true,
    },
    {
      id: "4",
      type: "warning",
      title: "Document Expiry Alert",
      message:
        "Important: Your Tax Clearance Certificate expires on 2024-03-15. Please upload an updated copy to avoid automatic suspension.",
      date: "2024-01-19",
      read: false,
    },
  ]);

  // Default tenders for fallback
  const getDefaultTenders = (): Tender[] => [
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
      procurementMethod: "Open Tendering",
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
      procurementMethod: "Open Tendering",
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
      procurementMethod: "Selective Tendering",
    },
  ];

  const [tenders, setTenders] = useState<Tender[]>(getDefaultTenders());

  // Load tenders from localStorage (recent tenders created by ministries)
  useEffect(() => {
    const loadTenders = () => {
      const storedTenders = localStorage.getItem("recentTenders");
      const storedTenderStates =
        localStorage.getItem("companyTenderStates") || "{}";
      const tenderStates = JSON.parse(storedTenderStates);

      if (storedTenders) {
        const parsedTenders = JSON.parse(storedTenders);
        if (parsedTenders.length > 0) {
          // Convert recent tender format to company dashboard tender format
          const formattedTenders = parsedTenders.map((recentTender: any) => ({
            id: recentTender.id,
            title: recentTender.title,
            ministry: recentTender.procuringEntity || "Kano State Government",
            category: recentTender.category,
            value: formatCurrency(recentTender.value),
            deadline: recentTender.deadline,
            location: recentTender.location || "Kano State",
            status:
              recentTender.status === "Open" ||
              recentTender.status === "Published"
                ? "Open"
                : "Closed",
            hasExpressedInterest:
              tenderStates[recentTender.id]?.hasExpressedInterest || false,
            hasBid: tenderStates[recentTender.id]?.hasBid || false,
            unspscCode: "72141100", // Default UNSPSC code
            procurementMethod: "Open Tendering",
          }));

          // Combine with default tenders, avoid duplicates
          const defaultTenders = getDefaultTenders();
          const allTenders = [...formattedTenders];

          // Add default tenders that don't exist in stored tenders
          defaultTenders.forEach((defaultTender) => {
            if (
              !formattedTenders.find((t: Tender) => t.id === defaultTender.id)
            ) {
              allTenders.push(defaultTender);
            }
          });

          setTenders(allTenders);
        }
      }
    };

    loadTenders();

    // Set up interval to refresh tenders every 30 seconds
    const interval = setInterval(loadTenders, 30000);
    return () => clearInterval(interval);
  }, []);

  const [contracts, setContracts] = useState<Contract[]>([
    {
      id: "CON-2024-001",
      projectTitle: "ICT Infrastructure Upgrade",
      awardingMinistry: "Ministry of Science and Technology",
      contractValue: "₦1.1B",
      awardDate: "2024-01-20",
      status: "Active",
      progress: 35,
    },
    {
      id: "CON-2023-045",
      projectTitle: "Hospital Equipment Installation",
      awardingMinistry: "Ministry of Health",
      contractValue: "₦650M",
      awardDate: "2023-08-15",
      status: "Completed",
      progress: 100,
    },
  ]);

  const recommendedTenders = [
    {
      id: "KS-2024-017",
      title: "Network Infrastructure Upgrade",
      ministry: "Ministry of Science and Technology",
      deadline: "2024-03-10",
    },
    {
      id: "KS-2024-018",
      title: "Fiber Optic Cable Installation",
      ministry: "Ministry of Communications",
      deadline: "2024-03-20",
    },
  ];

  const handleLogout = () => {
    navigate("/");
  };

  const handleExpressInterest = (tender: Tender) => {
    if (companyData.status !== "Approved") {
      alert("Your account must be approved to express interest in tenders.");
      return;
    }
    setSelectedTender(tender);
    setShowExpressInterestModal(true);
  };

  const handleSubmitBid = (tender: Tender) => {
    if (companyData.status !== "Approved") {
      alert("Your account must be approved to submit bids.");
      return;
    }
    if (!tender.hasExpressedInterest) {
      alert(
        "You must express interest in this tender before submitting a bid.",
      );
      return;
    }
    setSelectedTender(tender);
    setShowSubmitBidModal(true);
  };

  const confirmExpressInterest = () => {
    if (!selectedTender) return;

    // Update the tender to show interest has been expressed
    setTenders((prevTenders) =>
      prevTenders.map((tender) =>
        tender.id === selectedTender.id
          ? { ...tender, hasExpressedInterest: true }
          : tender,
      ),
    );

    // Persist tender state to localStorage
    const storedTenderStates =
      localStorage.getItem("companyTenderStates") || "{}";
    const tenderStates = JSON.parse(storedTenderStates);
    tenderStates[selectedTender.id] = {
      ...tenderStates[selectedTender.id],
      hasExpressedInterest: true,
    };
    localStorage.setItem("companyTenderStates", JSON.stringify(tenderStates));

    // Update company stats
    setNotifications((prev) => [
      {
        id: Date.now().toString(),
        type: "success",
        title: "Interest Expressed",
        message: `You have successfully expressed interest in ${selectedTender.title}`,
        date: new Date().toISOString().split("T")[0],
        read: false,
      },
      ...prev,
    ]);

    setShowExpressInterestModal(false);
    setSelectedTender(null);
  };

  const confirmSubmitBid = () => {
    if (!selectedTender) return;

    // Create simple bid data for localStorage
    const bidData = {
      id: `BID-${Date.now()}`,
      tenderId: selectedTender.id,
      tenderTitle: selectedTender.title,
      companyName: companyData.name,
      bidAmount: "₦850,000,000", // Mock amount for simplicity
      status: "Submitted",
      submittedAt: new Date().toISOString(),
      technicalScore: null,
      financialScore: null,
      totalScore: null,
    };

    // Get existing bids from localStorage
    const existingBids = localStorage.getItem("tenderBids") || "[]";
    const bidsArray = JSON.parse(existingBids);

    // Add new bid
    bidsArray.push(bidData);

    // Store back to localStorage
    localStorage.setItem("tenderBids", JSON.stringify(bidsArray));

    // Update the tender to show bid has been submitted - IMPORTANT: maintain hasExpressedInterest
    setTenders((prevTenders) =>
      prevTenders.map((tender) =>
        tender.id === selectedTender.id
          ? { ...tender, hasBid: true, hasExpressedInterest: true }
          : tender,
      ),
    );

    // Persist tender state to localStorage
    const storedTenderStates =
      localStorage.getItem("companyTenderStates") || "{}";
    const tenderStates = JSON.parse(storedTenderStates);
    tenderStates[selectedTender.id] = {
      ...tenderStates[selectedTender.id],
      hasExpressedInterest: true,
      hasBid: true,
    };
    localStorage.setItem("companyTenderStates", JSON.stringify(tenderStates));

    // Update company stats and add notification
    setNotifications((prev) => [
      {
        id: Date.now().toString(),
        type: "success",
        title: "Bid Submitted",
        message: `Your bid for ${selectedTender.title} has been successfully submitted and is under evaluation`,
        date: new Date().toISOString().split("T")[0],
        read: false,
      },
      ...prev,
    ]);

    setShowSubmitBidModal(false);
    setSelectedTender(null);
  };

  const getStatusAlert = () => {
    switch (companyData.status) {
      case "Pending":
        return (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
              <Clock className="h-5 w-5 text-blue-400" />
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Account Pending Approval:</strong> Your company
                  registration is under review by the Bureau of Public
                  Procurement. You will be notified once your account is
                  approved. Estimated processing time: 5-7 business days.
                </p>
              </div>
            </div>
          </div>
        );
      case "Suspended":
        return (
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              <div className="ml-3">
                <p className="text-sm text-orange-700">
                  <strong>Account Suspended:</strong> Your account is suspended
                  due to expired documents.
                  {companyData.suspensionReason && (
                    <span>Reason: {companyData.suspensionReason}. </span>
                  )}
                  Please update your documents in 'My Documents' to regain full
                  access.
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
                  <strong>Account Blacklisted:</strong> Your company has been
                  blacklisted from participating in Kano State Government
                  procurements due to{" "}
                  {companyData.blacklistReason || "policy violations"}. Please
                  contact the BPP for more information.
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome, {companyData.name}!
              </h1>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Account Status:</span>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                    companyData.status === "Approved"
                      ? "bg-green-100 text-green-800"
                      : companyData.status === "Pending"
                        ? "bg-blue-100 text-blue-800"
                        : companyData.status === "Suspended"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-100 text-red-800"
                  }`}
                >
                  {companyData.status === "Approved" && (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  )}
                  {companyData.status === "Pending" && (
                    <Clock className="h-4 w-4 mr-1" />
                  )}
                  {companyData.status === "Suspended" && (
                    <AlertTriangle className="h-4 w-4 mr-1" />
                  )}
                  {companyData.status === "Blacklisted" && (
                    <Ban className="h-4 w-4 mr-1" />
                  )}
                  {companyData.status}
                </span>
              </div>

              {/* Dynamic Status-Based Actions */}
              {companyData.status === "Pending" && (
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => setActiveSection("my-documents")}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Complete Verification
                  </button>
                  <button
                    onClick={() => setActiveSection("my-profile")}
                    className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
                  >
                    View Requirements
                  </button>
                </div>
              )}

              {companyData.status === "Suspended" && (
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => setActiveSection("my-documents")}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Fix Issues Now
                  </button>
                  <button
                    onClick={() => setActiveSection("detailed-compliance")}
                    className="inline-flex items-center px-4 py-2 border border-orange-300 text-sm font-medium rounded-md text-orange-700 bg-white hover:bg-orange-50"
                  >
                    View Compliance
                  </button>
                </div>
              )}

              {companyData.status === "Blacklisted" && (
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => setActiveSection("grievance")}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    <Gavel className="h-4 w-4 mr-2" />
                    Submit Appeal
                  </button>
                  <button
                    onClick={() => setActiveSection("my-profile")}
                    className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                  >
                    View Restrictions
                  </button>
                </div>
              )}

              {companyData.status === "Approved" && (
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => setActiveSection("tender-ads")}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Browse Tenders
                  </button>
                  <button
                    onClick={() => setActiveSection("contracts-awarded")}
                    className="inline-flex items-center px-4 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50"
                  >
                    View Contracts
                  </button>
                </div>
              )}
            </div>

            {/* Status Alert */}
            {getStatusAlert()}

            {/* Restricted Access Message for Pending Companies */}
            {companyData.status === "Pending" && (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Account Under Review
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Your company registration is currently being reviewed by the
                  Bureau of Public Procurement. During this review period, you
                  have limited access to the portal. Once approved, you will
                  have full access to all tender opportunities and features.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-3">
                      What You Can Do Now:
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        View your company profile and update contact information
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        Upload and manage required documents
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        Browse publicly available tender information
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        Access the ePortal and government services
                      </li>
                    </ul>
                  </div>

                  <div className="bg-red-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Restricted Until Approval:
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-start">
                        <X className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                        Express interest in tenders
                      </li>
                      <li className="flex items-start">
                        <X className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                        Submit bids or proposals
                      </li>
                      <li className="flex items-start">
                        <X className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                        Download tender documents
                      </li>
                      <li className="flex items-start">
                        <X className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                        Submit clarification requests
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="font-medium text-gray-900 mb-4">
                    Review Timeline
                  </h4>
                  <div className="flex items-center justify-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                        <span className="text-blue-600 font-medium">1</span>
                      </div>
                      <span className="text-gray-600">
                        Application Submitted
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                        <span className="text-white font-medium">2</span>
                      </div>
                      <span className="text-blue-600 font-medium">
                        Under Review
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                        <span className="text-gray-600 font-medium">3</span>
                      </div>
                      <span className="text-gray-500">Approval Decision</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-center space-x-4">
                  <button
                    onClick={() => setActiveSection("my-profile")}
                    className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Update Profile
                  </button>
                  <button
                    onClick={() => setActiveSection("my-documents")}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Manage Documents
                  </button>
                </div>
              </div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Adverts
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {companyData.totalAdverts}
                    </p>
                    <p className="text-sm text-gray-500">
                      Active tenders available
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Bids Expressed Interest
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {companyData.bidsExpressedInterest}
                    </p>
                    <p className="text-sm text-gray-500">
                      Tenders you're interested in
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Active Bids
                    </p>
                    <p className="text-3xl font-bold text-orange-600">
                      {companyData.activeBids}
                    </p>
                    <p className="text-sm text-gray-500">Under evaluation</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Not Active Bids
                    </p>
                    <p className="text-3xl font-bold text-gray-600">
                      {companyData.notActiveBids}
                    </p>
                    <p className="text-sm text-gray-500">Closed/Completed</p>
                  </div>
                  <FileCheck className="h-8 w-8 text-gray-600" />
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Notifications & Alerts
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        notification.type === "success"
                          ? "bg-green-50 border-green-400"
                          : notification.type === "warning"
                            ? "bg-orange-50 border-orange-400"
                            : notification.type === "error"
                              ? "bg-red-50 border-red-400"
                              : "bg-blue-50 border-blue-400"
                      } ${!notification.read ? "font-medium" : ""}`}
                    >
                      <div className="flex items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-700 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notification.date).toLocaleDateString()}
                          </p>
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
                    <h3 className="font-medium text-gray-900">
                      Browse Latest Tenders
                    </h3>
                    <p className="text-sm text-gray-600">
                      View all available opportunities
                    </p>
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
                    <h3 className="font-medium text-gray-900">
                      Update Company Profile
                    </h3>
                    <p className="text-sm text-gray-600">
                      Manage your company information
                    </p>
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
                    <h3 className="font-medium text-gray-900">
                      View My Awarded Contracts
                    </h3>
                    <p className="text-sm text-gray-600">
                      Track contract performance
                    </p>
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
                <p className="text-sm text-gray-600 mt-1">
                  Based on your profile, you might be interested in:
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recommendedTenders.map((tender) => (
                    <div
                      key={tender.id}
                      className="flex items-center justify-between p-4 bg-purple-50 rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {tender.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {tender.ministry} �� Deadline:{" "}
                          {new Date(tender.deadline).toLocaleDateString()}
                        </p>
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
                  <h3 className="font-medium text-gray-900">
                    Help us improve KanoProc
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Share your experience to help us serve you better
                  </p>
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
              <h1 className="text-2xl font-bold text-gray-900">
                Tender Advertisements
              </h1>
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
                <div
                  key={tender.id}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-gray-500">
                            {tender.id}
                          </span>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              tender.status === "Open"
                                ? "bg-green-100 text-green-800"
                                : tender.status === "Closed"
                                  ? "bg-gray-100 text-gray-800"
                                  : tender.status === "Awarded"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-red-100 text-red-800"
                            }`}
                          >
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
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {tender.title}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 mr-1" />
                            {tender.ministry}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {formatCurrency(tender.value)}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Deadline:{" "}
                            {new Date(tender.deadline).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {tender.location}
                          </div>
                        </div>
                        {tender.unspscCode && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">UNSPSC Code:</span>{" "}
                            {tender.unspscCode}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col space-y-2 ml-4">
                        <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </button>
                        {companyData.status === "Approved" &&
                          tender.status === "Open" && (
                            <>
                              {!tender.hasExpressedInterest ? (
                                <button
                                  onClick={() => handleExpressInterest(tender)}
                                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Express Interest
                                </button>
                              ) : !tender.hasBid ? (
                                <button
                                  onClick={() => handleSubmitBid(tender)}
                                  className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                                >
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
                <h1 className="text-2xl font-bold text-gray-900">
                  Contracts Awarded
                </h1>
                <p className="text-gray-600">
                  Total Contract Value:{" "}
                  <span className="font-semibold text-green-600">
                    {companyData.totalContractValue}
                  </span>
                </p>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Awarding Ministry
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contract Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Award Date
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
                    {contracts.map((contract) => (
                      <tr key={contract.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {contract.projectTitle}
                            </div>
                            <div className="text-sm text-gray-500">
                              {contract.id}
                            </div>
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
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                contract.status === "Active"
                                  ? "bg-green-100 text-green-800"
                                  : contract.status === "Completed"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {contract.status}
                            </span>
                            {contract.progress !== undefined && (
                              <span className="ml-2 text-sm text-gray-600">
                                {contract.progress}%
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900">
                            View Details
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

      case "purchased-bids":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Purchased Bids
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Tender documents you have purchased
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    {
                      id: "TB001",
                      title: "Road Construction and Maintenance Services",
                      purchaseDate: "2024-01-15",
                      amount: "₦5,000",
                      status: "Active",
                      deadline: "2024-02-15",
                      category: "Infrastructure",
                    },
                    {
                      id: "TB002",
                      title: "Supply of Medical Equipment to General Hospitals",
                      purchaseDate: "2024-01-10",
                      amount: "₦3,000",
                      status: "Submitted",
                      deadline: "2024-02-10",
                      category: "Healthcare",
                    },
                    {
                      id: "TB003",
                      title: "School Building Renovation Project",
                      purchaseDate: "2024-01-08",
                      amount: "₦4,500",
                      status: "Closed",
                      deadline: "2024-01-30",
                      category: "Education",
                    },
                  ].map((bid) => (
                    <div
                      key={bid.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium text-gray-900">
                              {bid.title}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                bid.status === "Active"
                                  ? "bg-green-100 text-green-800"
                                  : bid.status === "Submitted"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {bid.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <p className="font-medium text-gray-900">
                                Tender ID
                              </p>
                              <p>{bid.id}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Purchase Date
                              </p>
                              <p>
                                {new Date(
                                  bid.purchaseDate,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Amount Paid
                              </p>
                              <p className="text-green-600 font-medium">
                                {bid.amount}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Deadline
                              </p>
                              <p>
                                {new Date(bid.deadline).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </button>
                          <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "awarded-bids":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Awarded Bids
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Contracts you have won and their status
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    {
                      id: "AW001",
                      title:
                        "Supply of Office Furniture to Government Secretariat",
                      awardDate: "2024-01-20",
                      contractValue: "₦15,500,000",
                      status: "Contract Signed",
                      progress: 65,
                      completionDate: "2024-03-20",
                      category: "Supply",
                    },
                    {
                      id: "AW002",
                      title: "Construction of Primary Health Care Center",
                      awardDate: "2023-12-15",
                      contractValue: "₦85,000,000",
                      status: "In Progress",
                      progress: 40,
                      completionDate: "2024-06-15",
                      category: "Construction",
                    },
                  ].map((award) => (
                    <div
                      key={award.id}
                      className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium text-gray-900">
                              {award.title}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                award.status === "Contract Signed"
                                  ? "bg-green-100 text-green-800"
                                  : award.status === "In Progress"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              <Award className="h-3 w-3 mr-1" />
                              {award.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <p className="font-medium text-gray-900">
                                Contract ID
                              </p>
                              <p>{award.id}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Award Date
                              </p>
                              <p>
                                {new Date(award.awardDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Contract Value
                              </p>
                              <p className="text-green-600 font-medium">
                                {award.contractValue}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Expected Completion
                              </p>
                              <p>
                                {new Date(
                                  award.completionDate,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Category
                              </p>
                              <p>{award.category}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Progress
                              </p>
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{ width: `${award.progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium">
                                  {award.progress}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                          <FileText className="h-4 w-4 mr-1" />
                          View Contract
                        </button>
                        <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                          <Upload className="h-4 w-4 mr-1" />
                          Submit Progress
                        </button>
                        <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Contact PM
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "my-profile":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Company Profile
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Manage your company information and settings
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Company Information */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Company Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Company Name
                          </label>
                          <input
                            type="text"
                            value={companyData.name}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Registration Number
                          </label>
                          <input
                            type="text"
                            value="RC-1234567"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Business Type
                          </label>
                          <input
                            type="text"
                            value="Limited Liability Company"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Industry
                          </label>
                          <input
                            type="text"
                            value="Construction & Engineering"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                            readOnly
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Contact Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value="contact@democompany.com"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value="+234 803 123 4567"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Address
                          </label>
                          <textarea
                            rows={3}
                            value="123 Business District, Kano State, Nigeria"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Company Status & Statistics */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Account Status
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">
                            Current Status
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                              companyData.status === "Approved"
                                ? "bg-green-100 text-green-800"
                                : companyData.status === "Pending"
                                  ? "bg-blue-100 text-blue-800"
                                  : companyData.status === "Suspended"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-red-100 text-red-800"
                            }`}
                          >
                            {companyData.status === "Approved" && (
                              <CheckCircle className="h-4 w-4 mr-1" />
                            )}
                            {companyData.status === "Pending" && (
                              <Clock className="h-4 w-4 mr-1" />
                            )}
                            {companyData.status === "Suspended" && (
                              <AlertTriangle className="h-4 w-4 mr-1" />
                            )}
                            {companyData.status === "Blacklisted" && (
                              <Ban className="h-4 w-4 mr-1" />
                            )}
                            {companyData.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Account created: January 2023</p>
                          <p>Last updated: {new Date().toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Performance Statistics
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Bids Submitted
                          </span>
                          <span className="font-medium">24</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Contracts Won
                          </span>
                          <span className="font-medium text-green-600">8</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Success Rate
                          </span>
                          <span className="font-medium">33.3%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Total Contract Value
                          </span>
                          <span className="font-medium text-green-600">
                            ₦240,500,000
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Compliance Status
                      </h3>
                      <div className="space-y-3">
                        {[
                          {
                            name: "Tax Clearance Certificate",
                            status: "Valid",
                            expiry: "2024-12-31",
                          },
                          {
                            name: "Business Registration",
                            status: "Valid",
                            expiry: "2025-03-15",
                          },
                          {
                            name: "Professional License",
                            status: "Expired",
                            expiry: "2024-01-15",
                          },
                          {
                            name: "Insurance Certificate",
                            status: "Valid",
                            expiry: "2024-11-20",
                          },
                        ].map((cert) => (
                          <div
                            key={cert.name}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {cert.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Expires: {cert.expiry}
                              </p>
                            </div>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                cert.status === "Valid"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {cert.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    Cancel
                  </button>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                    <Edit className="h-4 w-4 mr-1" />
                    Update Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "my-documents":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      My Documents
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Manage your company documents and certificates
                    </p>
                  </div>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-1" />
                    Upload Document
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      name: "Tax Clearance Certificate",
                      type: "PDF",
                      size: "2.4 MB",
                      uploadDate: "2024-01-15",
                      status: "Verified",
                      expiry: "2024-12-31",
                    },
                    {
                      name: "CAC Certificate",
                      type: "PDF",
                      size: "1.8 MB",
                      uploadDate: "2024-01-10",
                      status: "Verified",
                      expiry: "2025-03-15",
                    },
                    {
                      name: "Professional License",
                      type: "PDF",
                      size: "3.1 MB",
                      uploadDate: "2023-12-20",
                      status: "Expired",
                      expiry: "2024-01-15",
                    },
                    {
                      name: "Insurance Certificate",
                      type: "PDF",
                      size: "2.7 MB",
                      uploadDate: "2023-11-20",
                      status: "Verified",
                      expiry: "2024-11-20",
                    },
                    {
                      name: "Company Profile",
                      type: "PDF",
                      size: "5.2 MB",
                      uploadDate: "2024-01-08",
                      status: "Under Review",
                      expiry: "N/A",
                    },
                    {
                      name: "Financial Statement 2023",
                      type: "PDF",
                      size: "4.6 MB",
                      uploadDate: "2024-01-05",
                      status: "Verified",
                      expiry: "N/A",
                    },
                  ].map((doc) => (
                    <div
                      key={doc.name}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 text-sm">
                              {doc.name}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {doc.type} • {doc.size}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            doc.status === "Verified"
                              ? "bg-green-100 text-green-800"
                              : doc.status === "Under Review"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {doc.status}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs text-gray-600">
                        <div className="flex justify-between">
                          <span>Uploaded:</span>
                          <span>
                            {new Date(doc.uploadDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expires:</span>
                          <span
                            className={
                              doc.expiry !== "N/A" &&
                              new Date(doc.expiry) < new Date()
                                ? "text-red-600"
                                : ""
                            }
                          >
                            {doc.expiry}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex space-x-2">
                        <button className="flex-1 inline-flex items-center justify-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </button>
                        <button className="flex-1 inline-flex items-center justify-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </button>
                        <button className="flex-1 inline-flex items-center justify-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                          <Upload className="h-3 w-3 mr-1" />
                          Replace
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Document Upload Area */}
                <div className="mt-8 border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      Upload new document
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Drag and drop files here, or click to browse
                    </p>
                    <div className="mt-4">
                      <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200">
                        <Plus className="h-4 w-4 mr-1" />
                        Choose Files
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "detailed-compliance":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Detailed Compliance Overview
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Comprehensive compliance status and requirements
                </p>
              </div>
              <div className="p-6">
                {/* Compliance Summary */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Compliance Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-900">
                            Compliant
                          </p>
                          <p className="text-2xl font-bold text-green-600">6</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <div className="flex items-center">
                        <AlertTriangle className="h-8 w-8 text-yellow-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-yellow-900">
                            Expiring Soon
                          </p>
                          <p className="text-2xl font-bold text-yellow-600">
                            2
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <div className="flex items-center">
                        <AlertCircle className="h-8 w-8 text-red-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-red-900">
                            Non-Compliant
                          </p>
                          <p className="text-2xl font-bold text-red-600">1</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center">
                        <Shield className="h-8 w-8 text-gray-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            Overall Score
                          </p>
                          <p className="text-2xl font-bold text-gray-600">
                            78%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Requirements */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Compliance Requirements
                  </h3>

                  {/* Legal & Registration Requirements */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Legal & Registration Requirements
                    </h4>
                    <div className="space-y-4">
                      {[
                        {
                          name: "Certificate of Incorporation (CAC)",
                          status: "Compliant",
                          description:
                            "Valid registration with Corporate Affairs Commission",
                          lastUpdated: "2024-01-15",
                          expiry: "2025-03-15",
                          documents: ["CAC_Certificate.pdf"],
                          priority: "High",
                        },
                        {
                          name: "Tax Identification Number (TIN)",
                          status: "Compliant",
                          description:
                            "Valid Tax Identification Number from FIRS",
                          lastUpdated: "2024-01-10",
                          expiry: "N/A",
                          documents: ["TIN_Certificate.pdf"],
                          priority: "High",
                        },
                        {
                          name: "Value Added Tax (VAT) Registration",
                          status: "Compliant",
                          description: "VAT registration certificate",
                          lastUpdated: "2023-12-20",
                          expiry: "N/A",
                          documents: ["VAT_Certificate.pdf"],
                          priority: "Medium",
                        },
                      ].map((req) => (
                        <div
                          key={req.name}
                          className="bg-white rounded-lg border p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h5 className="font-medium text-gray-900">
                                  {req.name}
                                </h5>
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    req.status === "Compliant"
                                      ? "bg-green-100 text-green-800"
                                      : req.status === "Expiring Soon"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {req.status}
                                </span>
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    req.priority === "High"
                                      ? "bg-red-100 text-red-800"
                                      : req.priority === "Medium"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {req.priority} Priority
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">
                                {req.description}
                              </p>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs text-gray-500">
                                <div>
                                  <span className="font-medium">
                                    Last Updated:
                                  </span>
                                  <p>
                                    {new Date(
                                      req.lastUpdated,
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium">Expires:</span>
                                  <p>{req.expiry}</p>
                                </div>
                                <div>
                                  <span className="font-medium">
                                    Documents:
                                  </span>
                                  <p>{req.documents.length} file(s)</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <button className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </button>
                              <button className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                                <Upload className="h-3 w-3 mr-1" />
                                Update
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial Requirements */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                      <DollarSign className="h-5 w-5 mr-2" />
                      Financial Requirements
                    </h4>
                    <div className="space-y-4">
                      {[
                        {
                          name: "Tax Clearance Certificate",
                          status: "Compliant",
                          description:
                            "Valid tax clearance from relevant tax authorities",
                          lastUpdated: "2024-01-20",
                          expiry: "2024-12-31",
                          documents: ["Tax_Clearance_2024.pdf"],
                          priority: "High",
                        },
                        {
                          name: "Audited Financial Statements",
                          status: "Compliant",
                          description:
                            "Audited financial statements for the last 3 years",
                          lastUpdated: "2024-01-18",
                          expiry: "2024-12-31",
                          documents: [
                            "Audited_Statements_2023.pdf",
                            "Audited_Statements_2022.pdf",
                          ],
                          priority: "High",
                        },
                        {
                          name: "Bank Reference Letter",
                          status: "Expiring Soon",
                          description:
                            "Bank reference letter not older than 6 months",
                          lastUpdated: "2023-08-15",
                          expiry: "2024-02-15",
                          documents: ["Bank_Reference.pdf"],
                          priority: "Medium",
                        },
                      ].map((req) => (
                        <div
                          key={req.name}
                          className="bg-white rounded-lg border p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h5 className="font-medium text-gray-900">
                                  {req.name}
                                </h5>
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    req.status === "Compliant"
                                      ? "bg-green-100 text-green-800"
                                      : req.status === "Expiring Soon"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {req.status}
                                </span>
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    req.priority === "High"
                                      ? "bg-red-100 text-red-800"
                                      : req.priority === "Medium"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {req.priority} Priority
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">
                                {req.description}
                              </p>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs text-gray-500">
                                <div>
                                  <span className="font-medium">
                                    Last Updated:
                                  </span>
                                  <p>
                                    {new Date(
                                      req.lastUpdated,
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium">Expires:</span>
                                  <p
                                    className={
                                      req.status === "Expiring Soon"
                                        ? "text-yellow-600 font-medium"
                                        : ""
                                    }
                                  >
                                    {req.expiry}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium">
                                    Documents:
                                  </span>
                                  <p>{req.documents.length} file(s)</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <button className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </button>
                              <button className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                                <Upload className="h-3 w-3 mr-1" />
                                Update
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Professional Requirements */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                      <Award className="h-5 w-5 mr-2" />
                      Professional Requirements
                    </h4>
                    <div className="space-y-4">
                      {[
                        {
                          name: "Professional License/Certification",
                          status: "Non-Compliant",
                          description:
                            "Valid professional license from relevant regulatory body",
                          lastUpdated: "2023-12-15",
                          expiry: "2024-01-15",
                          documents: ["Professional_License.pdf"],
                          priority: "High",
                        },
                        {
                          name: "Insurance Certificate",
                          status: "Expiring Soon",
                          description:
                            "Valid professional indemnity and public liability insurance",
                          lastUpdated: "2023-11-20",
                          expiry: "2024-02-20",
                          documents: ["Insurance_Certificate.pdf"],
                          priority: "Medium",
                        },
                        {
                          name: "Quality Management Certification",
                          status: "Compliant",
                          description:
                            "ISO 9001 or equivalent quality management system certification",
                          lastUpdated: "2024-01-05",
                          expiry: "2025-01-05",
                          documents: ["ISO9001_Certificate.pdf"],
                          priority: "Low",
                        },
                      ].map((req) => (
                        <div
                          key={req.name}
                          className="bg-white rounded-lg border p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h5 className="font-medium text-gray-900">
                                  {req.name}
                                </h5>
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    req.status === "Compliant"
                                      ? "bg-green-100 text-green-800"
                                      : req.status === "Expiring Soon"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {req.status}
                                </span>
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    req.priority === "High"
                                      ? "bg-red-100 text-red-800"
                                      : req.priority === "Medium"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {req.priority} Priority
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">
                                {req.description}
                              </p>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs text-gray-500">
                                <div>
                                  <span className="font-medium">
                                    Last Updated:
                                  </span>
                                  <p>
                                    {new Date(
                                      req.lastUpdated,
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium">Expires:</span>
                                  <p
                                    className={
                                      req.status === "Non-Compliant"
                                        ? "text-red-600 font-medium"
                                        : req.status === "Expiring Soon"
                                          ? "text-yellow-600 font-medium"
                                          : ""
                                    }
                                  >
                                    {req.expiry}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium">
                                    Documents:
                                  </span>
                                  <p>{req.documents.length} file(s)</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <button className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </button>
                              <button className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                                <Upload className="h-3 w-3 mr-1" />
                                Update
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Compliance Actions */}
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-4">
                      Recommended Actions
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Urgent: Professional License Expired
                          </p>
                          <p className="text-sm text-gray-600">
                            Your professional license expired on January 15,
                            2024. Please renew immediately to maintain
                            compliance.
                          </p>
                          <button className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700">
                            <Upload className="h-3 w-3 mr-1" />
                            Upload Renewed License
                          </button>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Warning: Documents Expiring Soon
                          </p>
                          <p className="text-sm text-gray-600">
                            2 documents will expire within the next 30 days.
                            Schedule renewals to avoid compliance issues.
                          </p>
                          <button className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200">
                            <Calendar className="h-3 w-3 mr-1" />
                            Schedule Renewals
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "new-clarifications":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Submit New Clarification Request
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Request clarification for any tender or contract requirements
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tender Reference
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="">Select Active Tender</option>
                        <option value="TB001">
                          TB001 - Road Construction and Maintenance Services
                        </option>
                        <option value="TB002">
                          TB002 - Supply of Medical Equipment to General
                          Hospitals
                        </option>
                        <option value="TB003">
                          TB003 - School Building Renovation Project
                        </option>
                        <option value="TB004">
                          TB004 - ICT Infrastructure Development
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="">Select Category</option>
                        <option value="technical">
                          Technical Specifications
                        </option>
                        <option value="financial">
                          Financial Requirements
                        </option>
                        <option value="legal">Legal/Compliance</option>
                        <option value="timeline">Timeline/Deadlines</option>
                        <option value="documentation">Documentation</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Brief subject of your clarification request"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question/Details
                    </label>
                    <textarea
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Please provide detailed description of what you need clarification on..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reference Documents (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          Upload supporting documents
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          PNG, JPG, PDF up to 10MB
                        </p>
                        <div className="mt-4">
                          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200">
                            <Plus className="h-4 w-4 mr-1" />
                            Choose Files
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="urgent"
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="urgent"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Mark as urgent
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="emailCopy"
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="emailCopy"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Send copy to email
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      Save as Draft
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                      <Send className="h-4 w-4 mr-2" />
                      Submit Clarification
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "existing-clarifications":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Clarification History
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Track all your submitted clarifications and responses
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="all">All Status</option>
                      <option value="pending">Pending Response</option>
                      <option value="responded">Responded</option>
                      <option value="closed">Closed</option>
                    </select>
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search clarifications..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    {
                      id: "CLR001",
                      tender:
                        "TB001 - Road Construction and Maintenance Services",
                      subject: "Technical specifications for asphalt grade",
                      category: "Technical Specifications",
                      status: "Responded",
                      submittedDate: "2024-01-25",
                      responseDate: "2024-01-26",
                      urgent: false,
                      response:
                        "The asphalt grade required is AC 20 as per Nigerian standard specifications. Please refer to section 3.2 of the technical document.",
                    },
                    {
                      id: "CLR002",
                      tender: "TB002 - Supply of Medical Equipment",
                      subject: "Delivery timeline clarification",
                      category: "Timeline/Deadlines",
                      status: "Pending Response",
                      submittedDate: "2024-01-27",
                      responseDate: null,
                      urgent: true,
                      response: null,
                    },
                    {
                      id: "CLR003",
                      tender: "TB003 - School Building Renovation",
                      subject: "Payment terms and advance payment",
                      category: "Financial Requirements",
                      status: "Responded",
                      submittedDate: "2024-01-24",
                      responseDate: "2024-01-25",
                      urgent: false,
                      response:
                        "Advance payment of 15% will be provided upon contract signing. Remaining payments as per schedule in contract terms.",
                    },
                    {
                      id: "CLR004",
                      tender: "TB001 - Road Construction and Maintenance",
                      subject: "Required insurance coverage amount",
                      category: "Legal/Compliance",
                      status: "Closed",
                      submittedDate: "2024-01-22",
                      responseDate: "2024-01-23",
                      urgent: false,
                      response:
                        "Professional indemnity insurance of ₦50 million and public liability insurance of ₦100 million are required.",
                    },
                  ].map((clarification) => (
                    <div
                      key={clarification.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium text-gray-900">
                              {clarification.subject}
                            </h3>
                            {clarification.urgent && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Urgent
                              </span>
                            )}
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                clarification.status === "Responded"
                                  ? "bg-green-100 text-green-800"
                                  : clarification.status === "Pending Response"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {clarification.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {clarification.tender}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                            <div>
                              <span className="font-medium">Category:</span>{" "}
                              {clarification.category}
                            </div>
                            <div>
                              <span className="font-medium">Submitted:</span>{" "}
                              {new Date(
                                clarification.submittedDate,
                              ).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="font-medium">Response:</span>{" "}
                              {clarification.responseDate
                                ? new Date(
                                    clarification.responseDate,
                                  ).toLocaleDateString()
                                : "Pending"}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </button>
                          {clarification.status === "Pending Response" && (
                            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </button>
                          )}
                        </div>
                      </div>

                      {clarification.response && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-start space-x-3">
                            <MessageSquare className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                              <h4 className="text-sm font-medium text-green-900">
                                Official Response
                              </h4>
                              <p className="text-sm text-green-800 mt-1">
                                {clarification.response}
                              </p>
                              <p className="text-xs text-green-600 mt-2">
                                Responded on{" "}
                                {new Date(
                                  clarification.responseDate!,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      Total Submitted
                    </p>
                    <p className="text-2xl font-bold text-gray-900">24</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      Pending Response
                    </p>
                    <p className="text-2xl font-bold text-gray-900">3</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      Responded
                    </p>
                    <p className="text-2xl font-bold text-gray-900">18</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center">
                  <Archive className="h-8 w-8 text-gray-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Closed</p>
                    <p className="text-2xl font-bold text-gray-900">3</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "eportal":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  Kano State ePortal
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Comprehensive digital government services and resources portal
                </p>
              </div>
              <div className="p-6">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Welcome to Kano State Digital Services
                  </h3>
                  <p className="text-gray-700">
                    Access a wide range of government services, information, and
                    resources all in one place. Our ePortal makes it easier for
                    companies and citizens to interact with government services
                    efficiently.
                  </p>
                </div>

                {/* Service Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Business Registration
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Register your business, obtain permits, and manage your
                      business documentation online.
                    </p>
                    <button className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center">
                      Access Service <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>

                  <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Tax Services
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      File tax returns, make payments, and access tax clearance
                      certificates.
                    </p>
                    <button className="text-green-600 text-sm font-medium hover:text-green-800 flex items-center">
                      Access Service <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>

                  <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <Shield className="h-6 w-6 text-purple-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Licensing & Permits
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Apply for and renew various business licenses and permits
                      online.
                    </p>
                    <button className="text-purple-600 text-sm font-medium hover:text-purple-800 flex items-center">
                      Access Service <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>

                  <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                      <Building2 className="h-6 w-6 text-orange-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Property Services
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Land registration, property tax, and real estate
                      documentation services.
                    </p>
                    <button className="text-orange-600 text-sm font-medium hover:text-orange-800 flex items-center">
                      Access Service <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>

                  <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                      <Users className="h-6 w-6 text-red-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Citizen Services
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Birth certificates, marriage certificates, and other vital
                      records.
                    </p>
                    <button className="text-red-600 text-sm font-medium hover:text-red-800 flex items-center">
                      Access Service <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>

                  <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                      <Globe className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Digital Resources
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Access government publications, forms, and digital
                      resources.
                    </p>
                    <button className="text-indigo-600 text-sm font-medium hover:text-indigo-800 flex items-center">
                      Access Service <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>

                {/* Recent Updates */}
                <div className="bg-white border rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Recent Updates & Announcements
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
                        <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-gray-900">
                            New Online Tax Payment System
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Enhanced online tax payment system is now available
                            with mobile money integration.
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            January 28, 2024
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Business Registration Process Simplified
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            New streamlined business registration process
                            reduces approval time to 3 business days.
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            January 25, 2024
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4 p-4 bg-orange-50 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-gray-900">
                            System Maintenance Notice
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Scheduled maintenance on February 1, 2024, from
                            12:00 AM to 4:00 AM.
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            January 22, 2024
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "open-contracting-portal":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  Open Contracting Data Portal
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Transparent access to government procurement and contracting
                  data
                </p>
              </div>
              <div className="p-6">
                {/* Overview Section */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Transparency in Government Contracting
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Access comprehensive data on government procurement
                    processes, contract awards, and implementation progress. Our
                    commitment to transparency ensures accountability and
                    promotes fair competition.
                  </p>
                  <div className="flex items-center space-x-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      OCDS Compliant
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <Shield className="h-4 w-4 mr-1" />
                      Real-time Data
                    </span>
                  </div>
                </div>

                {/* Contract Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white border rounded-lg p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900">1,247</h4>
                    <p className="text-sm text-gray-600">Total Contracts</p>
                    <p className="text-xs text-green-600 mt-1">
                      +15% this quarter
                    </p>
                  </div>

                  <div className="bg-white border rounded-lg p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900">
                      ��89.2B
                    </h4>
                    <p className="text-sm text-gray-600">Total Value</p>
                    <p className="text-xs text-green-600 mt-1">
                      +22% this year
                    </p>
                  </div>

                  <div className="bg-white border rounded-lg p-6 text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Award className="h-6 w-6 text-purple-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900">847</h4>
                    <p className="text-sm text-gray-600">Active Contracts</p>
                    <p className="text-xs text-blue-600 mt-1">
                      68% completion rate
                    </p>
                  </div>

                  <div className="bg-white border rounded-lg p-6 text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Building2 className="h-6 w-6 text-orange-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900">156</h4>
                    <p className="text-sm text-gray-600">
                      Registered Suppliers
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      +8% this month
                    </p>
                  </div>
                </div>

                {/* Data Access Tools */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Contract Analytics
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Interactive dashboards and analytics on procurement
                      trends, spending patterns, and performance metrics.
                    </p>
                    <button className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center">
                      View Analytics <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>

                  <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <Download className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Data Downloads
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Download procurement data in various formats including
                      CSV, JSON, and OCDS standard format.
                    </p>
                    <button className="text-green-600 text-sm font-medium hover:text-green-800 flex items-center">
                      Download Data <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>

                  <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <Search className="h-6 w-6 text-purple-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Contract Search
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Advanced search tools to find specific contracts,
                      suppliers, and procurement opportunities.
                    </p>
                    <button className="text-purple-600 text-sm font-medium hover:text-purple-800 flex items-center">
                      Search Contracts <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>

                  <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                      <Globe className="h-6 w-6 text-orange-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      API Access
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Programmatic access to procurement data through our
                      RESTful API endpoints.
                    </p>
                    <button className="text-orange-600 text-sm font-medium hover:text-orange-800 flex items-center">
                      API Documentation{" "}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>

                  <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Red Flag Analysis
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Automated detection of potential procurement
                      irregularities and risk indicators.
                    </p>
                    <button className="text-red-600 text-sm font-medium hover:text-red-800 flex items-center">
                      View Analysis <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>

                  <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                      <History className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Historical Data
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Access to historical procurement records and trend
                      analysis over time.
                    </p>
                    <button className="text-indigo-600 text-sm font-medium hover:text-indigo-800 flex items-center">
                      Historical Records{" "}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>

                {/* Recent Contract Awards */}
                <div className="bg-white border rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Recent Contract Awards
                      </h3>
                      <button className="text-sm text-blue-600 hover:text-blue-800">
                        View All Awards
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contract Title
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Awarded To
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Value
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Award Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              Rural Road Construction - Phase 3
                            </div>
                            <div className="text-sm text-gray-500">
                              Ministry of Works
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            Kano Construction Co. Ltd
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ₦2.8B
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            Jan 28, 2024
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              Medical Equipment Supply
                            </div>
                            <div className="text-sm text-gray-500">
                              Ministry of Health
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            MedTech Solutions Nigeria
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ₦1.5B
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            Jan 26, 2024
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              In Progress
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              School Infrastructure Upgrade
                            </div>
                            <div className="text-sm text-gray-500">
                              Ministry of Education
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            Northern Builders Ltd
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ��950M
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            Jan 25, 2024
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeSection.replace("-", " ").toUpperCase()}
            </h3>
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
                <h1 className="text-lg font-bold text-green-700">
                  Kano State Government
                </h1>
                <p className="text-xs text-gray-600">
                  E-Tendering & Open Contracting Portal
                </p>
              </div>
            </div>

            {/* Top Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link
                to="/"
                className="text-sm font-medium text-gray-700 hover:text-green-700 flex items-center"
              >
                <Home className="h-4 w-4 mr-1" />
                Home
              </Link>
              <Link
                to="#"
                className="text-sm font-medium text-gray-700 hover:text-green-700 flex items-center"
              >
                <Info className="h-4 w-4 mr-1" />
                About Us
              </Link>
              <Link
                to="#"
                className="text-sm font-medium text-gray-700 hover:text-green-700 flex items-center"
              >
                <HelpCircle className="h-4 w-4 mr-1" />
                How it Works
              </Link>
              <button
                onClick={() => setActiveSection("eportal")}
                className={`text-sm font-medium flex items-center ${
                  activeSection === "eportal"
                    ? "text-green-700"
                    : "text-gray-700 hover:text-green-700"
                }`}
              >
                <Globe className="h-4 w-4 mr-1" />
                ePortal
              </button>
              <button
                onClick={() => setActiveSection("open-contracting-portal")}
                className={`text-sm font-medium flex items-center ${
                  activeSection === "open-contracting-portal"
                    ? "text-green-700"
                    : "text-gray-700 hover:text-green-700"
                }`}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Open Contracting Portal
              </button>
              <Link
                to="#"
                className="text-sm font-medium text-gray-700 hover:text-green-700 flex items-center"
              >
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
                {sidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div
          className={`${sidebarOpen ? "w-64" : "w-0"} overflow-hidden transition-all duration-300 bg-white border-r border-gray-200 h-screen sticky top-16`}
        >
          <nav className="p-4 space-y-2">
            <div className="mb-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Bid Activity
              </h2>
            </div>

            <button
              onClick={() => setActiveSection("tender-ads")}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                activeSection === "tender-ads"
                  ? "bg-green-100 text-green-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              disabled={companyData.status === "Blacklisted"}
            >
              <FileText className="h-4 w-4 mr-3" />
              {companyData.status === "Pending" ? "Browse Opportunities" : "Tender Advertisements"}
              {companyData.status === "Pending" && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  View Only
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSection("purchased-bids")}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                activeSection === "purchased-bids"
                  ? "bg-green-100 text-green-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              disabled={companyData.status === "Pending" || companyData.status === "Blacklisted"}
            >
              <Bookmark className="h-4 w-4 mr-3" />
              {companyData.status === "Approved" ? "Purchased Bids" : "My Applications"}
              {(companyData.status === "Pending" || companyData.status === "Blacklisted") && (
                <Lock className="h-4 w-4 ml-2 text-gray-400" />
              )}
            </button>

            <button
              onClick={() => setActiveSection("awarded-bids")}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                activeSection === "awarded-bids"
                  ? "bg-green-100 text-green-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              disabled={companyData.status === "Pending" || companyData.status === "Blacklisted"}
            >
              <Award className="h-4 w-4 mr-3" />
              {companyData.status === "Approved" ? "Awarded Bids" : "Previous Awards"}
              {(companyData.status === "Pending" || companyData.status === "Blacklisted") && (
                <Lock className="h-4 w-4 ml-2 text-gray-400" />
              )}
            </button>

            <div className="pt-4 mb-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Company Profile & Compliance
              </h2>
            </div>

            <button
              onClick={() => setActiveSection("my-profile")}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                activeSection === "my-profile"
                  ? "bg-green-100 text-green-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Users className="h-4 w-4 mr-3" />
              My Profile
            </button>

            <button
              onClick={() => setActiveSection("my-documents")}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                activeSection === "my-documents"
                  ? "bg-green-100 text-green-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Upload className="h-4 w-4 mr-3" />
              {companyData.status === "Pending" ? "Verification Center" :
               companyData.status === "Suspended" ? "Document Updates" : "My Documents"}
              {companyData.status === "Pending" && (
                <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                  Required
                </span>
              )}
              {companyData.status === "Suspended" && (
                <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                  Action Required
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSection("detailed-compliance")}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                activeSection === "detailed-compliance"
                  ? "bg-green-100 text-green-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              disabled={companyData.status === "Blacklisted"}
            >
              <Shield className="h-4 w-4 mr-3" />
              {companyData.status === "Suspended" ? "Reinstatement Portal" : "Detailed Compliance"}
              {companyData.status === "Blacklisted" && (
                <Lock className="h-4 w-4 ml-2 text-gray-400" />
              )}
            </button>

            <div className="pt-4 mb-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Communication
              </h2>
            </div>

            <button
              onClick={() => setActiveSection("new-clarifications")}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                activeSection === "new-clarifications"
                  ? "bg-green-100 text-green-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              disabled={companyData.status !== "Approved"}
            >
              <Plus className="h-4 w-4 mr-3" />
              {companyData.status === "Approved" ? "New Clarifications" : "Request Clarifications"}
              {companyData.status !== "Approved" && (
                <Lock className="h-4 w-4 ml-2 text-gray-400" />
              )}
            </button>

            <button
              onClick={() => setActiveSection("existing-clarifications")}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                activeSection === "existing-clarifications"
                  ? "bg-green-100 text-green-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <History className="h-4 w-4 mr-3" />
              {companyData.status === "Approved" ? "Existing Clarifications" : "Previous Requests"}
            </button>

            <button
              onClick={() => setActiveSection("messages")}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                activeSection === "messages"
                  ? "bg-green-100 text-green-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Mail className="h-4 w-4 mr-3" />
              {companyData.status === "Approved" ? "Messages" : "Notifications Center"}
            </button>

            <div className="pt-4 mb-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Business
              </h2>
            </div>

            <button
              onClick={() => setActiveSection("transaction-history")}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                activeSection === "transaction-history"
                  ? "bg-green-100 text-green-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              disabled={companyData.status === "Pending" || companyData.status === "Blacklisted"}
            >
              <CreditCard className="h-4 w-4 mr-3" />
              Transaction History
              {(companyData.status === "Pending" || companyData.status === "Blacklisted") && (
                <Lock className="h-4 w-4 ml-2 text-gray-400" />
              )}
            </button>

            <button
              onClick={() => setActiveSection("contracts-awarded")}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                activeSection === "contracts-awarded"
                  ? "bg-green-100 text-green-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              disabled={companyData.status === "Blacklisted"}
            >
              <FileCheck className="h-4 w-4 mr-3" />
              {companyData.status === "Approved" ? "Contracts Awarded" : "Contract History"}
              {companyData.status === "Blacklisted" && (
                <Lock className="h-4 w-4 ml-2 text-gray-400" />
              )}
            </button>

            <button
              onClick={() => setActiveSection("annual-report")}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                activeSection === "annual-report"
                  ? "bg-green-100 text-green-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              disabled={companyData.status === "Pending" || companyData.status === "Blacklisted"}
            >
              <BarChart3 className="h-4 w-4 mr-3" />
              {companyData.status === "Approved" ? "Annual Report" : "Performance Report"}
              {(companyData.status === "Pending" || companyData.status === "Blacklisted") && (
                <Lock className="h-4 w-4 ml-2 text-gray-400" />
              )}
            </button>

            <button
              onClick={() => setActiveSection("grievance")}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                activeSection === "grievance"
                  ? "bg-green-100 text-green-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Gavel className="h-4 w-4 mr-3" />
              {companyData.status === "Blacklisted" ? "Appeal Center" : "Grievance Redress"}
              {companyData.status === "Blacklisted" && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  Available
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6">{renderMainContent()}</main>
      </div>

      {/* Status Demo Panel */}
      <StatusDemo
        currentStatus={companyData.status}
        onStatusChange={setDemoStatus}
      />

      {/* Express Interest Modal */}
      {showExpressInterestModal && selectedTender && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Express Interest
                </h3>
                <button
                  onClick={() => setShowExpressInterestModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    {selectedTender.title}
                  </h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>
                      <span className="font-medium">Ministry:</span>{" "}
                      {selectedTender.ministry}
                    </p>
                    <p>
                      <span className="font-medium">Value:</span>{" "}
                      {formatCurrency(selectedTender.value)}
                    </p>
                    <p>
                      <span className="font-medium">Deadline:</span>{" "}
                      {new Date(selectedTender.deadline).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-medium">Location:</span>{" "}
                      {selectedTender.location}
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Important Notice:</p>
                      <p>
                        By expressing interest, you acknowledge that you meet
                        the basic requirements and intend to participate in this
                        tender. This action will make you eligible to submit a
                        bid.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      required
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      I confirm that my company meets the basic eligibility
                      requirements
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      required
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      I understand the tender requirements and deadlines
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      required
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      I agree to the terms and conditions
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowExpressInterestModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmExpressInterest}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Confirm Interest
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Bid Modal */}
      {showSubmitBidModal && selectedTender && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Submit Bid
                </h3>
                <button
                  onClick={() => setShowSubmitBidModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-6 max-h-96 overflow-y-auto">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-green-900 mb-2">
                    {selectedTender.title}
                  </h4>
                  <div className="text-sm text-green-800 grid grid-cols-2 gap-4">
                    <div>
                      <p>
                        <span className="font-medium">Tender ID:</span>{" "}
                        {selectedTender.id}
                      </p>
                      <p>
                        <span className="font-medium">Ministry:</span>{" "}
                        {selectedTender.ministry}
                      </p>
                    </div>
                    <div>
                      <p>
                        <span className="font-medium">Value:</span>{" "}
                        {formatCurrency(selectedTender.value)}
                      </p>
                      <p>
                        <span className="font-medium">Deadline:</span>{" "}
                        {new Date(selectedTender.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bid Amount (₦)
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your bid amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Timeline (Days)
                    </label>
                    <input
                      type="number"
                      placeholder="Enter completion timeline in days"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Technical Proposal
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Describe your technical approach and methodology"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Financial Proposal
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Provide breakdown of costs and payment terms"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supporting Documents
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          Upload bid documents (PDF, DOC, DOCX)
                        </p>
                        <button className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200">
                          <Plus className="h-4 w-4 mr-1" />
                          Choose Files
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
                      <div className="text-sm text-red-800">
                        <p className="font-medium mb-1">Important:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Ensure all required documents are uploaded</li>
                          <li>Review your bid carefully before submission</li>
                          <li>
                            Bids cannot be modified after submission deadline
                          </li>
                          <li>Late submissions will not be accepted</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        required
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        I confirm that all information provided is accurate and
                        complete
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        required
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        I understand that this bid is legally binding upon
                        acceptance
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        required
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        I agree to the terms and conditions of the tender
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowSubmitBidModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  Save as Draft
                </button>
                <button
                  onClick={confirmSubmitBid}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  Submit Bid
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
