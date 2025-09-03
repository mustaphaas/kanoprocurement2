import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/StaticAuthContext";
import { formatCurrency } from "@/lib/utils";
import { getDashboardConfig, type CompanyStatus } from "@/lib/dashboardConfig";
import { persistentStorage } from "@/lib/persistentStorage";
import { logUserAction } from "@/lib/auditLogStorage";
import { tenderStatusChecker, TenderStatusInfo } from "@/lib/tenderSettings";
import { messageService } from "@/lib/messageService";
import { getAggregatedMinistryTenders } from "@/lib/companyTenderAggregator";
import CompanyMessageCenter from "@/components/CompanyMessageCenter";
import PaymentRequest from "@/components/PaymentRequest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
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
  Receipt,
  Activity,
  Zap,
  ArrowUpRight,
  PieChart,
  LineChart,
  Sparkles,
  Layers,
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
  | "payment-requests"
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

export default function CompanyDashboardModern() {
  const [activeSection, setActiveSection] =
    useState<ActiveSection>("dashboard");
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [showExpressInterestModal, setShowExpressInterestModal] =
    useState(false);
  const [showSubmitBidModal, setShowSubmitBidModal] = useState(false);
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [statusUpdateTrigger, setStatusUpdateTrigger] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Status update monitoring
  useEffect(() => {
    const handleStorageChange = () => {
      setStatusUpdateTrigger((prev) => prev + 1);
    };

    const handlePersistentStorageChange = () => {
      setStatusUpdateTrigger((prev) => prev + 1);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      "persistentStorageChange",
      handlePersistentStorageChange,
    );

    const interval = setInterval(() => {
      setStatusUpdateTrigger((prev) => prev + 1);
    }, 200);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "persistentStorageChange",
        handlePersistentStorageChange,
      );
      clearInterval(interval);
    };
  }, []);

  // Company status logic
  const hasExpiredDocuments = () => {
    const expiredDocs = [
      { name: "Professional License", expiry: "2024-01-15" },
    ];
    return expiredDocs.some((doc) => new Date(doc.expiry) < new Date());
  };

  const getCompanyStatus = (): CompanyStatus => {
    const userEmail = user?.email?.toLowerCase() || "";
    const storageKey = `userStatus_${userEmail}`;

    const adminSetStatus = persistentStorage.getItem(storageKey);

    if (
      adminSetStatus &&
      ["Pending", "Approved", "Suspended", "Blacklisted"].includes(
        adminSetStatus,
      )
    ) {
      return adminSetStatus as CompanyStatus;
    }

    if (userEmail === "pending@company.com") return "Pending";
    if (userEmail === "suspended@company.com") return "Suspended";
    if (userEmail === "blacklisted@company.com") return "Blacklisted";
    if (userEmail === "approved@company.com") return "Approved";

    const hasExpired = hasExpiredDocuments();
    if (hasExpired) return "Suspended";

    return "Pending";
  };

  const getCompanyDetails = () => {
    const userEmail = user?.email?.toLowerCase() || "";
    const status = getCompanyStatus();

    const companyDetails = {
      "pending@company.com": {
        name: "New Ventures Construction Ltd",
        email: userEmail,
        totalAdverts: 150,
        bidsExpressedInterest: 0,
        activeBids: 0,
        notActiveBids: 0,
        totalContractValue: "₦0",
      },
      "suspended@company.com": {
        name: "Omega Engineering Services",
        email: userEmail,
        totalAdverts: 150,
        bidsExpressedInterest: 15,
        activeBids: 0,
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

    let details = companyDetails[userEmail as keyof typeof companyDetails];

    if (!details) {
      try {
        const registeredCompanies = JSON.parse(
          localStorage.getItem("registeredCompanies") || "[]",
        );
        const registeredCompany = registeredCompanies.find(
          (company: any) => company.email === userEmail,
        );

        if (registeredCompany) {
          details = {
            name: registeredCompany.companyName,
            email: registeredCompany.email,
            totalAdverts: 0,
            bidsExpressedInterest: 0,
            activeBids: 0,
            notActiveBids: 0,
            totalContractValue: "₦0",
          };
        } else {
          details = {
            name: "Company Not Found",
            email: userEmail,
            totalAdverts: 0,
            bidsExpressedInterest: 0,
            activeBids: 0,
            notActiveBids: 0,
            totalContractValue: "₦0",
          };
        }
      } catch (error) {
        console.error("Error loading registered company data:", error);
        details = {
          name: "Unknown Company",
          email: userEmail,
          totalAdverts: 0,
          bidsExpressedInterest: 0,
          activeBids: 0,
          notActiveBids: 0,
          totalContractValue: "₦0",
        };
      }
    }

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

  const companyData: CompanyData = useMemo(() => {
    return getCompanyDetails();
  }, [statusUpdateTrigger, user?.email]);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  // Monitor message updates
  useEffect(() => {
    const updateMessageCount = () => {
      const count = messageService.getUnreadCount(companyData.email);
      setUnreadMessageCount(count);
    };

    updateMessageCount();
    const unsubscribe = messageService.subscribe(updateMessageCount);
    return unsubscribe;
  }, [companyData.email]);

  // Monitor tender status changes
  useEffect(() => {
    const monitorInterval = setInterval(() => {
      messageService.monitorTenderStatusChanges();
    }, 30000);

    return () => clearInterval(monitorInterval);
  }, []);

  // Tenders state
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

  // Load tenders from localStorage
  useEffect(() => {
    const loadTenders = () => {
      const mainTenders = localStorage.getItem("kanoproc_tenders");
      let allTenders: any[] = [];

      if (mainTenders) {
        try {
          allTenders = JSON.parse(mainTenders);
        } catch (error) {
          console.error("Error parsing main tenders:", error);
        }
      }

      const statesKey = `companyTenderStates_${companyData.email.toLowerCase()}`;
      const storedTenderStates = localStorage.getItem(statesKey) || "{}";
      const tenderStates = JSON.parse(storedTenderStates);
      const lastProcessedTenders = JSON.parse(
        localStorage.getItem("lastProcessedTenders") || "[]",
      );

      if (allTenders.length > 0) {
        allTenders.forEach((tender: any) => {
          if (!lastProcessedTenders.includes(tender.id)) {
            messageService.createBidCreatedMessage(
              {
                id: tender.id,
                title: tender.title,
                ministry: tender.ministry || "Kano State Government",
                category: tender.category || "General",
                value: formatCurrency(tender.budget),
                deadline: tender.closingDate,
              },
              companyData.email,
            );
          }
        });

        const currentTenderIds = allTenders.map((t: any) => t.id);
        localStorage.setItem(
          "lastProcessedTenders",
          JSON.stringify(currentTenderIds),
        );

        const formattedTenders = allTenders.map((tender: any) => ({
          id: tender.id,
          title: tender.title,
          ministry: tender.ministry || "Kano State Government",
          category: tender.category || "General",
          value: formatCurrency(tender.budget),
          deadline: tender.closingDate,
          location: "Kano State",
          status:
            tender.status === "Open" || tender.status === "Published"
              ? "Open"
              : "Closed",
          hasExpressedInterest:
            tenderStates[tender.id]?.hasExpressedInterest || false,
          hasBid: tenderStates[tender.id]?.hasBid || false,
          unspscCode: "72141100",
          procurementMethod: "Open Tendering",
        }));

        const defaultTenders = getDefaultTenders();
        const finalTenders = [...formattedTenders];

        defaultTenders.forEach((defaultTender) => {
          if (
            !formattedTenders.find((t: Tender) => t.id === defaultTender.id)
          ) {
            finalTenders.push(defaultTender);
          }
        });

        setTenders(finalTenders);
      } else {
        setTenders(getDefaultTenders());
      }
    };

    loadTenders();
    const interval = setInterval(loadTenders, 30000);
    return () => clearInterval(interval);
  }, [companyData.email]);

  // Log dashboard access
  useEffect(() => {
    logUserAction(
      companyData.email.toLowerCase(),
      "company_user",
      "COMPANY_DASHBOARD_ACCESSED",
      "Company Dashboard",
      `Company user ${companyData.name} accessed the modern company dashboard`,
      "LOW",
      undefined,
      {
        accessTime: new Date().toISOString(),
        companyName: companyData.name,
        companyEmail: companyData.email,
        companyStatus: companyData.status,
        userAgent: navigator.userAgent,
      },
    );
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
    logUserAction(
      companyData.email.toLowerCase(),
      "company_user",
      "COMPANY_LOGOUT",
      "Company Portal",
      `Company user ${companyData.email} logged out of the system`,
      "LOW",
      undefined,
      {
        logoutTime: new Date().toISOString(),
        companyName: companyData.name,
        sessionDuration: "N/A",
      },
    );

    navigate("/");
  };

  const getStatusBadgeVariant = (status: CompanyStatus) => {
    switch (status) {
      case "Approved":
        return "default";
      case "Pending":
        return "secondary";
      case "Suspended":
        return "destructive";
      case "Blacklisted":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: CompanyStatus) => {
    switch (status) {
      case "Approved":
        return CheckCircle;
      case "Pending":
        return Clock;
      case "Suspended":
        return AlertTriangle;
      case "Blacklisted":
        return Ban;
      default:
        return Clock;
    }
  };

  const handleExpressInterest = (tender: Tender) => {
    if (companyData.status === "Suspended") {
      alert(
        "Your account is suspended. Please resolve compliance issues through the 'Reinstatement Portal' to restore tender participation privileges.",
      );
      return;
    }
    if (companyData.status === "Pending") {
      alert(
        "Your account is pending approval. You will be able to express interest in tenders once your registration is approved.",
      );
      return;
    }
    if (companyData.status === "Blacklisted") {
      alert(
        "Your account is blacklisted. You cannot participate in procurement activities. Please submit an appeal if you believe this is in error.",
      );
      return;
    }
    if (companyData.status !== "Approved") {
      alert("Your account must be approved to express interest in tenders.");
      return;
    }

    const statusInfo = tenderStatusChecker.getStatusInfo(
      tender.status,
      tender.deadline,
    );
    if (!statusInfo.canExpressInterest) {
      if (tender.status === "Closed") {
        alert(
          "This tender is closed. The deadline has passed and no new expressions of interest are being accepted.",
        );
      } else if (tender.status === "Draft") {
        alert(
          "This tender is still in draft status and not yet open for expressions of interest.",
        );
      } else {
        alert(
          `This tender is in '${tender.status}' status and is no longer accepting expressions of interest.`,
        );
      }
      return;
    }

    setSelectedTender(tender);
    setShowExpressInterestModal(true);
  };

  const handleSubmitBid = (tender: Tender) => {
    if (companyData.status === "Suspended") {
      alert(
        "Your account is suspended. Please resolve compliance issues through the 'Reinstatement Portal' to restore bidding privileges.",
      );
      return;
    }
    if (companyData.status === "Pending") {
      alert(
        "Your account is pending approval. You will be able to submit bids once your registration is approved.",
      );
      return;
    }
    if (companyData.status === "Blacklisted") {
      alert(
        "Your account is blacklisted. You cannot submit bids. Please submit an appeal if you believe this is in error.",
      );
      return;
    }
    if (companyData.status !== "Approved") {
      alert("Your account must be approved to submit bids.");
      return;
    }

    const statusInfo = tenderStatusChecker.getStatusInfo(
      tender.status,
      tender.deadline,
    );
    if (!statusInfo.canSubmitBid) {
      if (tender.status === "Closed") {
        alert(
          "This tender is closed. The deadline has passed and no new bids are being accepted.",
        );
      } else if (tender.status === "Draft") {
        alert(
          "This tender is still in draft status and not yet open for bid submissions.",
        );
      } else {
        alert(
          `This tender is in '${tender.status}' status and is no longer accepting bid submissions.`,
        );
      }
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

    setTenders((prevTenders) =>
      prevTenders.map((tender) =>
        tender.id === selectedTender.id
          ? { ...tender, hasExpressedInterest: true }
          : tender,
      ),
    );

    const statesKey = `companyTenderStates_${companyData.email.toLowerCase()}`;
    const storedTenderStates = localStorage.getItem(statesKey) || "{}";
    const tenderStates = JSON.parse(storedTenderStates);
    tenderStates[selectedTender.id] = {
      ...tenderStates[selectedTender.id],
      hasExpressedInterest: true,
    };
    localStorage.setItem(statesKey, JSON.stringify(tenderStates));

    messageService.createEOIConfirmationMessage(
      {
        id: selectedTender.id,
        title: selectedTender.title,
        ministry: selectedTender.ministry,
        deadline: selectedTender.deadline,
        value: selectedTender.value,
      },
      companyData.email,
    );

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

    logUserAction(
      companyData.email.toLowerCase(),
      "company_user",
      "TENDER_INTEREST_EXPRESSED",
      selectedTender.title,
      `Company ${companyData.name} expressed interest in tender: ${selectedTender.title}`,
      "MEDIUM",
      selectedTender.id,
      {
        tenderId: selectedTender.id,
        tenderTitle: selectedTender.title,
        ministry: selectedTender.ministry,
        category: selectedTender.category,
        value: selectedTender.value,
        deadline: selectedTender.deadline,
        companyName: companyData.name,
        companyEmail: companyData.email,
        actionTimestamp: new Date().toISOString(),
      },
    );

    setShowExpressInterestModal(false);
    setSelectedTender(null);
  };

  const confirmSubmitBid = () => {
    if (!selectedTender) return;

    const bidData = {
      id: `BID-${Date.now()}`,
      tenderId: selectedTender.id,
      tenderTitle: selectedTender.title,
      companyName: companyData.name,
      bidAmount: "₦850,000,000",
      status: "Submitted",
      submittedAt: new Date().toISOString(),
      technicalScore: null,
      financialScore: null,
      totalScore: null,
    };

    const existingBids = localStorage.getItem("tenderBids") || "[]";
    const bidsArray = JSON.parse(existingBids);
    bidsArray.push(bidData);
    localStorage.setItem("tenderBids", JSON.stringify(bidsArray));

    setTenders((prevTenders) =>
      prevTenders.map((tender) =>
        tender.id === selectedTender.id
          ? { ...tender, hasBid: true, hasExpressedInterest: true }
          : tender,
      ),
    );

    const statesKey = `companyTenderStates_${companyData.email.toLowerCase()}`;
    const storedTenderStates = localStorage.getItem(statesKey) || "{}";
    const tenderStates = JSON.parse(storedTenderStates);
    tenderStates[selectedTender.id] = {
      ...tenderStates[selectedTender.id],
      hasExpressedInterest: true,
      hasBid: true,
    };
    localStorage.setItem(statesKey, JSON.stringify(tenderStates));

    messageService.createBidConfirmationMessage(
      {
        id: bidData.id,
        tenderId: selectedTender.id,
        tenderTitle: selectedTender.title,
        bidAmount: bidData.bidAmount,
        ministry: selectedTender.ministry,
      },
      companyData.email,
    );

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

    logUserAction(
      companyData.email.toLowerCase(),
      "company_user",
      "BID_SUBMITTED",
      selectedTender.title,
      `Company ${companyData.name} submitted bid for tender: ${selectedTender.title}`,
      "HIGH",
      selectedTender.id,
      {
        bidId: bidData.id,
        tenderId: selectedTender.id,
        tenderTitle: selectedTender.title,
        ministry: selectedTender.ministry,
        category: selectedTender.category,
        tenderValue: selectedTender.value,
        bidAmount: bidData.bidAmount,
        deadline: selectedTender.deadline,
        companyName: companyData.name,
        companyEmail: companyData.email,
        submissionTimestamp: bidData.submittedAt,
      },
    );

    setShowSubmitBidModal(false);
    setSelectedTender(null);
  };

  const StatusIcon = getStatusIcon(companyData.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Modern Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-blue-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                    {companyData.name}
                  </h1>
                  <p className="text-sm text-gray-600 hidden sm:block">
                    Company Dashboard
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge
                variant={getStatusBadgeVariant(companyData.status)}
                className="flex items-center space-x-1"
              >
                <StatusIcon className="h-3 w-3" />
                <span>{companyData.status}</span>
              </Badge>

              <Button
                variant="ghost"
                size="sm"
                className="relative"
                onClick={() => setActiveSection("messages")}
              >
                <MessageSquare className="h-5 w-5" />
                {unreadMessageCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadMessageCount}
                  </span>
                )}
              </Button>

              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeSection === "messages" && (
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
              <Button variant="outline" size="sm" onClick={() => setActiveSection("dashboard")}>
                Back to Dashboard
              </Button>
            </div>
            <CompanyMessageCenter companyEmail={companyData.email} />
          </div>
        )}
        {/* Status Alert */}
        {companyData.status !== "Approved" && (
          <Card className="mb-8 border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50 to-amber-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div className="flex-1">
                  {companyData.status === "Pending" && (
                    <>
                      <h3 className="font-semibold text-orange-800">
                        Account Pending Approval
                      </h3>
                      <p className="text-sm text-orange-700 mt-1">
                        Your company registration is under review by the Bureau
                        of Public Procurement. You will be notified once your
                        account is approved. Estimated processing time: 5-7
                        business days.
                      </p>
                    </>
                  )}
                  {companyData.status === "Suspended" && (
                    <>
                      <h3 className="font-semibold text-orange-800">
                        Account Suspended
                      </h3>
                      <p className="text-sm text-orange-700 mt-1">
                        Your account is suspended due to expired documents.
                        {companyData.suspensionReason && (
                          <span> Reason: {companyData.suspensionReason}. </span>
                        )}
                        Please update your documents to regain full access.
                      </p>
                    </>
                  )}
                  {companyData.status === "Blacklisted" && (
                    <>
                      <h3 className="font-semibold text-red-800">
                        Account Blacklisted
                      </h3>
                      <p className="text-sm text-red-700 mt-1">
                        Your company has been blacklisted from participating in
                        Kano State Government procurements due to{" "}
                        {companyData.blacklistReason || "policy violations"}.
                        Please contact the BPP for more information.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Dashboard Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          {/* Enhanced Tab Navigation */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-blue-100/50 shadow-lg p-2">
            <TabsList className="grid w-full grid-cols-6 bg-transparent gap-2">
              <TabsTrigger
                value="overview"
                className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-blue-50 border border-transparent data-[state=active]:border-blue-200"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="font-medium hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="tenders"
                className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-emerald-50 border border-transparent data-[state=active]:border-emerald-200"
              >
                <FileText className="h-4 w-4" />
                <span className="font-medium hidden sm:inline">Tenders</span>
              </TabsTrigger>
              <TabsTrigger
                value="bids"
                className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-purple-50 border border-transparent data-[state=active]:border-purple-200"
              >
                <Target className="h-4 w-4" />
                <span className="font-medium hidden sm:inline">My Bids</span>
              </TabsTrigger>
              <TabsTrigger
                value="contracts"
                className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-amber-50 border border-transparent data-[state=active]:border-amber-200"
              >
                <Award className="h-4 w-4" />
                <span className="font-medium hidden sm:inline">Contracts</span>
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-rose-50 border border-transparent data-[state=active]:border-rose-200"
              >
                <Users className="h-4 w-4" />
                <span className="font-medium hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger
                value="support"
                className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-indigo-50 border border-transparent data-[state=active]:border-indigo-200"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="font-medium hidden sm:inline">Support</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        Total Tenders
                      </p>
                      <p className="text-3xl font-bold text-blue-900">
                        {companyData.totalAdverts}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Available opportunities
                      </p>
                    </div>
                    <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-600/10 rounded-full -mr-10 -mt-10"></div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/50 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-700">
                        Expressed Interest
                      </p>
                      <p className="text-3xl font-bold text-emerald-900">
                        {companyData.bidsExpressedInterest}
                      </p>
                      <p className="text-xs text-emerald-600 mt-1">
                        EOI submitted
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-600 rounded-2xl shadow-lg">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-600/10 rounded-full -mr-10 -mt-10"></div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200/50 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-700">
                        Active Bids
                      </p>
                      <p className="text-3xl font-bold text-purple-900">
                        {companyData.activeBids}
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        Under evaluation
                      </p>
                    </div>
                    <div className="p-3 bg-purple-600 rounded-2xl shadow-lg">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-purple-600/10 rounded-full -mr-10 -mt-10"></div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-700">
                        Contract Value
                      </p>
                      <p className="text-3xl font-bold text-amber-900">
                        {companyData.totalContractValue}
                      </p>
                      <p className="text-xs text-amber-600 mt-1">
                        Total awarded
                      </p>
                    </div>
                    <div className="p-3 bg-amber-600 rounded-2xl shadow-lg">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-amber-600/10 rounded-full -mr-10 -mt-10"></div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-80 overflow-y-auto">
                  {notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 rounded-xl border-l-4 transition-all duration-200",
                        notification.type === "success" &&
                          "bg-green-50 border-green-400",
                        notification.type === "warning" &&
                          "bg-orange-50 border-orange-400",
                        notification.type === "error" &&
                          "bg-red-50 border-red-400",
                        notification.type === "info" &&
                          "bg-blue-50 border-blue-400",
                      )}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notification.date).toLocaleDateString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>No recent activity</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-purple-600" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {companyData.status === "Approved" ? (
                    <>
                      <Button
                        onClick={() => setActiveTab("tenders")}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Browse Latest Tenders
                      </Button>
                      <Button
                        onClick={() => setActiveTab("contracts")}
                        variant="outline"
                        className="w-full hover:bg-purple-50 border-purple-200 text-purple-700"
                      >
                        <Award className="h-4 w-4 mr-2" />
                        View My Contracts
                      </Button>
                      <Button
                        onClick={() => setActiveTab("profile")}
                        variant="outline"
                        className="w-full hover:bg-emerald-50 border-emerald-200 text-emerald-700"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Update Profile
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => setActiveTab("profile")}
                        className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Complete Verification
                      </Button>
                      <Button
                        onClick={() => setActiveTab("support")}
                        variant="outline"
                        className="w-full hover:bg-blue-50 border-blue-200 text-blue-700"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact Support
                      </Button>
                      {companyData.status === "Blacklisted" && (
                        <Button
                          onClick={() => setActiveSection("grievance")}
                          variant="outline"
                          className="w-full hover:bg-red-50 border-red-200 text-red-700"
                        >
                          <Gavel className="h-4 w-4 mr-2" />
                          Submit Appeal
                        </Button>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recommended Tenders */}
            {companyData.status === "Approved" && (
              <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    <span>Recommended for You</span>
                  </CardTitle>
                  <CardDescription>
                    Based on your profile and past activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recommendedTenders.map((tender) => (
                      <div
                        key={tender.id}
                        className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100 hover:bg-purple-100 transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {tender.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {tender.ministry}
                          </p>
                          <p className="text-xs text-purple-600 mt-1">
                            Deadline: {tender.deadline}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setActiveTab("tenders")}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          View Details
                          <ArrowUpRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tenders Tab */}
          <TabsContent value="tenders" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-emerald-600" />
                      <span>Available Tenders</span>
                    </CardTitle>
                    <CardDescription>
                      Browse and express interest in government tenders
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search tenders..."
                        className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tenders
                    .filter(
                      (tender) =>
                        tender.title
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        tender.ministry
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()),
                    )
                    .map((tender) => (
                      <div
                        key={tender.id}
                        className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-200 bg-white"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {tender.title}
                              </h3>
                              <Badge
                                variant={
                                  tender.status === "Open"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {tender.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                              <div className="flex items-center space-x-1">
                                <Building2 className="h-4 w-4" />
                                <span>{tender.ministry}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <DollarSign className="h-4 w-4" />
                                <span>{tender.value}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{tender.deadline}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{tender.location}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 text-xs">
                              {tender.hasExpressedInterest && (
                                <span className="flex items-center space-x-1 text-green-600">
                                  <CheckCircle className="h-3 w-3" />
                                  <span>Interest Expressed</span>
                                </span>
                              )}
                              {tender.hasBid && (
                                <span className="flex items-center space-x-1 text-blue-600">
                                  <FileCheck className="h-3 w-3" />
                                  <span>Bid Submitted</span>
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2 ml-4">
                            {!tender.hasExpressedInterest ? (
                              <Button
                                size="sm"
                                onClick={() => handleExpressInterest(tender)}
                                disabled={companyData.status !== "Approved"}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                <Star className="h-3 w-3 mr-1" />
                                Express Interest
                              </Button>
                            ) : !tender.hasBid ? (
                              <Button
                                size="sm"
                                onClick={() => handleSubmitBid(tender)}
                                disabled={companyData.status !== "Approved"}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Upload className="h-3 w-3 mr-1" />
                                Submit Bid
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" disabled>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                              </Button>
                            )}
                            <Button size="sm" variant="ghost">
                              <Eye className="h-3 w-3 mr-1" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bids Tab */}
          <TabsContent value="bids" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  <span>My Bid Submissions</span>
                </CardTitle>
                <CardDescription>
                  Track the status of your submitted bids
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tenders
                    .filter((tender) => tender.hasBid)
                    .map((tender) => (
                      <div
                        key={tender.id}
                        className="p-6 border border-gray-200 rounded-xl bg-white hover:shadow-lg transition-all duration-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {tender.title}
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                              <div className="flex items-center space-x-1">
                                <Building2 className="h-4 w-4" />
                                <span>{tender.ministry}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <DollarSign className="h-4 w-4" />
                                <span>{tender.value}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{tender.deadline}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <Badge variant="secondary">Bid Submitted</Badge>
                              <span className="text-xs text-gray-500">
                                Status: Under Evaluation
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3 mr-1" />
                              View Bid
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  {tenders.filter((tender) => tender.hasBid).length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Target className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <h3 className="text-lg font-medium mb-2">
                        No Bids Submitted Yet
                      </h3>
                      <p className="mb-6">
                        Start by expressing interest in tenders and then submit
                        your bids.
                      </p>
                      <Button
                        onClick={() => setActiveTab("tenders")}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        Browse Tenders
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contracts Tab */}
          <TabsContent value="contracts" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-amber-600" />
                  <span>Awarded Contracts</span>
                </CardTitle>
                <CardDescription>
                  Monitor your active and completed contracts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {contracts.map((contract) => (
                    <div
                      key={contract.id}
                      className="p-6 border border-gray-200 rounded-xl bg-white hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {contract.projectTitle}
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center space-x-1">
                              <Building2 className="h-4 w-4" />
                              <span>{contract.awardingMinistry}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4" />
                              <span>{contract.contractValue}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Awarded: {contract.awardDate}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 mb-4">
                            <Badge
                              variant={
                                contract.status === "Active"
                                  ? "default"
                                  : contract.status === "Completed"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {contract.status}
                            </Badge>
                            {contract.progress !== undefined && (
                              <div className="flex items-center space-x-2 flex-1 max-w-xs">
                                <span className="text-xs text-gray-500">
                                  Progress:
                                </span>
                                <Progress
                                  value={contract.progress}
                                  className="flex-1"
                                />
                                <span className="text-xs text-gray-600">
                                  {contract.progress}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2 ml-4">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            View Contract
                          </Button>
                          {contract.status === "Active" && (
                            <Button size="sm" variant="ghost">
                              <Edit className="h-3 w-3 mr-1" />
                              Update Progress
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {contracts.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Award className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <h3 className="text-lg font-medium mb-2">
                        No Contracts Awarded
                      </h3>
                      <p className="mb-6">
                        Keep bidding on tenders to win your first contract.
                      </p>
                      <Button
                        onClick={() => setActiveTab("tenders")}
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        Browse Tenders
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-rose-600" />
                  <span>Company Profile</span>
                </CardTitle>
                <CardDescription>
                  Manage your company information and documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={companyData.name}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        disabled={companyData.status === "Blacklisted"}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={companyData.email}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        disabled
                      />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Document Status
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { name: "CAC Certificate", status: "verified" },
                        { name: "Tax Clearance", status: "verified" },
                        { name: "Experience Certificate", status: "pending" },
                        { name: "Financial Statement", status: "missing" },
                      ].map((doc) => (
                        <div
                          key={doc.name}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                        >
                          <span className="font-medium text-gray-900">
                            {doc.name}
                          </span>
                          <Badge
                            variant={
                              doc.status === "verified"
                                ? "default"
                                : doc.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {doc.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      className="bg-rose-600 hover:bg-rose-700 text-white"
                      disabled={companyData.status === "Blacklisted"}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Documents
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-indigo-600" />
                  <span>Support & Help</span>
                </CardTitle>
                <CardDescription>
                  Get assistance and access help resources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 border border-indigo-200 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer">
                      <div className="text-center">
                        <MessageSquare className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Live Chat
                        </h3>
                        <p className="text-sm text-gray-600">
                          Get instant help from our support team
                        </p>
                      </div>
                    </div>
                    <div className="p-6 border border-emerald-200 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer">
                      <div className="text-center">
                        <Mail className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Email Support
                        </h3>
                        <p className="text-sm text-gray-600">
                          Send us a detailed message
                        </p>
                      </div>
                    </div>
                    <div className="p-6 border border-amber-200 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer">
                      <div className="text-center">
                        <Phone className="h-8 w-8 text-amber-600 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Phone Support
                        </h3>
                        <p className="text-sm text-gray-600">
                          Call us during business hours
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Frequently Asked Questions
                    </h4>
                    <div className="space-y-3">
                      {[
                        "How do I express interest in a tender?",
                        "What documents do I need to upload?",
                        "How can I track my bid status?",
                        "What are the evaluation criteria?",
                      ].map((faq, index) => (
                        <div
                          key={index}
                          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">
                              {faq}
                            </span>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {showExpressInterestModal && selectedTender && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Express Interest
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to express interest in "
              {selectedTender.title}"?
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={confirmExpressInterest}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Yes, Express Interest
              </Button>
              <Button
                onClick={() => {
                  setShowExpressInterestModal(false);
                  setSelectedTender(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {showSubmitBidModal && selectedTender && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Submit Bid</h3>
            <p className="text-gray-600 mb-6">
              Are you ready to submit your bid for "{selectedTender.title}"?
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={confirmSubmitBid}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Yes, Submit Bid
              </Button>
              <Button
                onClick={() => {
                  setShowSubmitBidModal(false);
                  setSelectedTender(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
