import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Settings
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
  const [viewMode, setViewMode] = useState<"list" | "details" | "approval">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [approvalDecision, setApprovalDecision] = useState<"Approved" | "Suspended" | "Blacklisted" | "">("");
  const [actionReason, setActionReason] = useState("");
  const [sendNotification, setSendNotification] = useState(true);
  const [activeTab, setActiveTab] = useState<"companies" | "user-management">("companies");
  const navigate = useNavigate();

  // Mock data
  useEffect(() => {
    const mockCompanies: Company[] = [
      {
        id: "1",
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
          cacForm: true
        },
        verificationStatus: {
          cac: "Verified",
          firs: "Pending"
        }
      },
      {
        id: "2",
        companyName: "Sahel Medical Supplies",
        contactPerson: "Fatima Yusuf",
        email: "fatima@sahelmedical.com",
        phone: "+234 805 987 6543",
        registrationDate: "2024-01-14",
        status: "Pending",
        registrationNumber: "RC234567",
        businessType: "Limited Liability Company",
        address: "45 Hospital Road, Kano",
        documents: {
          incorporation: true,
          taxClearance: false,
          companyProfile: true,
          cacForm: true
        },
        verificationStatus: {
          cac: "Verified",
          firs: "Failed"
        }
      },
      {
        id: "3",
        companyName: "TechSolutions Nigeria",
        contactPerson: "Ibrahim Hassan",
        email: "ibrahim@techsolutions.ng",
        phone: "+234 807 555 1234",
        registrationDate: "2024-01-13",
        status: "Approved",
        registrationNumber: "RC345678",
        businessType: "Limited Liability Company",
        address: "78 Independence Road, Kano",
        documents: {
          incorporation: true,
          taxClearance: true,
          companyProfile: true,
          cacForm: true
        },
        verificationStatus: {
          cac: "Verified",
          firs: "Verified"
        }
      }
    ];
    setCompanies(mockCompanies);
  }, []);

  const pendingCount = companies.filter(c => c.status === "Pending").length;
  const approvedCount = companies.filter(c => c.status === "Approved").length;
  const rejectedCount = companies.filter(c => c.status === "Rejected").length;

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || company.status === statusFilter;
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
    setRejectionReason("");
    setSendNotification(true);
  };

  const submitApproval = () => {
    if (!selectedCompany || !approvalDecision) return;

    if (approvalDecision === "Rejected" && !rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    // Update company status
    setCompanies(prev => prev.map(company => 
      company.id === selectedCompany.id 
        ? { ...company, status: approvalDecision }
        : company
    ));

    // Simulate sending notification
    if (sendNotification) {
      console.log(`Notification sent to ${selectedCompany.email}`);
    }

    alert(`Company ${approvalDecision.toLowerCase()} successfully!`);
    setViewMode("list");
    setSelectedCompany(null);
  };

  const handleLogout = () => {
    navigate("/");
  };

  const exportData = () => {
    const dataStr = JSON.stringify(filteredCompanies, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'company_registrations.json';
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
                  <h1 className="text-xl font-bold text-green-700">KanoProc Admin</h1>
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
                  <h1 className="text-2xl font-bold text-gray-900">{selectedCompany.companyName}</h1>
                  <p className="text-gray-600">Registration Details</p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  selectedCompany.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                  selectedCompany.status === "Approved" ? "bg-green-100 text-green-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {selectedCompany.status}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Company Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <p className="text-gray-900">{selectedCompany.companyName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                    <p className="text-gray-900">{selectedCompany.registrationNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                    <p className="text-gray-900">{selectedCompany.businessType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date</label>
                    <p className="text-gray-900">{new Date(selectedCompany.registrationDate).toLocaleDateString()}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <p className="text-gray-900">{selectedCompany.address}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                    <p className="text-gray-900">{selectedCompany.contactPerson}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900 flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      {selectedCompany.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <p className="text-gray-900 flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      {selectedCompany.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Status */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries({
                    incorporation: "Certificate of Incorporation",
                    taxClearance: "Tax Clearance Certificate",
                    companyProfile: "Company Profile",
                    cacForm: "CAC Form"
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-md">
                      <span className="text-sm text-gray-700">{label}</span>
                      <div className="flex items-center space-x-2">
                        {selectedCompany.documents[key as keyof typeof selectedCompany.documents] ? (
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
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Real-time Verification Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <span className="text-sm text-gray-700">CAC Verification</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedCompany.verificationStatus.cac === "Verified" ? "bg-green-100 text-green-800" :
                      selectedCompany.verificationStatus.cac === "Failed" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {selectedCompany.verificationStatus.cac}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <span className="text-sm text-gray-700">FIRS/State IRS Verification</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedCompany.verificationStatus.firs === "Verified" ? "bg-green-100 text-green-800" :
                      selectedCompany.verificationStatus.firs === "Failed" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
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
                  <h1 className="text-xl font-bold text-green-700">KanoProc Admin</h1>
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
              <h1 className="text-2xl font-bold text-gray-900">Approval Decision</h1>
              <p className="text-gray-600">{selectedCompany.companyName}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Decision */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Decision *</label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="decision"
                      value="Approved"
                      checked={approvalDecision === "Approved"}
                      onChange={(e) => setApprovalDecision(e.target.value as "Approved" | "Rejected")}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700 flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      Approve Registration
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="decision"
                      value="Rejected"
                      checked={approvalDecision === "Rejected"}
                      onChange={(e) => setApprovalDecision(e.target.value as "Approved" | "Rejected")}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700 flex items-center">
                      <XCircle className="h-4 w-4 text-red-500 mr-1" />
                      Reject Registration
                    </span>
                  </label>
                </div>
              </div>

              {/* Rejection Reason */}
              {approvalDecision === "Rejected" && (
                <div>
                  <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Rejection *
                  </label>
                  <textarea
                    id="rejectionReason"
                    rows={4}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Please provide a detailed reason for rejection..."
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
                <h3 className="text-sm font-medium text-gray-900 mb-2">Preview</h3>
                <div className="text-sm text-gray-700">
                  <p><strong>Company:</strong> {selectedCompany.companyName}</p>
                  <p><strong>Contact:</strong> {selectedCompany.contactPerson} ({selectedCompany.email})</p>
                  <p><strong>Decision:</strong> {approvalDecision || "Not selected"}</p>
                  {approvalDecision === "Rejected" && rejectionReason && (
                    <p><strong>Reason:</strong> {rejectionReason}</p>
                  )}
                  <p><strong>Notification:</strong> {sendNotification ? "Will be sent" : "Will not be sent"}</p>
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
                  disabled={!approvalDecision || (approvalDecision === "Rejected" && !rejectionReason.trim())}
                  className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Decision
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
                <h1 className="text-xl font-bold text-green-700">KanoProc Admin</h1>
                <p className="text-xs text-gray-600">Registration Validator Dashboard</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-green-700 bg-green-50">
                <Users className="h-4 w-4" />
                <span>Dashboard</span>
              </a>
              <a href="#" className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-green-700">
                <CheckSquare className="h-4 w-4" />
                <span>Company Approvals</span>
              </a>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome, Admin (Registration Validator)!</h1>
          <p className="text-gray-600">Review and approve company registrations for the procurement portal.</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Registrations Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Companies Approved</p>
                <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Companies Rejected</p>
                <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Company Approvals Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Company Registrations</h2>
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
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
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
                        <div className="text-sm font-medium text-gray-900">{company.companyName}</div>
                        <div className="text-sm text-gray-500">{company.registrationNumber}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{company.contactPerson}</div>
                        <div className="text-sm text-gray-500">{company.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(company.registrationDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        company.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                        company.status === "Approved" ? "bg-green-100 text-green-800" :
                        "bg-red-100 text-red-800"
                      }`}>
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
                            onClick={() => handleApproval(company)}
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCompanies.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No companies found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria." 
                  : "No company registrations available."}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
