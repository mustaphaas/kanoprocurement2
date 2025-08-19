import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Filter,
  FileText,
  AlertTriangle,
  Clock,
  DollarSign,
  Calendar,
  Search,
  Building2,
  User,
  MessageSquare,
  ChevronDown,
  CheckSquare,
  Send,
} from "lucide-react";

interface NOCRequest {
  id: string;
  tenderId?: string;
  tenderTitle?: string;
  projectTitle: string;
  requestDate: string;
  status:
    | "Draft"
    | "Submitted"
    | "Under Review"
    | "Clarification Requested"
    | "Approved"
    | "Rejected"
    | "Pending";
  projectValue: string;
  contractorName: string;
  expectedDuration: string;
  ministryCode: string;
  ministryName: string;
  procuringEntity: string;
  contactPerson: string;
  contactEmail: string;
  projectDescription: string;
  justification: string;
  category: string;
  evaluationResults?: {
    technicalScore: number;
    financialScore: number;
    totalScore: number;
    recommendation: string;
  };
  documents: {
    evaluationReport?: File;
    committeeMinutes?: File;
    bidComparisonSheet?: File;
    recommendationForAward?: File;
    supportingDocuments?: File[];
  };
  timeline: {
    dateSubmitted?: string;
    reviewerAssigned?: string;
    reviewStartDate?: string;
    approvalDate?: string;
    rejectionDate?: string;
    clarificationRequestDate?: string;
  };
  certificateNumber?: string;
  rejectionReason?: string;
  clarificationNotes?: string;
}

export default function NOCRequestsTab() {
  const [nocRequests, setNOCRequests] = useState<NOCRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<NOCRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ministryFilter, setMinistryFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<NOCRequest | null>(
    null
  );
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showClarificationModal, setShowClarificationModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [clarificationNotes, setClarificationNotes] = useState("");

  // Load NOC requests on component mount
  useEffect(() => {
    loadNOCRequests();
  }, []);

  // Filter requests based on search and filters
  useEffect(() => {
    let filtered = nocRequests.filter((request) => {
      const matchesSearch =
        request.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.ministryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.tenderId?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter;

      const matchesMinistry =
        ministryFilter === "all" || request.ministryCode === ministryFilter;

      return matchesSearch && matchesStatus && matchesMinistry;
    });

    setFilteredRequests(filtered);
  }, [nocRequests, searchTerm, statusFilter, ministryFilter]);

  const loadNOCRequests = () => {
    // Load and synchronize NOC requests from all ministries
    const allNOCRequests: NOCRequest[] = [];

    // Load from all ministry storage keys
    const ministryKeys = ["MOH_NOCRequests", "MOWI_NOCRequests", "MOE_NOCRequests"];
    const ministryNames = {
      "MOH": "Ministry of Health",
      "MOWI": "Ministry of Works and Infrastructure",
      "MOE": "Ministry of Education"
    };

    ministryKeys.forEach((key) => {
      const ministryRequests = localStorage.getItem(key);
      if (ministryRequests) {
        const requests = JSON.parse(ministryRequests);
        const ministryCode = key.split("_")[0];

        // Convert ministry requests to central format
        requests.forEach((req: any) => {
          allNOCRequests.push({
            ...req,
            ministryCode,
            ministryName: ministryNames[ministryCode as keyof typeof ministryNames] || ministryCode,
            tenderId: req.tenderId || `TND-${ministryCode}-${req.id.split('-').pop()}`,
            tenderTitle: req.tenderTitle || `${req.projectTitle} Tender`,
            procuringEntity: `Kano State ${ministryNames[ministryCode as keyof typeof ministryNames]}`,
            contactPerson: req.contactPerson || "Ministry Contact",
            contactEmail: req.contactEmail || `contact@${ministryCode.toLowerCase()}.kano.gov.ng`,
            projectDescription: req.projectDescription || `Procurement for ${req.projectTitle}`,
            justification: req.justification || "Critical infrastructure development requirement",
            category: req.category || "Infrastructure",
            documents: req.documents || {},
            timeline: req.timeline || {
              dateSubmitted: req.requestDate,
              ...(req.approvalDate && { approvalDate: req.approvalDate })
            }
          });
        });
      }
    });

    // Load any existing central requests (for backwards compatibility)
    const storedCentralRequests = localStorage.getItem("centralNOCRequests");
    if (storedCentralRequests) {
      const centralRequests = JSON.parse(storedCentralRequests);
      // Only add central requests that don't exist in ministry data
      centralRequests.forEach((centralReq: NOCRequest) => {
        const exists = allNOCRequests.find(req => req.id === centralReq.id);
        if (!exists) {
          allNOCRequests.push(centralReq);
        }
      });
    }

    // If no requests found, initialize with comprehensive mock data
    if (allNOCRequests.length === 0) {
      const mockRequests: NOCRequest[] = [
        {
          id: "NOC-2024-001",
          tenderId: "TND-MOH-2024-001",
          tenderTitle: "Medical Equipment Procurement",
          projectTitle: "Hospital Equipment Upgrade",
          requestDate: "2024-01-15",
          status: "Submitted",
          projectValue: "₦125,000,000",
          contractorName: "MedTech Solutions Ltd",
          expectedDuration: "6 months",
          ministryCode: "MOH",
          ministryName: "Ministry of Health",
          procuringEntity: "Kano State Ministry of Health",
          contactPerson: "Dr. Amina Suleiman",
          contactEmail: "amina.suleiman@kanostate.gov.ng",
          projectDescription: "Procurement of advanced medical equipment for Kano General Hospital",
          justification: "Critical need for modern medical equipment to improve healthcare delivery",
          category: "Medical Equipment",
          evaluationResults: {
            technicalScore: 85,
            financialScore: 78,
            totalScore: 81.5,
            recommendation: "Award to MedTech Solutions Ltd - highest technical score"
          },
          documents: {},
          timeline: {
            dateSubmitted: "2024-01-15T10:30:00Z",
            reviewerAssigned: "BPP-001",
            reviewStartDate: "2024-01-16T09:00:00Z"
          }
        },
        {
          id: "NOC-2024-002",
          tenderId: "TND-MOWI-2024-003",
          tenderTitle: "Infrastructure Development",
          projectTitle: "Road Construction Project",
          requestDate: "2024-01-20",
          status: "Under Review",
          projectValue: "₦500,000,000",
          contractorName: "BuildCorp Nigeria Ltd",
          expectedDuration: "18 months",
          ministryCode: "MOWI",
          ministryName: "Ministry of Works and Infrastructure",
          procuringEntity: "Kano State Ministry of Works",
          contactPerson: "Eng. Muktar Ibrahim",
          contactEmail: "muktar.ibrahim@kanostate.gov.ng",
          projectDescription: "Construction of 25km dual carriageway connecting major districts",
          justification: "Improve transportation and economic activities in target areas",
          category: "Infrastructure",
          evaluationResults: {
            technicalScore: 92,
            financialScore: 85,
            totalScore: 88.5,
            recommendation: "Award to BuildCorp Nigeria Ltd - comprehensive proposal"
          },
          documents: {},
          timeline: {
            dateSubmitted: "2024-01-20T14:15:00Z",
            reviewerAssigned: "BPP-002",
            reviewStartDate: "2024-01-21T08:30:00Z"
          }
        }
      ];
      
      setNOCRequests(mockRequests);
      localStorage.setItem("centralNOCRequests", JSON.stringify(mockRequests));
    }
  };

  const handleViewRequest = (request: NOCRequest) => {
    setSelectedRequest(request);
    setShowRequestModal(true);
  };

  const handleApproveRequest = (request: NOCRequest) => {
    setSelectedRequest(request);
    setShowApprovalModal(true);
  };

  const handleRejectRequest = (request: NOCRequest) => {
    setSelectedRequest(request);
    setShowRejectionModal(true);
  };

  const handleClarifyRequest = (request: NOCRequest) => {
    setSelectedRequest(request);
    setShowClarificationModal(true);
  };

  const confirmApproval = () => {
    if (!selectedRequest) return;

    const certificateNumber = `KNS/NOC/${new Date().getFullYear()}/${String(
      nocRequests.filter((r) => r.status === "Approved").length + 1
    ).padStart(3, "0")}`;

    const updatedRequests = nocRequests.map((request) =>
      request.id === selectedRequest.id
        ? {
            ...request,
            status: "Approved" as const,
            certificateNumber,
            timeline: {
              ...request.timeline,
              approvalDate: new Date().toISOString(),
            },
          }
        : request
    );

    setNOCRequests(updatedRequests);
    localStorage.setItem("centralNOCRequests", JSON.stringify(updatedRequests));
    
    // Generate and download approval certificate
    generateApprovalCertificate(selectedRequest, certificateNumber);
    
    setShowApprovalModal(false);
    setSelectedRequest(null);
  };

  const confirmRejection = () => {
    if (!selectedRequest || !rejectionReason) return;

    const updatedRequests = nocRequests.map((request) =>
      request.id === selectedRequest.id
        ? {
            ...request,
            status: "Rejected" as const,
            rejectionReason,
            timeline: {
              ...request.timeline,
              rejectionDate: new Date().toISOString(),
            },
          }
        : request
    );

    setNOCRequests(updatedRequests);
    localStorage.setItem("centralNOCRequests", JSON.stringify(updatedRequests));
    
    setShowRejectionModal(false);
    setSelectedRequest(null);
    setRejectionReason("");
  };

  const confirmClarification = () => {
    if (!selectedRequest || !clarificationNotes) return;

    const updatedRequests = nocRequests.map((request) =>
      request.id === selectedRequest.id
        ? {
            ...request,
            status: "Clarification Requested" as const,
            clarificationNotes,
            timeline: {
              ...request.timeline,
              clarificationRequestDate: new Date().toISOString(),
            },
          }
        : request
    );

    setNOCRequests(updatedRequests);
    localStorage.setItem("centralNOCRequests", JSON.stringify(updatedRequests));
    
    setShowClarificationModal(false);
    setSelectedRequest(null);
    setClarificationNotes("");
  };

  const generateApprovalCertificate = (request: NOCRequest, certificateNumber: string) => {
    // Create a simple PDF-like content for download
    const certificateContent = `
      NO OBJECTION CERTIFICATE
      
      Certificate Number: ${certificateNumber}
      Date: ${new Date().toLocaleDateString()}
      
      Ministry: ${request.ministryName}
      Project: ${request.projectTitle}
      Contractor: ${request.contractorName}
      Value: ${request.projectValue}
      
      This is to certify that the Bureau of Public Procurement has NO OBJECTION
      to the award of the above contract to the recommended contractor.
      
      Authorized by: Bureau of Public Procurement
      Kano State Government
    `;

    const blob = new Blob([certificateContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NOC_${certificateNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Under Review":
        return "bg-blue-100 text-blue-800";
      case "Clarification Requested":
        return "bg-yellow-100 text-yellow-800";
      case "Submitted":
        return "bg-purple-100 text-purple-800";
      case "Draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (value: string) => {
    return value.replace(/₦/, "₦ ");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              NOC Requests Management
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Review and manage No Objection Certificate requests from ministries
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {filteredRequests.length} Requests
            </span>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Clarification Requested">Clarification Requested</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={ministryFilter}
            onChange={(e) => setMinistryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Ministries</option>
            <option value="MOH">Ministry of Health</option>
            <option value="MOWI">Ministry of Works & Infrastructure</option>
            <option value="MOE">Ministry of Education</option>
            <option value="MOA">Ministry of Agriculture</option>
          </select>

          <button
            onClick={loadNOCRequests}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ministry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tender Information
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submission Date
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {request.id}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {request.projectTitle}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {request.ministryName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.contactPerson}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {request.tenderId}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {request.tenderTitle}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(request.projectValue)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-500">
                        {formatDate(request.requestDate)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleViewRequest(request)}
                      className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {(request.status === "Submitted" || request.status === "Under Review") && (
                      <>
                        <button
                          onClick={() => handleApproveRequest(request)}
                          className="text-green-600 hover:text-green-900 inline-flex items-center"
                          title="Approve"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request)}
                          className="text-red-600 hover:text-red-900 inline-flex items-center"
                          title="Reject"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleClarifyRequest(request)}
                          className="text-yellow-600 hover:text-yellow-900 inline-flex items-center"
                          title="Request Clarification"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Details Modal */}
      {showRequestModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                NOC Request Details
              </h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Basic Information */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Request ID:</span>
                      <p className="text-sm text-gray-900">{selectedRequest.id}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Ministry:</span>
                      <p className="text-sm text-gray-900">{selectedRequest.ministryName}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Project Title:</span>
                      <p className="text-sm text-gray-900">{selectedRequest.projectTitle}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Project Value:</span>
                      <p className="text-sm text-gray-900">{formatCurrency(selectedRequest.projectValue)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Contractor:</span>
                      <p className="text-sm text-gray-900">{selectedRequest.contractorName}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Contact Person:</span>
                      <p className="text-sm text-gray-900">{selectedRequest.contactPerson}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Email:</span>
                      <p className="text-sm text-gray-900">{selectedRequest.contactEmail}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Evaluation & Timeline */}
              <div className="space-y-4">
                {selectedRequest.evaluationResults && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Evaluation Results</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Technical Score:</span>
                        <p className="text-sm text-gray-900">{selectedRequest.evaluationResults.technicalScore}%</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Financial Score:</span>
                        <p className="text-sm text-gray-900">{selectedRequest.evaluationResults.financialScore}%</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Total Score:</span>
                        <p className="text-sm text-gray-900">{selectedRequest.evaluationResults.totalScore}%</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Recommendation:</span>
                        <p className="text-sm text-gray-900">{selectedRequest.evaluationResults.recommendation}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Project Description</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-900">{selectedRequest.projectDescription}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Justification</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-900">{selectedRequest.justification}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              {(selectedRequest.status === "Submitted" || selectedRequest.status === "Under Review") && (
                <>
                  <button
                    onClick={() => {
                      setShowRequestModal(false);
                      handleApproveRequest(selectedRequest);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setShowRequestModal(false);
                      handleRejectRequest(selectedRequest);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      setShowRequestModal(false);
                      handleClarifyRequest(selectedRequest);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-md hover:bg-yellow-700"
                  >
                    Request Clarification
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="text-lg font-medium text-gray-900 mt-2">
                Approve NOC Request
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                You are about to approve the NOC request for "{selectedRequest.projectTitle}" 
                from {selectedRequest.ministryName}. This will generate an approval certificate.
              </p>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmApproval}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <XCircle className="mx-auto h-12 w-12 text-red-500" />
              <h3 className="text-lg font-medium text-gray-900 mt-2 text-center">
                Reject NOC Request
              </h3>
              <p className="text-sm text-gray-500 mt-2 text-center">
                You are about to reject the NOC request for "{selectedRequest.projectTitle}" 
                from {selectedRequest.ministryName}.
              </p>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection *
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                >
                  <option value="">Select reason...</option>
                  <option value="Non-compliance with procurement guidelines">Non-compliance with procurement guidelines</option>
                  <option value="Budget constraints">Budget constraints</option>
                  <option value="Conflict of interest">Conflict of interest</option>
                  <option value="Incomplete evaluation">Incomplete evaluation</option>
                  <option value="Technical deficiencies">Technical deficiencies</option>
                  <option value="Financial irregularities">Financial irregularities</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={() => {
                    setShowRejectionModal(false);
                    setRejectionReason("");
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRejection}
                  disabled={!rejectionReason}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clarification Modal */}
      {showClarificationModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <MessageSquare className="mx-auto h-12 w-12 text-yellow-500" />
              <h3 className="text-lg font-medium text-gray-900 mt-2 text-center">
                Request Clarification
              </h3>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Request clarification for the NOC request "{selectedRequest.projectTitle}" 
                from {selectedRequest.ministryName}.
              </p>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clarification Notes *
                </label>
                <textarea
                  value={clarificationNotes}
                  onChange={(e) => setClarificationNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter specific clarifications required..."
                  required
                />
              </div>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={() => {
                    setShowClarificationModal(false);
                    setClarificationNotes("");
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClarification}
                  disabled={!clarificationNotes.trim()}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
