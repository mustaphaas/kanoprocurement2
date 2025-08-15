import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { persistentStorage } from "@/lib/persistentStorage";
import {
  Building2,
  Users,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Filter,
  FileText,
  LogOut,
  Bell,
  Search,
  Calendar,
  Mail,
  Phone,
  AlertTriangle,
  CheckSquare,
  X,
  Ban,
  Clock,
  UserCheck,
  Shield,
  Settings,
} from "lucide-react";

interface Company {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  registrationDate: string;
  status: "Pending" | "Approved" | "Suspended" | "Blacklisted";
  registrationNumber: string;
  businessType: string;
  address: string;
  documents: {
    incorporation: boolean;
    taxClearance: boolean;
    companyProfile: boolean;
    cacForm: boolean;
  };
  verificationStatus: {
    cac: "Pending" | "Verified" | "Failed";
    firs: "Pending" | "Verified" | "Failed";
  };
}

export default function AdminDashboard() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "details" | "approval">(
    "list",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [approvalDecision, setApprovalDecision] = useState<
    "Approved" | "Suspended" | "Blacklisted" | ""
  >("");
  const [actionReason, setActionReason] = useState("");
  const [sendNotification, setSendNotification] = useState(true);
  const [activeTab, setActiveTab] = useState<"companies" | "user-management">(
    "companies",
  );
  const navigate = useNavigate();

  const handleStatusChange = (
    companyId: string,
    newStatus: "Approved" | "Suspended" | "Blacklisted",
    reason: string,
  ) => {
    console.log("🚀 handleStatusChange CALLED");
    console.log("📥 Parameters:", { companyId, newStatus, reason });
    console.log("📋 Current companies array length:", companies.length);

    // Update the company status in the local state
    setCompanies((prev) =>
      prev.map((company) =>
        company.id === companyId ? { ...company, status: newStatus } : company,
      ),
    );

    // Store the status change using persistent storage for the company dashboard to pick up
    // We'll use the email as the key since that's what the dashboard checks
    const company = companies.find((c) => c.id === companyId);
    if (company) {
      const storageKey = `userStatus_${company.email.toLowerCase()}`;
      const reasonKey = `userStatusReason_${company.email.toLowerCase()}`;

      // Use persistent storage instead of localStorage
      persistentStorage.setItem(storageKey, newStatus);
      persistentStorage.setItem(reasonKey, reason);

      console.log(`=== ADMIN STATUS CHANGE ===`);
      console.log(`Company: ${company.companyName}`);
      console.log(`Original email: ${company.email}`);
      console.log(`Normalized email: ${company.email.toLowerCase()}`);
      console.log(`Storage key: ${storageKey}`);
      console.log(`New status: ${newStatus}`);
      console.log(`Value stored: ${persistentStorage.getItem(storageKey)}`);
      console.log(
        `All userStatus keys:`,
        persistentStorage.getUserStatusKeys(),
      );

      // Debug the persistent storage
      persistentStorage.debugInfo();
    } else {
      console.error(`❌ Company with ID ${companyId} not found!`);
    }

    // Reset form
    setActionReason("");
    setApprovalDecision("");
    setSelectedCompany(null);
    setViewMode("list");
  };

  // Load companies from registrations and mock data
  useEffect(() => {
    const loadCompanies = () => {
      // Load registered companies from localStorage (where CompanyRegistration saves them)
      const registeredCompanies = JSON.parse(
        localStorage.getItem("registeredCompanies") || "[]",
      );

      // Convert registered companies to admin dashboard format
      const formattedRegisteredCompanies = registeredCompanies.map(
        (reg: any, index: number) => ({
          id: reg.id || `reg-${index}`,
          companyName: reg.companyName || "Unknown Company",
          contactPerson: reg.contactPerson || "Unknown Contact",
          email: reg.email || "",
          phone: reg.phone || "",
          registrationDate:
            reg.registrationDate || new Date().toISOString().split("T")[0],
          status:
            (localStorage.getItem(`userStatus_${reg.email?.toLowerCase()}`) as
              | "Pending"
              | "Approved"
              | "Suspended"
              | "Blacklisted") || "Pending",
          registrationNumber: reg.registrationNumber || `RC${Date.now()}`,
          businessType: reg.businessType || "Limited Liability Company",
          address: reg.address || "",
          documents: {
            incorporation: true,
            taxClearance: true,
            companyProfile: true,
            cacForm: true,
          },
          verificationStatus: {
            cac: "Pending" as const,
            firs: "Pending" as const,
          },
        }),
      );

      // Default test companies for demonstration
      const mockCompanies: Company[] = [
        {
          id: "test-1",
          companyName: "Northern Construction Ltd",
          contactPerson: "Ahmad Mahmoud",
          email: "ahmad@northernconstruction.com",
          phone: "+234 803 123 4567",
          registrationDate: "2024-01-15",
          status: "Pending",
          registrationNumber: "RC123456",
          businessType: "Limited Liability Company",
          address: "123 Ahmadu Bello Way, Kano",
          documents: {
            incorporation: true,
            taxClearance: true,
            companyProfile: true,
            cacForm: true,
          },
          verificationStatus: {
            cac: "Verified",
            firs: "Pending",
          },
        },
        {
          id: "test-2",
          companyName: "Premier Construction Company",
          contactPerson: "Muhammad Ali",
          email: "approved@company.com",
          phone: "+234 805 987 6543",
          registrationDate: "2024-01-13",
          status:
            (localStorage.getItem(
              `userStatus_${"approved@company.com".toLowerCase()}`,
            ) as "Pending" | "Approved" | "Suspended" | "Blacklisted") ||
            "Approved",
          registrationNumber: "RC345678",
          businessType: "Limited Liability Company",
          address: "78 Independence Road, Kano",
          documents: {
            incorporation: true,
            taxClearance: true,
            companyProfile: true,
            cacForm: true,
          },
          verificationStatus: {
            cac: "Verified",
            firs: "Verified",
          },
        },
        {
          id: "test-3",
          companyName: "Omega Engineering Services",
          contactPerson: "Sani Abdullahi",
          email: "suspended@company.com",
          phone: "+234 809 111 2222",
          registrationDate: "2024-01-10",
          status:
            (localStorage.getItem(
              `userStatus_${"suspended@company.com".toLowerCase()}`,
            ) as "Pending" | "Approved" | "Suspended" | "Blacklisted") ||
            "Suspended",
          registrationNumber: "RC456789",
          businessType: "Limited Liability Company",
          address: "12 Engineering Close, Kano",
          documents: {
            incorporation: true,
            taxClearance: false,
            companyProfile: true,
            cacForm: true,
          },
          verificationStatus: {
            cac: "Verified",
            firs: "Failed",
          },
        },
        {
          id: "test-4",
          companyName: "Restricted Corp Ltd",
          contactPerson: "Ahmed Musa",
          email: "blacklisted@company.com",
          phone: "+234 806 333 4444",
          registrationDate: "2024-01-05",
          status:
            (localStorage.getItem(
              `userStatus_${"blacklisted@company.com".toLowerCase()}`,
            ) as "Pending" | "Approved" | "Suspended" | "Blacklisted") ||
            "Blacklisted",
          registrationNumber: "RC567890",
          businessType: "Limited Liability Company",
          address: "56 Industrial Layout, Kano",
          documents: {
            incorporation: true,
            taxClearance: true,
            companyProfile: true,
            cacForm: true,
          },
          verificationStatus: {
            cac: "Verified",
            firs: "Verified",
          },
        },
        {
          id: "test-5",
          companyName: "New Ventures Construction Ltd",
          contactPerson: "Amina Suleiman",
          email: "pending@company.com",
          phone: "+234 807 444 5555",
          registrationDate: "2024-01-20",
          status:
            (localStorage.getItem(
              `userStatus_${"pending@company.com".toLowerCase()}`,
            ) as "Pending" | "Approved" | "Suspended" | "Blacklisted") ||
            "Pending",
          registrationNumber: "RC678901",
          businessType: "Limited Liability Company",
          address: "90 New GRA, Kano",
          documents: {
            incorporation: true,
            taxClearance: false,
            companyProfile: true,
            cacForm: true,
          },
          verificationStatus: {
            cac: "Pending",
            firs: "Pending",
          },
        },
      ];

      // Combine registered companies with test companies (avoid duplicates by email)
      const allCompanies = [...formattedRegisteredCompanies];

      // Add test companies if they don't already exist
      mockCompanies.forEach((testCompany) => {
        const existsInRegistered = formattedRegisteredCompanies.find(
          (reg) => reg.email.toLowerCase() === testCompany.email.toLowerCase(),
        );
        if (!existsInRegistered) {
          allCompanies.push(testCompany);
        }
      });

      setCompanies(allCompanies);
    };

    loadCompanies();

    // Refresh company list every 30 seconds to pick up new registrations
    const interval = setInterval(loadCompanies, 30000);

    // Add global admin debugging functions
    (window as any).adminTestLocalStorage = () => {
      console.log("=== ADMIN LOCALSTORAGE TEST ===");

      // Test basic localStorage
      try {
        localStorage.setItem("admin_test", "admin_works");
        const adminTest = localStorage.getItem("admin_test");
        console.log(
          "✅ Admin localStorage test:",
          adminTest === "admin_works" ? "WORKS" : "FAILED",
        );
        localStorage.removeItem("admin_test");
      } catch (e) {
        console.log("❌ Admin localStorage test FAILED:", e);
      }

      // Test manual userStatus save with persistent storage
      try {
        const testKey = "userStatus_admin_test@company.com";
        persistentStorage.setItem(testKey, "Approved");
        const testResult = persistentStorage.getItem(testKey);
        console.log(
          "✅ Manual userStatus save test:",
          testResult === "Approved" ? "WORKS" : "FAILED",
        );
        console.log(
          "📋 All userStatus keys after test:",
          persistentStorage.getUserStatusKeys(),
        );
        persistentStorage.removeItem(testKey);
      } catch (e) {
        console.log("❌ Manual userStatus save test FAILED:", e);
      }

      console.log("=== ADMIN TEST COMPLETED ===");
    };

    (window as any).adminTestStatusChange = () => {
      console.log("=== TESTING HANDLESTATUSCHANGE FUNCTION ===");
      const testCompany = companies.find(
        (c) => c.email === "approved@company.com",
      );
      if (testCompany) {
        console.log("🧪 Found test company:", testCompany);
        handleStatusChange(testCompany.id, "Blacklisted", "Manual admin test");
      } else {
        console.log("❌ No test company found with email approved@company.com");
        console.log(
          "📋 Available companies:",
          companies.map((c) => ({
            id: c.id,
            email: c.email,
            name: c.companyName,
          })),
        );
      }
    };

    // Listen for storage changes from SuperUser dashboard
    const handleStorageChange = (event: any) => {
      const { key, newValue } = event.detail;
      if (key && key.startsWith('userStatus_')) {
        console.log('🔄 Storage change detected in AdminDashboard:', key, newValue);
        loadCompanies(); // Reload companies when status changes
      }
    };

    window.addEventListener('persistentStorageChange', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('persistentStorageChange', handleStorageChange);
    };
  }, []);

  // Add global admin debugging functions (outside useEffect to avoid dependency issues)
  useEffect(() => {
    (window as any).adminTestLocalStorage = () => {
      console.log("=== ADMIN LOCALSTORAGE TEST ===");

      // Test basic localStorage
      try {
        localStorage.setItem("admin_test", "admin_works");
        const adminTest = localStorage.getItem("admin_test");
        console.log(
          "✅ Admin localStorage test:",
          adminTest === "admin_works" ? "WORKS" : "FAILED",
        );
        localStorage.removeItem("admin_test");
      } catch (e) {
        console.log("❌ Admin localStorage test FAILED:", e);
      }

      // Test manual userStatus save with persistent storage
      try {
        const testKey = "userStatus_admin_test@company.com";
        persistentStorage.setItem(testKey, "Approved");
        const testResult = persistentStorage.getItem(testKey);
        console.log(
          "✅ Manual userStatus save test:",
          testResult === "Approved" ? "WORKS" : "FAILED",
        );
        console.log(
          "📋 All userStatus keys after test:",
          persistentStorage.getUserStatusKeys(),
        );
        persistentStorage.removeItem(testKey);
      } catch (e) {
        console.log("❌ Manual userStatus save test FAILED:", e);
      }

      console.log("=== ADMIN TEST COMPLETED ===");
    };

    (window as any).adminTestStatusChange = () => {
      console.log("=== TESTING HANDLESTATUSCHANGE FUNCTION ===");
      const testCompany = companies.find(
        (c) => c.email === "approved@company.com",
      );
      if (testCompany) {
        console.log("🧪 Found test company:", testCompany);
        handleStatusChange(testCompany.id, "Blacklisted", "Manual admin test");
      } else {
        console.log("❌ No test company found with email approved@company.com");
        console.log(
          "📋 Available companies:",
          companies.map((c) => ({
            id: c.id,
            email: c.email,
            name: c.companyName,
          })),
        );
      }
    };

    return () => {
      delete (window as any).adminTestLocalStorage;
      delete (window as any).adminTestStatusChange;
    };
  }, [companies, handleStatusChange]);

  const pendingCount = companies.filter((c) => c.status === "Pending").length;
  const approvedCount = companies.filter((c) => c.status === "Approved").length;
  const suspendedCount = companies.filter(
    (c) => c.status === "Suspended",
  ).length;
  const blacklistedCount = companies.filter(
    (c) => c.status === "Blacklisted",
  ).length;

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || company.status === statusFilter;

    // For Company Approval tab, show all companies for easier testing
    // TODO: Change back to only pending after debugging
    if (activeTab === "companies") {
      return matchesSearch && matchesStatus; // Show all companies temporarily
    }

    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (company: Company) => {
    setSelectedCompany(company);
    setViewMode("details");
  };

  const handleApproval = (company: Company) => {
    setSelectedCompany(company);
    setViewMode("approval");
    setApprovalDecision("");
    setActionReason("");
    setSendNotification(true);
  };

  const submitApproval = () => {
    if (!selectedCompany || !approvalDecision) return;

    if (
      (approvalDecision === "Suspended" ||
        approvalDecision === "Blacklisted") &&
      !actionReason.trim()
    ) {
      alert(`Please provide a reason for ${approvalDecision.toLowerCase()}`);
      return;
    }

    handleStatusChange(selectedCompany.id, approvalDecision, actionReason);

    // Simulate sending notification
    if (sendNotification) {
      console.log(`Notification sent to ${selectedCompany.email}`);
    }
  };

  const handleLogout = () => {
    navigate("/");
  };

  const exportData = () => {
    const dataStr = JSON.stringify(filteredCompanies, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "company_registrations.json";
    link.click();
  };

  if (viewMode === "details" && selectedCompany) {
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
                  <h1 className="text-xl font-bold text-green-700">
                    KanoProc Admin
                  </h1>
                  <p className="text-xs text-gray-600">Company Details</p>
                </div>
              </div>
              <button
                onClick={() => setViewMode("list")}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-green-700"
              >
                <X className="h-4 w-4 mr-2" />
                Close
              </button>
            </div>
          </div>
        </header>

        {/* Company Details */}
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {selectedCompany.companyName}
                  </h1>
                  <p className="text-gray-600">Registration Details</p>
                </div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedCompany.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : selectedCompany.status === "Approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedCompany.status}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Company Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Company Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <p className="text-gray-900">
                      {selectedCompany.companyName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Number
                    </label>
                    <p className="text-gray-900">
                      {selectedCompany.registrationNumber}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Type
                    </label>
                    <p className="text-gray-900">
                      {selectedCompany.businessType}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Date
                    </label>
                    <p className="text-gray-900">
                      {new Date(
                        selectedCompany.registrationDate,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <p className="text-gray-900">{selectedCompany.address}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person
                    </label>
                    <p className="text-gray-900">
                      {selectedCompany.contactPerson}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-gray-900 flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      {selectedCompany.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <p className="text-gray-900 flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      {selectedCompany.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Status */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Document Status
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries({
                    incorporation: "Certificate of Incorporation",
                    taxClearance: "Tax Clearance Certificate",
                    companyProfile: "Company Profile",
                    cacForm: "CAC Form",
                  }).map(([key, label]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <span className="text-sm text-gray-700">{label}</span>
                      <div className="flex items-center space-x-2">
                        {selectedCompany.documents[
                          key as keyof typeof selectedCompany.documents
                        ] ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <button className="text-blue-600 hover:underline text-sm">
                              <Download className="h-4 w-4 inline mr-1" />
                              Download
                            </button>
                          </>
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verification Status */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Real-time Verification Status
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <span className="text-sm text-gray-700">
                      CAC Verification
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        selectedCompany.verificationStatus.cac === "Verified"
                          ? "bg-green-100 text-green-800"
                          : selectedCompany.verificationStatus.cac === "Failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {selectedCompany.verificationStatus.cac}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <span className="text-sm text-gray-700">
                      FIRS/State IRS Verification
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        selectedCompany.verificationStatus.firs === "Verified"
                          ? "bg-green-100 text-green-800"
                          : selectedCompany.verificationStatus.firs === "Failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {selectedCompany.verificationStatus.firs}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setViewMode("list")}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Back to List
                </button>
                {selectedCompany.status === "Pending" && (
                  <button
                    onClick={() => handleApproval(selectedCompany)}
                    className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
                  >
                    Process Approval
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (viewMode === "approval" && selectedCompany) {
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
                  <h1 className="text-xl font-bold text-green-700">
                    KanoProc Admin
                  </h1>
                  <p className="text-xs text-gray-600">Approval Process</p>
                </div>
              </div>
              <button
                onClick={() => setViewMode("details")}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-green-700"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
            </div>
          </div>
        </header>

        {/* Approval Form */}
        <main className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">
                Approval Decision
              </h1>
              <p className="text-gray-600">{selectedCompany.companyName}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Current Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">
                  Current Status
                </h3>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    selectedCompany.status === "Approved"
                      ? "bg-green-100 text-green-800"
                      : selectedCompany.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : selectedCompany.status === "Suspended"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedCompany.status}
                </span>
              </div>

              {/* New Status Decision */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Change Status To *
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="decision"
                      value="Approved"
                      checked={approvalDecision === "Approved"}
                      onChange={(e) =>
                        setApprovalDecision(
                          e.target.value as
                            | "Approved"
                            | "Suspended"
                            | "Blacklisted",
                        )
                      }
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700 flex items-center">
                      <UserCheck className="h-4 w-4 text-green-500 mr-1" />
                      Approved - Full Access
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="decision"
                      value="Suspended"
                      checked={approvalDecision === "Suspended"}
                      onChange={(e) =>
                        setApprovalDecision(
                          e.target.value as
                            | "Approved"
                            | "Suspended"
                            | "Blacklisted",
                        )
                      }
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700 flex items-center">
                      <Shield className="h-4 w-4 text-orange-500 mr-1" />
                      Suspended - Limited Access
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="decision"
                      value="Blacklisted"
                      checked={approvalDecision === "Blacklisted"}
                      onChange={(e) =>
                        setApprovalDecision(
                          e.target.value as
                            | "Approved"
                            | "Suspended"
                            | "Blacklisted",
                        )
                      }
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700 flex items-center">
                      <Ban className="h-4 w-4 text-red-500 mr-1" />
                      Blacklisted - No Access
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Reason */}
              {(approvalDecision === "Suspended" ||
                approvalDecision === "Blacklisted") && (
                <div>
                  <label
                    htmlFor="actionReason"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Reason for{" "}
                    {approvalDecision === "Suspended"
                      ? "Suspension"
                      : "Blacklisting"}{" "}
                    *
                  </label>
                  <textarea
                    id="actionReason"
                    rows={4}
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 ${
                      approvalDecision === "Suspended"
                        ? "focus:ring-orange-500"
                        : "focus:ring-red-500"
                    }`}
                    placeholder={`Please provide a detailed reason for ${approvalDecision === "Suspended" ? "suspension" : "blacklisting"}...`}
                  />
                </div>
              )}

              {/* Notification Option */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={sendNotification}
                    onChange={(e) => setSendNotification(e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Send automated email notification to the company
                  </span>
                </label>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Preview
                </h3>
                <div className="text-sm text-gray-700">
                  <p>
                    <strong>Company:</strong> {selectedCompany.companyName}
                  </p>
                  <p>
                    <strong>Contact:</strong> {selectedCompany.contactPerson} (
                    {selectedCompany.email})
                  </p>
                  <p>
                    <strong>Decision:</strong>{" "}
                    {approvalDecision || "Not selected"}
                  </p>
                  {(approvalDecision === "Suspended" ||
                    approvalDecision === "Blacklisted") &&
                    actionReason && (
                      <p>
                        <strong>Reason:</strong> {actionReason}
                      </p>
                    )}
                  <p>
                    <strong>Notification:</strong>{" "}
                    {sendNotification ? "Will be sent" : "Will not be sent"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setViewMode("details")}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitApproval}
                  disabled={
                    !approvalDecision ||
                    ((approvalDecision === "Suspended" ||
                      approvalDecision === "Blacklisted") &&
                      !actionReason.trim())
                  }
                  className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
                <h1 className="text-xl font-bold text-green-700">
                  KanoProc Admin
                </h1>
                <p className="text-xs text-gray-600">
                  Registration Validator Dashboard
                </p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => setActiveTab("companies")}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === "companies"
                    ? "text-green-700 bg-green-50"
                    : "text-gray-700 hover:text-green-700"
                }`}
              >
                <CheckSquare className="h-4 w-4" />
                <span>Company Approval</span>
                {pendingCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-yellow-500 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("user-management")}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === "user-management"
                    ? "text-green-700 bg-green-50"
                    : "text-gray-700 hover:text-green-700"
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Company Status</span>
                {suspendedCount + blacklistedCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {suspendedCount + blacklistedCount}
                  </span>
                )}
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
            Welcome, Admin (Registration Validator)!
          </h1>
          <p className="text-gray-600">
            Review and approve company registrations for the procurement portal.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Review
                </p>
                <p className="text-3xl font-bold text-yellow-600">
                  {pendingCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Companies
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {approvedCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suspended</p>
                <p className="text-3xl font-bold text-orange-600">
                  {suspendedCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Blacklisted</p>
                <p className="text-3xl font-bold text-red-600">
                  {blacklistedCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Ban className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Company Approvals Section */}
        {activeTab === "companies" && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Company Approval Queue (Pending Only)
                </h2>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={exportData}
                    className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </button>
                  <button className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                    Print
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="mt-4 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search companies, contacts, or emails..."
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
                    <option value="all">All Pending</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Company List */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Person
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration Date
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
                  {filteredCompanies.map((company) => (
                    <tr key={company.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {company.companyName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {company.registrationNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">
                            {company.contactPerson}
                          </div>
                          <div className="text-sm text-gray-500">
                            {company.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(
                          company.registrationDate,
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            company.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : company.status === "Approved"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {company.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleViewDetails(company)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4 inline mr-1" />
                          View Details
                        </button>

                        {company.status === "Pending" && (
                          <>
                            <button
                              onClick={() => {
                                console.log("🔄 ADMIN APPROVE BUTTON CLICKED");
                                console.log("Company ID:", company.id);
                                console.log("Company Email:", company.email);
                                console.log("Company Name:", company.companyName);

                                handleStatusChange(
                                  company.id,
                                  "Approved",
                                  "Approved by admin",
                                );

                                // Show success message
                                alert(`✅ ${company.companyName} has been approved successfully!`);
                              }}
                              className="text-green-600 hover:text-green-900 ml-3"
                            >
                              <CheckCircle className="h-4 w-4 inline mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleApproval(company)}
                              className="text-red-600 hover:text-red-900 ml-3"
                            >
                              <XCircle className="h-4 w-4 inline mr-1" />
                              Reject
                            </button>
                          </>
                        )}

                        {/* Add Manage Status for all companies */}
                        <button
                          onClick={() => handleApproval(company)}
                          className="text-gray-600 hover:text-gray-900 ml-3"
                        >
                          <Settings className="h-4 w-4 inline mr-1" />
                          Manage Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredCompanies.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No companies found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "No company registrations available."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* User Management Section */}
        {activeTab === "user-management" && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Company Status Issues
              </h2>
              <p className="text-gray-600 mt-1">
                Manage suspended and blacklisted companies
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {companies
                  .filter(
                    (company) =>
                      company.status === "Suspended" ||
                      company.status === "Blacklisted",
                  )
                  .map((company) => (
                    <div
                      key={company.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-medium text-gray-900">
                              {company.companyName}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                company.status === "Approved"
                                  ? "bg-green-100 text-green-800"
                                  : company.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : company.status === "Suspended"
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-red-100 text-red-800"
                              }`}
                            >
                              {company.status === "Approved" && (
                                <UserCheck className="h-3 w-3 mr-1" />
                              )}
                              {company.status === "Pending" && (
                                <Clock className="h-3 w-3 mr-1" />
                              )}
                              {company.status === "Suspended" && (
                                <Shield className="h-3 w-3 mr-1" />
                              )}
                              {company.status === "Blacklisted" && (
                                <Ban className="h-3 w-3 mr-1" />
                              )}
                              {company.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {company.email}
                          </p>
                          <p className="text-sm text-gray-500">
                            {company.contactPerson} • {company.phone}
                          </p>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproval(company)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Manage Status
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                {companies.filter(
                  (company) =>
                    company.status === "Suspended" ||
                    company.status === "Blacklisted",
                ).length === 0 && (
                  <div className="text-center py-12">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No Status Issues
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      All companies are currently in good standing.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
