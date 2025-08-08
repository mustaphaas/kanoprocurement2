import { useState } from "react";
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
import { FileText, Printer, Download, Calendar, Building2, CheckCircle, Clock, Eye, Search, Filter } from "lucide-react";

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

interface NoObjectionCertificateProps {
  onGenerateCertificate?: (data: NoObjectionCertificateData) => void;
}

export default function NoObjectionCertificate({ onGenerateCertificate }: NoObjectionCertificateProps) {
  const [formData, setFormData] = useState<NoObjectionCertificateData>({
    certificateNumber: `KNS/MOP/PNO/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
    dateIssued: new Date().toISOString().split('T')[0],
    projectTitle: "",
    projectReferenceNumber: "",
    procuringEntity: "",
    projectLocation: "",
    contractorVendor: "",
    contractAmount: "",
    contractAmountWords: "",
    expectedDuration: "",
    commissionerName: "",
    commissionerTitle: "Commissioner / DG",
  });

  const [showPreview, setShowPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending">("all");
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);

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
      procuringEntity: "Ministry of Works"
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
      procuringEntity: "Ministry of Health"
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
      procuringEntity: "Ministry of Science and Technology"
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
      procuringEntity: "Ministry of Water Resources"
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
      procuringEntity: "Ministry of Education"
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
      procuringEntity: "Ministry of Works"
    }
  ];

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || company.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const approvedCount = companies.filter(c => c.status === "approved").length;
  const pendingCount = companies.filter(c => c.status === "pending").length;

  const handleInputChange = (field: keyof NoObjectionCertificateData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const numberToWords = (amount: string): string => {
    const numAmount = parseFloat(amount.replace(/[₦,]/g, ''));
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
    handleInputChange('contractAmount', value);
    handleInputChange('contractAmountWords', numberToWords(value));
  };

  const handleGeneratePreview = () => {
    setShowPreview(true);
  };

  const handlePrint = () => {
    // Add print-area class to the certificate for better printing
    const certificateElement = document.querySelector('.certificate-preview');
    if (certificateElement) {
      certificateElement.classList.add('print-area');
      window.print();
      certificateElement.classList.remove('print-area');
    } else {
      window.print();
    }
  };

  const handleDownload = () => {
    // In a real app, this would generate a PDF
    alert("Certificate downloaded successfully!");
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
      setFormData({
        certificateNumber: company.certificateNumber || `KNS/MOP/PNO/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
        dateIssued: company.dateApproved || new Date().toISOString().split('T')[0],
        projectTitle: company.projectTitle,
        projectReferenceNumber: `${company.procuringEntity.split(' ')[0].toUpperCase()}/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 99) + 1).padStart(2, '0')}`,
        procuringEntity: company.procuringEntity,
        projectLocation: company.projectLocation,
        contractorVendor: company.name,
        contractAmount: company.projectValue,
        contractAmountWords: numberToWords(company.projectValue),
        expectedDuration: "12 months", // Default duration
        commissionerName: "Hon. Commissioner",
        commissionerTitle: "Commissioner",
      });
      setViewingCompany(company);
      setShowPreview(true);
    } else {
      alert(`Certificate not available. This company's application is currently ${company.status}.`);
    }
  };

  if (showPreview) {
    return (
      <div className="space-y-6">
        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => {
              setShowPreview(false);
              setViewingCompany(null);
            }}
          >
            ← Back to {viewingCompany ? 'Companies List' : 'Form'}
          </Button>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            {!viewingCompany && (
              <Button onClick={handleSaveCertificate}>
                Save Certificate
              </Button>
            )}
            {viewingCompany && (
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Certificate Issued
              </Button>
            )}
          </div>
        </div>

        {/* Certificate Information Banner */}
        {viewingCompany && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-4xl mx-auto mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">
                  Viewing Certificate for {viewingCompany.name}
                </h3>
                <p className="text-sm text-blue-700">
                  Certificate Number: {formData.certificateNumber} |
                  Status: <span className="font-medium">Approved</span> |
                  Issued: {viewingCompany.dateApproved ? new Date(viewingCompany.dateApproved).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-700">Certificate Active</span>
              </div>
            </div>
          </div>
        )}

        {/* Certificate Preview */}
        <div className="certificate-preview certificate-page bg-white border-2 border-gray-200 p-8 max-w-4xl mx-auto print:shadow-none print:border-none">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src="https://cdn.builder.io/api/v1/image/assets%2F2d6560e774e84f88a03cfa15b949d449%2Fd976824bf6e0486a8a140d0651057e81?format=webp&width=120" 
                alt="Kano State Coat of Arms" 
                className="h-24 w-auto"
              />
            </div>
            <h1 className="text-lg font-bold text-gray-900 mb-1">KANO STATE GOVERNMENT</h1>
            <h2 className="text-base font-semibold text-gray-800 mb-1">Ministry of Procurement, Project Monitoring & Evaluation</h2>
            <p className="text-sm text-gray-700 mb-1">Government House, Kano State, Nigeria</p>
            <p className="text-sm text-gray-600">Tel: [Insert Phone] Email: [Insert Email] Website: [Insert Website]</p>
          </div>

          {/* Certificate Title */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">NO OBJECTION CERTIFICATE</h3>
            <div className="flex justify-between text-sm text-gray-700 mb-4">
              <span>Certificate No: {formData.certificateNumber}</span>
              <span>Date Issued: {new Date(formData.dateIssued).toLocaleDateString('en-GB')}</span>
            </div>
          </div>

          {/* Certificate Body */}
          <div className="mb-6 text-sm text-gray-800 leading-relaxed">
            <p className="mb-4">
              This is to certify that no objection is hereby granted by the Kano State 
              Ministry of Procurement, Project Monitoring and Evaluation for procurement 
              and award of the following project:
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex">
                <span className="font-semibold w-40">Project Title:</span>
                <span className="flex-1">{formData.projectTitle}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-40">Project Reference Number:</span>
                <span className="flex-1">{formData.projectReferenceNumber}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-40">Procuring Entity:</span>
                <span className="flex-1">{formData.procuringEntity}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-40">Project Location:</span>
                <span className="flex-1">{formData.projectLocation}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-40">Contractor/Vendor:</span>
                <span className="flex-1">{formData.contractorVendor}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-40">Contract Amount:</span>
                <span className="flex-1">{formData.contractAmount} ({formData.contractAmountWords})</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-40">Expected Duration:</span>
                <span className="flex-1">{formData.expectedDuration}</span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold mb-3">Justification</h4>
              <p className="mb-3">
                The project has met all the relevant due process and procurement 
                requirements including:
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Budgetary provision</li>
                <li>Technical and financial evaluations</li>
                <li>Approval by the Tenders Board</li>
                <li>Compliance with the Public Procurement Law of Kano State</li>
              </ul>
            </div>

            <p className="mb-8">
              This certificate confirms that the Ministry has no objection to proceed 
              with the procurement process and award of contract.
            </p>
          </div>

          {/* Signature Section */}
          <div className="flex justify-between items-end">
            <div className="w-64">
              <div className="border-b border-gray-400 mb-2 h-8"></div>
              <p className="text-sm text-gray-700">({formData.commissionerName})</p>
              <p className="text-sm text-gray-700">{formData.commissionerTitle}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-700 mb-2">Date: {new Date(formData.dateIssued).toLocaleDateString('en-GB')}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-300">
            <p className="text-xs text-gray-600">
              This certificate does not in itself constitute a contract award; It only serves as clearance to 
              proceed to contract signing as per the State's procurement regulations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Objection Certificate Management</h1>
          <p className="text-gray-600">Manage and generate No Objection Certificates for procurement projects</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleGeneratePreview}
            disabled={!formData.projectTitle || !formData.contractorVendor}
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate New Certificate
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Approved Certificates</p>
                <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Companies</p>
                <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Companies List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Companies with No Objection Certificate Status</CardTitle>
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
              <Select value={statusFilter} onValueChange={(value: "all" | "approved" | "pending") => setStatusFilter(value)}>
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
                        <div className="text-sm font-medium text-gray-900">{company.name}</div>
                        <div className="text-sm text-gray-500">{company.contactPerson}</div>
                        <div className="text-sm text-gray-500">{company.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{company.projectTitle}</div>
                        <div className="text-sm text-gray-500">Value: {company.projectValue}</div>
                        <div className="text-sm text-gray-500">Location: {company.projectLocation}</div>
                        <div className="text-sm text-gray-500">Entity: {company.procuringEntity}</div>
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
                        {company.status === "approved" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {company.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                        {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        Requested: {new Date(company.dateRequested).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {company.status === "approved" ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {company.certificateNumber}
                          </div>
                          <div className="text-xs text-gray-500">
                            Approved: {company.dateApproved ? new Date(company.dateApproved).toLocaleDateString() : ""}
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
                        View
                      </Button>
                      {company.status === "approved" && (
                        <Button variant="outline" size="sm">
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">No companies found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No companies have requested No Objection Certificates."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Certificate Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="certificateNumber">Certificate Number</Label>
                <Input
                  id="certificateNumber"
                  value={formData.certificateNumber}
                  onChange={(e) => handleInputChange('certificateNumber', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dateIssued">Date Issued</Label>
                <Input
                  id="dateIssued"
                  type="date"
                  value={formData.dateIssued}
                  onChange={(e) => handleInputChange('dateIssued', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="projectTitle">Project Title *</Label>
              <Input
                id="projectTitle"
                value={formData.projectTitle}
                onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                placeholder="e.g., Construction of a New District Hospital"
              />
            </div>

            <div>
              <Label htmlFor="projectReferenceNumber">Project Reference Number</Label>
              <Input
                id="projectReferenceNumber"
                value={formData.projectReferenceNumber}
                onChange={(e) => handleInputChange('projectReferenceNumber', e.target.value)}
                placeholder="e.g., KNH/PROC/24/01"
              />
            </div>

            <div>
              <Label htmlFor="procuringEntity">Procuring Entity</Label>
              <Select value={formData.procuringEntity} onValueChange={(value) => handleInputChange('procuringEntity', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select procuring entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ministry of Health">Ministry of Health</SelectItem>
                  <SelectItem value="Ministry of Education">Ministry of Education</SelectItem>
                  <SelectItem value="Ministry of Works">Ministry of Works</SelectItem>
                  <SelectItem value="Ministry of Agriculture">Ministry of Agriculture</SelectItem>
                  <SelectItem value="Ministry of Water Resources">Ministry of Water Resources</SelectItem>
                  <SelectItem value="Kano State Primary Healthcare Development Agency">Kano State Primary Healthcare Development Agency</SelectItem>
                  <SelectItem value="Kano State Universal Basic Education Board">Kano State Universal Basic Education Board</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="projectLocation">Project Location</Label>
              <Input
                id="projectLocation"
                value={formData.projectLocation}
                onChange={(e) => handleInputChange('projectLocation', e.target.value)}
                placeholder="e.g., Gwale LGA, Kano State"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contract Details Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Contract Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contractorVendor">Contractor/Vendor *</Label>
              <Input
                id="contractorVendor"
                value={formData.contractorVendor}
                onChange={(e) => handleInputChange('contractorVendor', e.target.value)}
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
              <Label htmlFor="contractAmountWords">Contract Amount (Words)</Label>
              <Input
                id="contractAmountWords"
                value={formData.contractAmountWords}
                onChange={(e) => handleInputChange('contractAmountWords', e.target.value)}
                placeholder="e.g., Two Hundred and Fifty Million Naira"
              />
            </div>

            <div>
              <Label htmlFor="expectedDuration">Expected Duration</Label>
              <Input
                id="expectedDuration"
                value={formData.expectedDuration}
                onChange={(e) => handleInputChange('expectedDuration', e.target.value)}
                placeholder="e.g., 12 months"
              />
            </div>

            <div>
              <Label htmlFor="commissionerName">Commissioner/DG Name</Label>
              <Input
                id="commissionerName"
                value={formData.commissionerName}
                onChange={(e) => handleInputChange('commissionerName', e.target.value)}
                placeholder="Name of Hon. Commissioner or DG"
              />
            </div>

            <div>
              <Label htmlFor="commissionerTitle">Commissioner/DG Title</Label>
              <Select value={formData.commissionerTitle} onValueChange={(value) => handleInputChange('commissionerTitle', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Commissioner">Commissioner</SelectItem>
                  <SelectItem value="DG">DG</SelectItem>
                  <SelectItem value="Commissioner / DG">Commissioner / DG</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Certificate Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Fill in the required fields and click "Generate Preview" to see the certificate</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
