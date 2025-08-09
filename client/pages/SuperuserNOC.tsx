import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  FileText,
  User,
  Calendar,
  DollarSign,
  AlertTriangle,
  Eye,
  LogOut,
  Bell,
  Filter,
  Search,
  Download,
  RefreshCw,
  FileCheck,
  Award,
  Send,
} from "lucide-react";

interface NOCRequest {
  id: string;
  projectTitle: string;
  requestDate: string;
  status: "Pending" | "Approved" | "Rejected";
  projectValue: string;
  contractorName: string;
  expectedDuration: string;
  approvalDate?: string;
  certificateNumber?: string;
  requestingMinistry: string;
  ministryCode: string;
  projectDescription?: string;
  justification?: string;
  urgencyLevel: "Low" | "Medium" | "High" | "Critical";
  category: string;
  procuringEntity: string;
  contactPerson: string;
  contactEmail: string;
  attachments?: string[];
}

export default function SuperuserNOC() {
  const [nocRequests, setNOCRequests] = useState<NOCRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<NOCRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ministryFilter, setMinistryFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<NOCRequest | null>(
    null,
  );
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [approvalComments, setApprovalComments] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null,
  );

  const navigate = useNavigate();

  // Mock data for all NOC requests from all ministries
  useEffect(() => {
    // Load centralized NOC requests from localStorage or API
    const storedNOCs = localStorage.getItem("centralNOCRequests");
    if (storedNOCs) {
      const requests = JSON.parse(storedNOCs);
      setNOCRequests(requests);
      setFilteredRequests(requests);
    } else {
      // Initialize with some mock data
      const mockNOCs: NOCRequest[] = [
        {
          id: "NOC-CENTRAL-001",
          projectTitle: "Hospital Equipment Supply - Phase 1",
          requestDate: "2024-02-15",
          status: "Pending",
          projectValue: "₦850,000,000",
          contractorName: "PrimeCare Medical Ltd",
          expectedDuration: "6 months",
          requestingMinistry: "Ministry of Health",
          ministryCode: "MOH",
          projectDescription:
            "Supply of advanced medical equipment for 5 primary healthcare centers including X-ray machines, ultrasound equipment, and laboratory instruments.",
          justification:
            "Critical equipment needed to improve healthcare delivery in rural areas of Kano State.",
          urgencyLevel: "High",
          category: "Medical Equipment",
          procuringEntity: "Kano State Primary Healthcare Development Agency",
          contactPerson: "Dr. Amina Hassan",
          contactEmail: "amina.hassan@health.kano.gov.ng",
          attachments: [
            "equipment_specifications.pdf",
            "vendor_certificates.pdf",
          ],
        },
        {
          id: "NOC-CENTRAL-002",
          projectTitle: "Kano-Kaduna Highway Rehabilitation",
          requestDate: "2024-02-14",
          status: "Pending",
          projectValue: "₦15,200,000,000",
          contractorName: "Kano Construction Ltd",
          expectedDuration: "18 months",
          requestingMinistry: "Ministry of Works & Infrastructure",
          ministryCode: "MOWI",
          projectDescription:
            "Complete rehabilitation of 85km highway section including road surface, drainage systems, and safety infrastructure.",
          justification:
            "Critical transportation infrastructure to improve interstate commerce and reduce travel time.",
          urgencyLevel: "Critical",
          category: "Road Construction",
          procuringEntity: "Kano State Road Maintenance Agency",
          contactPerson: "Eng. Ibrahim Mohammed",
          contactEmail: "ibrahim.mohammed@works.kano.gov.ng",
          attachments: [
            "highway_survey.pdf",
            "environmental_impact.pdf",
            "contractor_profile.pdf",
          ],
        },
        {
          id: "NOC-CENTRAL-003",
          projectTitle: "Digital Learning Platform Development",
          requestDate: "2024-02-13",
          status: "Pending",
          projectValue: "₦1,800,000,000",
          contractorName: "EduTech Solutions Ltd",
          expectedDuration: "12 months",
          requestingMinistry: "Ministry of Education",
          ministryCode: "MOE",
          projectDescription:
            "Development of comprehensive digital learning platform for secondary schools with interactive content and assessment tools.",
          justification:
            "Essential for digital transformation of education sector and improved learning outcomes.",
          urgencyLevel: "Medium",
          category: "Educational Technology",
          procuringEntity: "Kano State Ministry of Education",
          contactPerson: "Prof. Aisha Garba",
          contactEmail: "aisha.garba@education.kano.gov.ng",
          attachments: [
            "platform_specifications.pdf",
            "curriculum_mapping.pdf",
          ],
        },
        {
          id: "NOC-CENTRAL-004",
          projectTitle: "Bridge Construction Project - Phase 2",
          requestDate: "2024-02-12",
          status: "Approved",
          projectValue: "₦8,500,000,000",
          contractorName: "Sahel Bridge Builders",
          expectedDuration: "12 months",
          approvalDate: "2024-02-16",
          certificateNumber: "KNS/SNOC/2024/001",
          requestingMinistry: "Ministry of Works & Infrastructure",
          ministryCode: "MOWI",
          projectDescription:
            "Construction of 5 new bridges across major rivers in Kano State.",
          justification:
            "Essential infrastructure to improve connectivity and economic development.",
          urgencyLevel: "High",
          category: "Bridge Construction",
          procuringEntity: "Kano State Ministry of Works",
          contactPerson: "Eng. Ibrahim Mohammed",
          contactEmail: "ibrahim.mohammed@works.kano.gov.ng",
        },
        {
          id: "NOC-CENTRAL-005",
          projectTitle: "Pharmaceutical Supply Program",
          requestDate: "2024-02-11",
          status: "Rejected",
          projectValue: "₦1,200,000,000",
          contractorName: "Falcon Diagnostics Ltd",
          expectedDuration: "12 months",
          requestingMinistry: "Ministry of Health",
          ministryCode: "MOH",
          projectDescription:
            "Annual supply of essential medicines for state hospitals.",
          justification: "Continuous supply of medicines for patient care.",
          urgencyLevel: "Medium",
          category: "Pharmaceuticals",
          procuringEntity: "Kano State Hospital Management Board",
          contactPerson: "Dr. Fatima Yusuf",
          contactEmail: "fatima.yusuf@health.kano.gov.ng",
        },
      ];

      setNOCRequests(mockNOCs);
      setFilteredRequests(mockNOCs);
      localStorage.setItem("centralNOCRequests", JSON.stringify(mockNOCs));
    }
  }, []);

  // Filter NOC requests
  useEffect(() => {
    let filtered = nocRequests.filter((request) => {
      const matchesSearch =
        request.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.contractorName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        request.requestingMinistry
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter;
      const matchesMinistry =
        ministryFilter === "all" || request.ministryCode === ministryFilter;
      const matchesUrgency =
        urgencyFilter === "all" || request.urgencyLevel === urgencyFilter;

      return (
        matchesSearch && matchesStatus && matchesMinistry && matchesUrgency
      );
    });

    setFilteredRequests(filtered);
  }, [nocRequests, searchTerm, statusFilter, ministryFilter, urgencyFilter]);

  const handleLogout = () => {
    localStorage.removeItem("superuserToken");
    navigate("/");
  };

  const handleViewRequest = (request: NOCRequest) => {
    setSelectedRequest(request);
    setShowRequestModal(true);
  };

  const handleApproveRequest = (request: NOCRequest) => {
    setSelectedRequest(request);
    setActionType("approve");
    setShowApprovalModal(true);
  };

  const handleRejectRequest = (request: NOCRequest) => {
    setSelectedRequest(request);
    setActionType("reject");
    setShowRejectionModal(true);
  };

  const submitApproval = () => {
    if (!selectedRequest) return;

    const certificateNumber = `KNS/SNOC/${new Date().getFullYear()}/${String(nocRequests.filter((r) => r.status === "Approved").length + 1).padStart(3, "0")}`;

    const updatedRequests = nocRequests.map((request) =>
      request.id === selectedRequest.id
        ? {
            ...request,
            status: "Approved" as const,
            approvalDate: new Date().toISOString().split("T")[0],
            certificateNumber,
            approvalComments: approvalComments,
          }
        : request,
    );

    setNOCRequests(updatedRequests);
    localStorage.setItem("centralNOCRequests", JSON.stringify(updatedRequests));

    // Update the ministry-specific NOC data
    updateMinistryNOCData(selectedRequest, "Approved", certificateNumber);

    setShowApprovalModal(false);
    setApprovalComments("");
    setSelectedRequest(null);
    alert("NOC Request approved successfully!");
  };

  const submitRejection = () => {
    if (!selectedRequest) return;

    const updatedRequests = nocRequests.map((request) =>
      request.id === selectedRequest.id
        ? {
            ...request,
            status: "Rejected" as const,
            rejectionDate: new Date().toISOString().split("T")[0],
            rejectionReason: rejectReason,
          }
        : request,
    );

    setNOCRequests(updatedRequests);
    localStorage.setItem("centralNOCRequests", JSON.stringify(updatedRequests));

    // Update the ministry-specific NOC data
    updateMinistryNOCData(selectedRequest, "Rejected");

    setShowRejectionModal(false);
    setRejectReason("");
    setSelectedRequest(null);
    alert("NOC Request rejected.");
  };

  const updateMinistryNOCData = (
    request: NOCRequest,
    status: "Approved" | "Rejected",
    certificateNumber?: string,
  ) => {
    // Update the ministry-specific NOC requests in their localStorage
    const ministryNOCKey = `${request.ministryCode}_NOCRequests`;
    const ministryNOCs = localStorage.getItem(ministryNOCKey);

    if (ministryNOCs) {
      const requests = JSON.parse(ministryNOCs);
      const updatedRequests = requests.map((r: any) =>
        r.id === request.id
          ? {
              ...r,
              status,
              approvalDate:
                status === "Approved"
                  ? new Date().toISOString().split("T")[0]
                  : undefined,
              certificateNumber:
                status === "Approved" ? certificateNumber : undefined,
            }
          : r,
      );
      localStorage.setItem(ministryNOCKey, JSON.stringify(updatedRequests));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "text-green-600 bg-green-100";
      case "Rejected":
        return "text-red-600 bg-red-100";
      case "Pending":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "Critical":
        return "text-red-600 bg-red-100";
      case "High":
        return "text-orange-600 bg-orange-100";
      case "Medium":
        return "text-yellow-600 bg-yellow-100";
      case "Low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    moh: 0,
    mowi: 0,
    moe: 0,
  });

  // Calculate statistics whenever data or filters change
  useEffect(() => {
    // For the main stats (Total, Pending, Approved, Rejected), use filteredRequests
    // to reflect the current filter state
    const baseRequests = filteredRequests;

    // For ministry-specific counts, always use all requests to show overall ministry statistics
    const mohRequests = nocRequests.filter((r) => r.ministryCode === "MOH");
    const mowiRequests = nocRequests.filter((r) => r.ministryCode === "MOWI");
    const moeRequests = nocRequests.filter((r) => r.ministryCode === "MOE");

    setStats({
      total: baseRequests.length,
      pending: baseRequests.filter((r) => r.status === "Pending").length,
      approved: baseRequests.filter((r) => r.status === "Approved").length,
      rejected: baseRequests.filter((r) => r.status === "Rejected").length,
      moh: mohRequests.length,
      mowi: mowiRequests.length,
      moe: moeRequests.length,
    });
  }, [filteredRequests, nocRequests]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <FileCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Superuser NOC Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Central approval for No Objection Certificates
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-400" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Total Requests
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pending}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.approved}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.rejected}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Health</p>
                <p className="text-2xl font-bold text-gray-900">{stats.moh}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Works</p>
                <p className="text-2xl font-bold text-gray-900">{stats.mowi}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Education</p>
                <p className="text-2xl font-bold text-gray-900">{stats.moe}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              NOC Requests
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select
                value={ministryFilter}
                onChange={(e) => setMinistryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Ministries</option>
                <option value="MOH">Ministry of Health</option>
                <option value="MOWI">Ministry of Works</option>
                <option value="MOE">Ministry of Education</option>
              </select>

              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Urgency</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* NOC Requests Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ministry
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contractor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Urgency
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
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.projectTitle}
                          </div>
                          <div className="text-sm text-gray-500">
                            Duration: {request.expectedDuration}
                          </div>
                          <div className="text-sm text-gray-500">
                            Requested: {request.requestDate}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {request.requestingMinistry}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.ministryCode}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {request.contractorName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {request.projectValue}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(request.urgencyLevel)}`}
                        >
                          {request.urgencyLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewRequest(request)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {request.status === "Pending" && (
                            <>
                              <button
                                onClick={() => handleApproveRequest(request)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Request Details Modal */}
      {showRequestModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                NOC Request Details
              </h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Request ID
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedRequest.id}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Requesting Ministry
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedRequest.requestingMinistry}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Project Title
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedRequest.projectTitle}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Project Description
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedRequest.projectDescription}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Justification
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedRequest.justification}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Project Value
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedRequest.projectValue}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Expected Duration
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedRequest.expectedDuration}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contractor
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedRequest.contractorName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Urgency Level
                  </label>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(selectedRequest.urgencyLevel)}`}
                  >
                    {selectedRequest.urgencyLevel}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Person
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedRequest.contactPerson}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Email
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedRequest.contactEmail}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}
                >
                  {selectedRequest.status}
                </span>
                {selectedRequest.certificateNumber && (
                  <p className="mt-1 text-sm text-gray-600">
                    Certificate: {selectedRequest.certificateNumber}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Approve NOC Request
              </h3>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-4">
                You are about to approve the NOC request for "
                {selectedRequest.projectTitle}" from{" "}
                {selectedRequest.requestingMinistry}.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approval Comments (Optional)
                </label>
                <textarea
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Add any comments for this approval..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={submitApproval}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Approve NOC</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Reject NOC Request
              </h3>
              <button
                onClick={() => setShowRejectionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-4">
                You are about to reject the NOC request for "
                {selectedRequest.projectTitle}" from{" "}
                {selectedRequest.requestingMinistry}.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Please provide a reason for rejecting this request..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRejectionModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={submitRejection}
                  disabled={!rejectReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Reject NOC</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
