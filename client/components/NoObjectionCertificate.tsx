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
import { FileText, Printer, Download, Calendar, Building2 } from "lucide-react";

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

  if (showPreview) {
    return (
      <div className="space-y-6">
        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setShowPreview(false)}
          >
            ← Back to Form
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
            <Button onClick={handleSaveCertificate}>
              Save Certificate
            </Button>
          </div>
        </div>

        {/* Certificate Preview */}
        <div className="bg-white border-2 border-gray-200 p-8 max-w-4xl mx-auto print:shadow-none print:border-none">
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Generate No Objection Certificate</h1>
          <p className="text-gray-600">Create official No Objection Certificates for procurement projects</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleGeneratePreview}
            disabled={!formData.projectTitle || !formData.contractorVendor}
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Preview
          </Button>
        </div>
      </div>

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
