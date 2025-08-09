import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Printer,
  Download,
  Calendar,
  Building2,
  CheckCircle,
  Clock,
  Eye,
  Search,
  Filter,
  XCircle,
  User,
  DollarSign,
  AlertTriangle,
  Bell,
  RefreshCw,
  FileCheck,
  Award,
  Send,
} from "lucide-react";

interface NoObjectionCertificateData {
  certificateNumber: string;
  dateIssued: string;
  projectTitle: string;
  projectReferenceNumber: string;
  procuringEntity: string;
  projectLocation: string;
  contractorVendor: string;
  contractAmount: string;
  contractAmountWords: string;
  expectedDuration: string;
  commissionerName: string;
  commissionerTitle: string;
}

interface Company {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  projectTitle: string;
  projectValue: string;
  projectLocation: string;
  status: "approved" | "pending" | "rejected";
  certificateNumber?: string;
  dateApproved?: string;
  dateRequested: string;
  procuringEntity: string;
}

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
  category: string;
  procuringEntity: string;
  contactPerson: string;
  contactEmail: string;
  attachments?: string[];
}

interface NoObjectionCertificateProps {
  onGenerateCertificate?: (data: NoObjectionCertificateData) => void;
}

export default function NoObjectionCertificate({
  onGenerateCertificate,
}: NoObjectionCertificateProps) {
  const [formData, setFormData] = useState<NoObjectionCertificateData>({
    certificateNumber: `KNS/MOP/PNO/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")}`,
    dateIssued: new Date().toISOString().split("T")[0],
    projectTitle: "",
    projectReferenceNumber: "",
    procuringEntity: "",
    projectLocation: "",
    contractorVendor: "",
    contractAmount: "",
    contractAmountWords: "",
    expectedDuration: "",
    commissionerName: "Comrade Nura Iro Ma'aji",
    commissionerTitle: "Commissioner / DG",
  });

  const [showPreview, setShowPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "approved" | "pending"
  >("all");
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);

  // NOC Request Management State
  const [nocRequests, setNOCRequests] = useState<NOCRequest[]>([]);
  const [filteredNOCRequests, setFilteredNOCRequests] = useState<NOCRequest[]>([]);
  const [nocSearchTerm, setNocSearchTerm] = useState("");
  const [nocStatusFilter, setNocStatusFilter] = useState<string>("all");
  const [nocMinistryFilter, setNocMinistryFilter] = useState<string>("all");
  const [selectedNOCRequest, setSelectedNOCRequest] = useState<NOCRequest | null>(null);
  const [showNOCRequestModal, setShowNOCRequestModal] = useState(false);
  const [approvalComments, setApprovalComments] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [nocStats, setNocStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // Mock companies data
  const companies: Company[] = [
    {
      id: "1",
      name: "Northern Construction Ltd",
      contactPerson: "Ahmad Mahmoud",
      email: "ahmad@northernconstruction.com",
      projectTitle: "Kano-Zaria Highway Extension",
      projectValue: "₦850,000,000",
      projectLocation: "Kano North LGA",
      status: "approved",
      certificateNumber: "KNS/MOP/PNO/2024/001",
      dateApproved: "2024-01-28",
      dateRequested: "2024-01-20",
      procuringEntity: "Ministry of Works",
    },
    {
      id: "2",
      name: "Sahel Medical Supplies",
      contactPerson: "Fatima Yusuf",
      email: "fatima@sahelmedical.com",
      projectTitle: "Hospital Equipment Supply",
      projectValue: "₦250,000,000",
      projectLocation: "Gwale LGA, Kano State",
      status: "approved",
      certificateNumber: "KNS/MOP/PNO/2024/002",
      dateApproved: "2024-01-27",
      dateRequested: "2024-01-18",
      procuringEntity: "Ministry of Health",
    },
    {
      id: "3",
      name: "TechSolutions Nigeria",
      contactPerson: "Ibrahim Hassan",
      email: "ibrahim@techsolutions.ng",
      projectTitle: "ICT Infrastructure Upgrade",
      projectValue: "₦1,200,000,000",
      projectLocation: "Kano State Secretariat",
      status: "approved",
      certificateNumber: "KNS/MOP/PNO/2024/003",
      dateApproved: "2024-01-25",
      dateRequested: "2024-01-15",
      procuringEntity: "Ministry of Science and Technology",
    },
    {
      id: "4",
      name: "Kano Infrastructure Corp",
      contactPerson: "Musa Abdullahi",
      email: "info@kanoinfra.com",
      projectTitle: "Water Treatment Plant Construction",
      projectValue: "₦650,000,000",
      projectLocation: "Ungogo LGA",
      status: "pending",
      dateRequested: "2024-01-30",
      procuringEntity: "Ministry of Water Resources",
    },
    {
      id: "5",
      name: "Alpha Engineering Services",
      contactPerson: "Aisha Mohammed",
      email: "projects@alphaeng.ng",
      projectTitle: "School Building Renovation",
      projectValue: "₦180,000,000",
      projectLocation: "Tarauni LGA",
      status: "pending",
      dateRequested: "2024-02-01",
      procuringEntity: "Ministry of Education",
    },
    {
      id: "6",
      name: "Delta Construction Ltd",
      contactPerson: "Yunusa Bello",
      email: "contracts@deltaconstruction.ng",
      projectTitle: "Rural Road Development",
      projectValue: "₦420,000,000",
      projectLocation: "Kura LGA",
      status: "pending",
      dateRequested: "2024-02-02",
      procuringEntity: "Ministry of Works",
    },
  ];

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || company.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const approvedCount = companies.filter((c) => c.status === "approved").length;
  const pendingCount = companies.filter((c) => c.status === "pending").length;

  // Load NOC requests from central storage
  useEffect(() => {
    const storedNOCs = localStorage.getItem("centralNOCRequests");
    if (storedNOCs) {
      const requests = JSON.parse(storedNOCs);
      setNOCRequests(requests);
      setFilteredNOCRequests(requests);
    } else {
      // Initialize with some mock NOC request data
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
          projectDescription: "Supply of advanced medical equipment for 5 primary healthcare centers including X-ray machines, ultrasound equipment, and laboratory instruments.",
          justification: "Critical equipment needed to improve healthcare delivery in rural areas of Kano State.",
          category: "Medical Equipment",
          procuringEntity: "Kano State Primary Healthcare Development Agency",
          contactPerson: "Dr. Amina Hassan",
          contactEmail: "amina.hassan@health.kano.gov.ng",
          attachments: ["equipment_specifications.pdf", "vendor_certificates.pdf"],
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
          projectDescription: "Complete rehabilitation of 85km highway section including road surface, drainage systems, and safety infrastructure.",
          justification: "Critical transportation infrastructure to improve interstate commerce and reduce travel time.",
          category: "Road Construction",
          procuringEntity: "Kano State Road Maintenance Agency",
          contactPerson: "Eng. Ibrahim Mohammed",
          contactEmail: "ibrahim.mohammed@works.kano.gov.ng",
        },
        {
          id: "NOC-CENTRAL-003",
          projectTitle: "Digital Learning Platform Development",
          requestDate: "2024-02-13",
          status: "Approved",
          projectValue: "₦1,800,000,000",
          contractorName: "EduTech Solutions Ltd",
          expectedDuration: "12 months",
          approvalDate: "2024-02-16",
          certificateNumber: "KNS/SNOC/2024/001",
          requestingMinistry: "Ministry of Education",
          ministryCode: "MOE",
          projectDescription: "Development of comprehensive digital learning platform for secondary schools with interactive content and assessment tools.",
          justification: "Essential for digital transformation of education sector and improved learning outcomes.",
          category: "Educational Technology",
          procuringEntity: "Kano State Ministry of Education",
          contactPerson: "Prof. Aisha Garba",
          contactEmail: "aisha.garba@education.kano.gov.ng",
        },
      ];
      setNOCRequests(mockNOCs);
      setFilteredNOCRequests(mockNOCs);
      localStorage.setItem("centralNOCRequests", JSON.stringify(mockNOCs));
    }
  }, []);

  // Filter NOC requests
  useEffect(() => {
    let filtered = nocRequests.filter((request) => {
      const matchesSearch =
        request.projectTitle.toLowerCase().includes(nocSearchTerm.toLowerCase()) ||
        request.contractorName.toLowerCase().includes(nocSearchTerm.toLowerCase()) ||
        request.requestingMinistry.toLowerCase().includes(nocSearchTerm.toLowerCase());

      const matchesStatus = nocStatusFilter === "all" || request.status === nocStatusFilter;
      const matchesMinistry = nocMinistryFilter === "all" || request.ministryCode === nocMinistryFilter;

      return matchesSearch && matchesStatus && matchesMinistry;
    });

    setFilteredNOCRequests(filtered);
  }, [nocRequests, nocSearchTerm, nocStatusFilter, nocMinistryFilter]);

  // Calculate NOC statistics
  useEffect(() => {
    const baseRequests = filteredNOCRequests;
    setNocStats({
      total: baseRequests.length,
      pending: baseRequests.filter((r) => r.status === "Pending").length,
      approved: baseRequests.filter((r) => r.status === "Approved").length,
      rejected: baseRequests.filter((r) => r.status === "Rejected").length,
    });
  }, [filteredNOCRequests]);

  const handleInputChange = (
    field: keyof NoObjectionCertificateData,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const numberToWords = (amount: string): string => {
    const numAmount = parseFloat(amount.replace(/[₦,]/g, ""));
    if (isNaN(numAmount)) return "";

    // Simple conversion for demonstration - in real app, use a proper library
    const millions = Math.floor(numAmount / 1000000);
    const remainder = numAmount % 1000000;

    if (millions > 0) {
      return `${millions} Million Naira`;
    }
    return `${Math.floor(numAmount / 1000)} Thousand Naira`;
  };

  const handleAmountChange = (value: string) => {
    handleInputChange("contractAmount", value);
    handleInputChange("contractAmountWords", numberToWords(value));
  };

  const handleGeneratePreview = () => {
    setShowPreview(true);
  };

  const handlePrint = () => {
    // Add print-area class to the certificate for better printing
    const certificateElement = document.querySelector(".certificate-preview");
    if (certificateElement) {
      certificateElement.classList.add("print-area");
      window.print();
      certificateElement.classList.remove("print-area");
    } else {
      window.print();
    }
  };

  const handleDownload = () => {
    // Generate PDF using browser's print functionality
    const certificateElement = document.querySelector(".certificate-preview");
    if (!certificateElement) {
      alert("Certificate preview not found. Please generate a preview first.");
      return;
    }

    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Popup blocked. Please allow popups and try again.");
      return;
    }

    // Get the certificate HTML content
    const certificateHTML = certificateElement.outerHTML;

    // Create a complete HTML document for the print window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>No Objection Certificate - ${formData.certificateNumber}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
            .certificate-preview {
              max-width: none !important;
              margin: 0 !important;
              border: none !important;
              box-shadow: none !important;
            }
            @media print {
              body { margin: 0; padding: 0; }
              .certificate-preview { border: none !important; }
            }
            /* Copy relevant Tailwind classes */
            .text-center { text-align: center; }
            .mb-8 { margin-bottom: 2rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mb-3 { margin-bottom: 0.75rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-1 { margin-bottom: 0.25rem; }
            .mt-8 { margin-top: 2rem; }
            .mt-2 { margin-top: 0.5rem; }
            .pt-4 { padding-top: 1rem; }
            .p-8 { padding: 2rem; }
            .p-3 { padding: 0.75rem; }
            .bg-white { background-color: white; }
            .border-b { border-bottom-width: 1px; }
            .border-t { border-top-width: 1px; }
            .border-gray-400 { border-color: #9ca3af; }
            .border-gray-300 { border-color: #d1d5db; }
            .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
            .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
            .text-base { font-size: 1rem; line-height: 1.5rem; }
            .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
            .text-xs { font-size: 0.75rem; line-height: 1rem; }
            .font-bold { font-weight: 700; }
            .font-semibold { font-weight: 600; }
            .font-medium { font-weight: 500; }
            .text-green-700 { color: #15803d; }
            .text-gray-900 { color: #111827; }
            .text-gray-800 { color: #1f2937; }
            .text-gray-700 { color: #374151; }
            .text-gray-600 { color: #4b5563; }
            .flex { display: flex; }
            .justify-center { justify-content: center; }
            .justify-between { justify-content: space-between; }
            .items-center { align-items: center; }
            .items-end { align-items: flex-end; }
            .space-y-3 > * + * { margin-top: 0.75rem; }
            .space-y-1 > * + * { margin-top: 0.25rem; }
            .w-64 { width: 16rem; }
            .h-24 { height: 6rem; }
            .h-8 { height: 2rem; }
            .w-auto { width: auto; }
            .list-disc { list-style-type: disc; }
            .ml-6 { margin-left: 1.5rem; }
            .leading-relaxed { line-height: 1.625; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
          ${certificateHTML}
          <script>
            window.onload = function() {
              // Auto-trigger print dialog
              window.print();
              // Close window after printing (or canceling)
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const handleSaveCertificate = () => {
    if (onGenerateCertificate) {
      onGenerateCertificate(formData);
    }
    alert("No Objection Certificate generated successfully!");
  };

  const handleViewCompanyCertificate = (company: Company) => {
    if (company.status === "approved") {
      // Pre-populate form data with company information
      const newFormData = {
        certificateNumber:
          company.certificateNumber ||
          `KNS/MOP/PNO/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")}`,
        dateIssued:
          company.dateApproved || new Date().toISOString().split("T")[0],
        projectTitle: company.projectTitle,
        projectReferenceNumber: `${company.procuringEntity.split(" ")[0].toUpperCase()}/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 99) + 1).padStart(2, "0")}`,
        procuringEntity: company.procuringEntity,
        projectLocation: company.projectLocation,
        contractorVendor: company.name,
        contractAmount: company.projectValue,
        contractAmountWords: numberToWords(company.projectValue),
        expectedDuration: "12 months", // Default duration
        commissionerName: "Comrade Nura Iro Ma'aji",
        commissionerTitle: "Commissioner",
      };
      setFormData(newFormData);
      setViewingCompany(company);

      // Scroll to certificate preview section
      setTimeout(() => {
        const previewElement = document.querySelector(".certificate-preview");
        if (previewElement) {
          previewElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);
    } else {
      alert(
        `Certificate not available. This company's application is currently ${company.status}.`,
      );
    }
  };

  const handleDownloadCompanyCertificate = (company: Company) => {
    if (company.status === "approved") {
      // Temporarily set form data for this company and trigger download
      const tempFormData = {
        certificateNumber:
          company.certificateNumber ||
          `KNS/MOP/PNO/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")}`,
        dateIssued:
          company.dateApproved || new Date().toISOString().split("T")[0],
        projectTitle: company.projectTitle,
        projectReferenceNumber: `${company.procuringEntity.split(" ")[0].toUpperCase()}/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 99) + 1).padStart(2, "0")}`,
        procuringEntity: company.procuringEntity,
        projectLocation: company.projectLocation,
        contractorVendor: company.name,
        contractAmount: company.projectValue,
        contractAmountWords: numberToWords(company.projectValue),
        expectedDuration: "12 months",
        commissionerName: "Comrade Nura Iro Ma'aji",
        commissionerTitle: "Commissioner",
      };

      // Generate certificate HTML for download
      const certificateHTML = generateCertificateHTML(tempFormData);
      downloadCertificateAsPDF(
        certificateHTML,
        `NOC_${company.certificateNumber || company.name.replace(/\s+/g, "_")}`,
      );
    } else {
      alert(
        `Cannot download certificate. This company's application is currently ${company.status}.`,
      );
    }
  };

  const generateCertificateHTML = (data: NoObjectionCertificateData) => {
    return `
      <div style="background: white; padding: 2rem; max-width: 800px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 2rem;">
          <div style="display: flex; justify-content: center; margin-bottom: 1rem;">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F2d6560e774e84f88a03cfa15b949d449%2F4ff1f0f68b064883a635b3de138dfb31?format=webp&width=120"
              alt="Kano State Coat of Arms"
              style="height: 96px; width: auto;"
            />
          </div>
          <h1 style="font-size: 1.25rem; font-weight: 700; color: #15803d; margin-bottom: 0.25rem; margin-top: 0;">KANO STATE GOVERNMENT</h1>
          <h2 style="font-size: 1.125rem; font-weight: 600; color: #15803d; margin-bottom: 0.25rem; margin-top: 0;">Ministry of Procurement, Project Monitoring & Evaluation</h2>
          <p style="font-size: 0.875rem; color: #374151; margin-bottom: 0.25rem; margin-top: 0;">21 Magaji Rumfa Road, Kano</p>
          <p style="font-size: 0.875rem; color: #4b5563; margin-top: 0;">Tel: 08065455715 Email: info@procurement.kn.gov.ng Website: www.eprocurement.kn.gov.ng</p>
        </div>

        <!-- Certificate Title -->
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #111827; margin-bottom: 1rem; margin-top: 0;">NO OBJECTION CERTIFICATE</h3>
          <div style="display: flex; justify-content: space-between; font-size: 0.875rem; color: #374151; margin-bottom: 1rem;">
            <span>Certificate No: ${data.certificateNumber}</span>
            <span>Date Issued: ${new Date(data.dateIssued).toLocaleDateString("en-GB")}</span>
          </div>
        </div>

        <!-- Certificate Body -->
        <div style="margin-bottom: 1.5rem; font-size: 0.875rem; color: #1f2937; line-height: 1.625;">
          <p style="margin-bottom: 1rem; margin-top: 0;">
            This is to certify that no objection is hereby granted by the Kano State
            Ministry of Procurement, Project Monitoring and Evaluation for procurement
            and award of the following project:
          </p>

          <div style="margin-bottom: 1.5rem;">
            <div style="margin-bottom: 0.75rem;"><span style="font-weight: 600; display: inline-block; width: 200px;">Project Title:</span>${data.projectTitle}</div>
            <div style="margin-bottom: 0.75rem;"><span style="font-weight: 600; display: inline-block; width: 200px;">Project Reference Number:</span>${data.projectReferenceNumber}</div>
            <div style="margin-bottom: 0.75rem;"><span style="font-weight: 600; display: inline-block; width: 200px;">Procuring Entity:</span>${data.procuringEntity}</div>
            <div style="margin-bottom: 0.75rem;"><span style="font-weight: 600; display: inline-block; width: 200px;">Project Location:</span>${data.projectLocation}</div>
            <div style="margin-bottom: 0.75rem;"><span style="font-weight: 600; display: inline-block; width: 200px;">Contractor/Vendor:</span>${data.contractorVendor}</div>
            <div style="margin-bottom: 0.75rem;"><span style="font-weight: 600; display: inline-block; width: 200px;">Contract Amount:</span>${data.contractAmount} (${data.contractAmountWords})</div>
            <div style="margin-bottom: 0.75rem;"><span style="font-weight: 600; display: inline-block; width: 200px;">Expected Duration:</span>${data.expectedDuration}</div>
          </div>

          <div style="margin-bottom: 1.5rem;">
            <h4 style="font-weight: 600; margin-bottom: 0.75rem; margin-top: 0;">Justification</h4>
            <p style="margin-bottom: 0.75rem; margin-top: 0;">
              The project has met all the relevant due process and procurement
              requirements including:
            </p>
            <ul style="list-style-type: disc; margin-left: 1.5rem; margin-top: 0; margin-bottom: 0;">
              <li>Budgetary provision</li>
              <li>Technical and financial evaluations</li>
              <li>Approval by the Tenders Board</li>
              <li>Compliance with the Public Procurement Law of Kano State</li>
            </ul>
          </div>

          <p style="margin-bottom: 2rem; margin-top: 0;">
            This certificate confirms that the Ministry has no objection to proceed
            with the procurement process and award of contract.
          </p>
        </div>

        <!-- Signature Section -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end;">
          <div style="width: 256px;">
            <div style="border-bottom: 1px solid #9ca3af; margin-bottom: 0.5rem; height: 2rem;"></div>
            <p style="font-size: 0.875rem; color: #374151; margin: 0;">Comrade Nura Iro Ma'aji</p>
            <p style="font-size: 0.875rem; color: #374151; margin: 0;">${data.commissionerTitle}</p>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 0.875rem; color: #374151; margin-bottom: 0.5rem; margin-top: 0;">Date: ${new Date(data.dateIssued).toLocaleDateString("en-GB")}</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #d1d5db;">
          <p style="font-size: 0.75rem; color: #4b5563; margin: 0;">
            This certificate does not in itself constitute a contract award; It only serves as clearance to
            proceed to contract signing as per the State's procurement regulations.
          </p>
        </div>
      </div>
    `;
  };

  // NOC Request Management Handlers
  const handleViewNOCRequest = (request: NOCRequest) => {
    if (request.status === "Approved") {
      // For approved requests, show the electronic certificate
      const certificateData = {
        certificateNumber: request.certificateNumber || `KNS/SNOC/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")}`,
        dateIssued: request.approvalDate || new Date().toISOString().split("T")[0],
        projectTitle: request.projectTitle,
        projectReferenceNumber: `${request.ministryCode}/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 99) + 1).padStart(2, "0")}`,
        procuringEntity: request.procuringEntity,
        projectLocation: "Kano State", // Default location
        contractorVendor: request.contractorName,
        contractAmount: request.projectValue,
        contractAmountWords: numberToWords(request.projectValue),
        expectedDuration: request.expectedDuration,
        commissionerName: "Comrade Nura Iro Ma'aji",
        commissionerTitle: "Commissioner / DG",
      };

      // Set the form data to show the certificate
      setFormData(certificateData);

      // Scroll to certificate preview section
      setTimeout(() => {
        const previewElement = document.querySelector(".certificate-preview");
        if (previewElement) {
          previewElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);
    } else {
      // For non-approved requests, show the request details modal
      setSelectedNOCRequest(request);
      setShowNOCRequestModal(true);
    }
  };

  const handleApproveNOCRequest = (request: NOCRequest) => {
    setSelectedNOCRequest(request);
    setShowApprovalModal(true);
  };

  const handleRejectNOCRequest = (request: NOCRequest) => {
    setSelectedNOCRequest(request);
    setShowRejectionModal(true);
  };

  const submitNOCApproval = () => {
    if (!selectedNOCRequest) return;

    const certificateNumber = `KNS/SNOC/${new Date().getFullYear()}/${String(nocRequests.filter((r) => r.status === "Approved").length + 1).padStart(3, "0")}`;

    const updatedRequests = nocRequests.map((request) =>
      request.id === selectedNOCRequest.id
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

    setShowApprovalModal(false);
    setApprovalComments("");
    setSelectedNOCRequest(null);
    alert("NOC Request approved successfully!");
  };

  const submitNOCRejection = () => {
    if (!selectedNOCRequest) return;

    const updatedRequests = nocRequests.map((request) =>
      request.id === selectedNOCRequest.id
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

    setShowRejectionModal(false);
    setRejectReason("");
    setSelectedNOCRequest(null);
    alert("NOC Request rejected.");
  };

  const getNOCStatusColor = (status: string) => {
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


  const downloadCertificateAsPDF = (htmlContent: string, filename: string) => {
    // Create a new window for printing/downloading
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Popup blocked. Please allow popups and try again.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${filename}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
            @media print {
              body { margin: 0; padding: 0; }
            }
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            No Objection Certificate Management
          </h1>
          <p className="text-gray-600">
            Manage and generate No Objection Certificates for procurement
            projects
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print Certificate
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* NOC Request Management Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <FileCheck className="h-5 w-5 mr-2" />
              NOC Request Management
            </CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-400" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* NOC Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4 border">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{nocStats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{nocStats.pending}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">{nocStats.approved}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">{nocStats.rejected}</p>
                </div>
              </div>
            </div>
          </div>

          {/* NOC Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search NOC requests..."
                value={nocSearchTerm}
                onChange={(e) => setNocSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <select
              value={nocStatusFilter}
              onChange={(e) => setNocStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <select
              value={nocMinistryFilter}
              onChange={(e) => setNocMinistryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Ministries</option>
              <option value="MOH">Ministry of Health</option>
              <option value="MOWI">Ministry of Works</option>
              <option value="MOE">Ministry of Education</option>
            </select>
          </div>

          {/* NOC Requests Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ministry</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contractor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredNOCRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.projectTitle}</div>
                        <div className="text-sm text-gray-500">Duration: {request.expectedDuration}</div>
                        <div className="text-sm text-gray-500">Requested: {request.requestDate}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{request.requestingMinistry}</div>
                      <div className="text-sm text-gray-500">{request.ministryCode}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{request.contractorName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{request.projectValue}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getNOCStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewNOCRequest(request)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {request.status === "Pending" && (
                          <>
                            <button
                              onClick={() => handleApproveNOCRequest(request)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRejectNOCRequest(request)}
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
        </CardContent>
      </Card>

      {/* Certificate Generation Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Approved Certificates
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {approvedCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Pending Approval
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Total Companies
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {companies.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Companies List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Companies with No Objection Certificate Status
            </CardTitle>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search companies..."
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value: "all" | "approved" | "pending") =>
                  setStatusFilter(value)
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project Information
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Certificate Details
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
                          {company.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {company.contactPerson}
                        </div>
                        <div className="text-sm text-gray-500">
                          {company.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {company.projectTitle}
                        </div>
                        <div className="text-sm text-gray-500">
                          Value: {company.projectValue}
                        </div>
                        <div className="text-sm text-gray-500">
                          Location: {company.projectLocation}
                        </div>
                        <div className="text-sm text-gray-500">
                          Entity: {company.procuringEntity}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          company.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : company.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {company.status === "approved" && (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        )}
                        {company.status === "pending" && (
                          <Clock className="h-3 w-3 mr-1" />
                        )}
                        {company.status.charAt(0).toUpperCase() +
                          company.status.slice(1)}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        Requested:{" "}
                        {new Date(company.dateRequested).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {company.status === "approved" ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {company.certificateNumber}
                          </div>
                          <div className="text-xs text-gray-500">
                            Approved:{" "}
                            {company.dateApproved
                              ? new Date(
                                  company.dateApproved,
                                ).toLocaleDateString()
                              : ""}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          Certificate not yet issued
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewCompanyCertificate(company)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        {company.status === "approved"
                          ? "View Certificate"
                          : "View Details"}
                      </Button>
                      {company.status === "approved" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDownloadCompanyCertificate(company)
                          }
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      )}
                      {company.status === "pending" && (
                        <Button size="sm">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCompanies.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No companies found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No companies have requested No Objection Certificates."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certificate Generation and Preview Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Form Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Generate New Certificate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="certificateNumber">Certificate Number</Label>
                <Input
                  id="certificateNumber"
                  value={formData.certificateNumber}
                  onChange={(e) =>
                    handleInputChange("certificateNumber", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="dateIssued">Date Issued</Label>
                <Input
                  id="dateIssued"
                  type="date"
                  value={formData.dateIssued}
                  onChange={(e) =>
                    handleInputChange("dateIssued", e.target.value)
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="projectTitle">Project Title *</Label>
              <Input
                id="projectTitle"
                value={formData.projectTitle}
                onChange={(e) =>
                  handleInputChange("projectTitle", e.target.value)
                }
                placeholder="e.g., Construction of a New District Hospital"
              />
            </div>

            <div>
              <Label htmlFor="projectReferenceNumber">
                Project Reference Number
              </Label>
              <Input
                id="projectReferenceNumber"
                value={formData.projectReferenceNumber}
                onChange={(e) =>
                  handleInputChange("projectReferenceNumber", e.target.value)
                }
                placeholder="e.g., KNH/PROC/24/01"
              />
            </div>

            <div>
              <Label htmlFor="procuringEntity">Procuring Entity</Label>
              <Select
                value={formData.procuringEntity}
                onValueChange={(value) =>
                  handleInputChange("procuringEntity", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select procuring entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ministry of Health">
                    Ministry of Health
                  </SelectItem>
                  <SelectItem value="Ministry of Education">
                    Ministry of Education
                  </SelectItem>
                  <SelectItem value="Ministry of Works">
                    Ministry of Works
                  </SelectItem>
                  <SelectItem value="Ministry of Agriculture">
                    Ministry of Agriculture
                  </SelectItem>
                  <SelectItem value="Ministry of Water Resources">
                    Ministry of Water Resources
                  </SelectItem>
                  <SelectItem value="Kano State Primary Healthcare Development Agency">
                    Kano State Primary Healthcare Development Agency
                  </SelectItem>
                  <SelectItem value="Kano State Universal Basic Education Board">
                    Kano State Universal Basic Education Board
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="projectLocation">Project Location</Label>
              <Input
                id="projectLocation"
                value={formData.projectLocation}
                onChange={(e) =>
                  handleInputChange("projectLocation", e.target.value)
                }
                placeholder="e.g., Gwale LGA, Kano State"
              />
            </div>

            <div>
              <Label htmlFor="contractorVendor">Contractor/Vendor *</Label>
              <Input
                id="contractorVendor"
                value={formData.contractorVendor}
                onChange={(e) =>
                  handleInputChange("contractorVendor", e.target.value)
                }
                placeholder="e.g., Acme Builders Ltd."
              />
            </div>

            <div>
              <Label htmlFor="contractAmount">Contract Amount</Label>
              <Input
                id="contractAmount"
                value={formData.contractAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="e.g., ₦250,000,000"
              />
            </div>

            <div>
              <Label htmlFor="contractAmountWords">
                Contract Amount (Words)
              </Label>
              <Input
                id="contractAmountWords"
                value={formData.contractAmountWords}
                onChange={(e) =>
                  handleInputChange("contractAmountWords", e.target.value)
                }
                placeholder="e.g., Two Hundred and Fifty Million Naira"
              />
            </div>

            <div>
              <Label htmlFor="expectedDuration">Expected Duration</Label>
              <Input
                id="expectedDuration"
                value={formData.expectedDuration}
                onChange={(e) =>
                  handleInputChange("expectedDuration", e.target.value)
                }
                placeholder="e.g., 12 months"
              />
            </div>

            <div>
              <Label htmlFor="commissionerName">Commissioner/DG Name</Label>
              <Input
                id="commissionerName"
                value={formData.commissionerName}
                onChange={(e) =>
                  handleInputChange("commissionerName", e.target.value)
                }
                placeholder="Name of Hon. Commissioner or DG"
              />
            </div>

            <div>
              <Label htmlFor="commissionerTitle">Commissioner/DG Title</Label>
              <Select
                value={formData.commissionerTitle}
                onValueChange={(value) =>
                  handleInputChange("commissionerTitle", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Commissioner">Commissioner</SelectItem>
                  <SelectItem value="DG">DG</SelectItem>
                  <SelectItem value="Commissioner / DG">
                    Commissioner / DG
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setFormData({
                    certificateNumber: `KNS/MOP/PNO/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")}`,
                    dateIssued: new Date().toISOString().split("T")[0],
                    projectTitle: "",
                    projectReferenceNumber: "",
                    procuringEntity: "",
                    projectLocation: "",
                    contractorVendor: "",
                    contractAmount: "",
                    contractAmountWords: "",
                    expectedDuration: "",
                    commissionerName: "Comrade Nura Iro Ma'aji",
                    commissionerTitle: "Commissioner / DG",
                  });
                  setViewingCompany(null);
                }}
              >
                Clear Form
              </Button>
              <Button
                onClick={handleSaveCertificate}
                disabled={!formData.projectTitle || !formData.contractorVendor}
              >
                Save Certificate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Certificate Preview Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Certificate Preview</CardTitle>
              {viewingCompany && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">
                    Viewing: {viewingCompany.name}
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {formData.projectTitle && formData.contractorVendor ? (
              <div
                className="certificate-preview certificate-page bg-white border border-gray-200 p-6 max-w-full mx-auto print:shadow-none print:border-none"
                style={{ fontSize: "12px" }}
              >
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-3">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets%2F2d6560e774e84f88a03cfa15b949d449%2F4ff1f0f68b064883a635b3de138dfb31?format=webp&width=120"
                      alt="Kano State Coat of Arms"
                      className="h-16 w-auto"
                    />
                  </div>
                  <h1 className="text-base font-bold text-green-700 mb-1">
                    KANO STATE GOVERNMENT
                  </h1>
                  <h2 className="text-sm font-semibold text-green-700 mb-1">
                    Ministry of Procurement, Project Monitoring & Evaluation
                  </h2>
                  <p className="text-xs text-gray-700 mb-1">
                    21 Magaji Rumfa Road, Kano
                  </p>
                  <p className="text-xs text-gray-600">
                    Tel: 08065455715 Email: info@procurement.kn.gov.ng Website:
                    www.eprocurement.kn.gov.ng
                  </p>
                </div>

                {/* Certificate Title */}
                <div className="text-center mb-4">
                  <h3 className="text-base font-bold text-gray-900 mb-3">
                    NO OBJECTION CERTIFICATE
                  </h3>
                  <div className="flex justify-between text-xs text-gray-700 mb-3">
                    <span>Certificate No: {formData.certificateNumber}</span>
                    <span>
                      Date Issued:{" "}
                      {new Date(formData.dateIssued).toLocaleDateString(
                        "en-GB",
                      )}
                    </span>
                  </div>
                </div>

                {/* Certificate Body */}
                <div className="mb-4 text-xs text-gray-800 leading-relaxed">
                  <p className="mb-3">
                    This is to certify that no objection is hereby granted by
                    the Kano State Ministry of Procurement, Project Monitoring
                    and Evaluation for procurement and award of the following
                    project:
                  </p>

                  <div className="space-y-2 mb-4">
                    <div>
                      <span className="font-semibold">Project Title:</span>{" "}
                      {formData.projectTitle}
                    </div>
                    <div>
                      <span className="font-semibold">
                        Project Reference Number:
                      </span>{" "}
                      {formData.projectReferenceNumber}
                    </div>
                    <div>
                      <span className="font-semibold">Procuring Entity:</span>{" "}
                      {formData.procuringEntity}
                    </div>
                    <div>
                      <span className="font-semibold">Project Location:</span>{" "}
                      {formData.projectLocation}
                    </div>
                    <div>
                      <span className="font-semibold">Contractor/Vendor:</span>{" "}
                      {formData.contractorVendor}
                    </div>
                    <div>
                      <span className="font-semibold">Contract Amount:</span>{" "}
                      {formData.contractAmount} ({formData.contractAmountWords})
                    </div>
                    <div>
                      <span className="font-semibold">Expected Duration:</span>{" "}
                      {formData.expectedDuration}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Justification</h4>
                    <p className="mb-2">
                      The project has met all the relevant due process and
                      procurement requirements including:
                    </p>
                    <ul className="list-disc ml-4 space-y-1">
                      <li>Budgetary provision</li>
                      <li>Technical and financial evaluations</li>
                      <li>Approval by the Tenders Board</li>
                      <li>
                        Compliance with the Public Procurement Law of Kano State
                      </li>
                    </ul>
                  </div>

                  <p className="mb-6">
                    This certificate confirms that the Ministry has no objection
                    to proceed with the procurement process and award of
                    contract.
                  </p>
                </div>

                {/* Signature Section */}
                <div className="flex justify-between items-end">
                  <div className="w-48">
                    <div className="border-b border-gray-400 mb-1 h-6"></div>
                    <p className="text-xs text-gray-700">
                      Comrade Nura Iro Ma'aji
                    </p>
                    <p className="text-xs text-gray-700">
                      {formData.commissionerTitle}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-700 mb-1">
                      Date:{" "}
                      {new Date(formData.dateIssued).toLocaleDateString(
                        "en-GB",
                      )}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-3 border-t border-gray-300">
                  <p className="text-xs text-gray-600">
                    This certificate does not in itself constitute a contract
                    award; It only serves as clearance to proceed to contract
                    signing as per the State's procurement regulations.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>
                  Fill in the required fields to see the certificate preview
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* NOC Request Details Modal */}
      {showNOCRequestModal && selectedNOCRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-semibold text-gray-900">NOC Request Details</h3>
              <button
                onClick={() => setShowNOCRequestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Request ID</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedNOCRequest.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Requesting Ministry</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedNOCRequest.requestingMinistry}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Project Title</label>
                <p className="mt-1 text-sm text-gray-900">{selectedNOCRequest.projectTitle}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Project Description</label>
                <p className="mt-1 text-sm text-gray-900">{selectedNOCRequest.projectDescription}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getNOCStatusColor(selectedNOCRequest.status)}`}>
                  {selectedNOCRequest.status}
                </span>
                {selectedNOCRequest.certificateNumber && (
                  <p className="mt-1 text-sm text-gray-600">Certificate: {selectedNOCRequest.certificateNumber}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NOC Approval Modal */}
      {showApprovalModal && selectedNOCRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-semibold text-gray-900">Approve NOC Request</h3>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-4">
                You are about to approve the NOC request for "{selectedNOCRequest.projectTitle}" from {selectedNOCRequest.requestingMinistry}.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Approval Comments (Optional)</label>
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
                  onClick={submitNOCApproval}
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

      {/* NOC Rejection Modal */}
      {showRejectionModal && selectedNOCRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-semibold text-gray-900">Reject NOC Request</h3>
              <button
                onClick={() => setShowRejectionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-4">
                You are about to reject the NOC request for "{selectedNOCRequest.projectTitle}" from {selectedNOCRequest.requestingMinistry}.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Rejection <span className="text-red-500">*</span></label>
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
                  onClick={submitNOCRejection}
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
