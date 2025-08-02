import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Upload,
  Check,
  AlertCircle,
  ArrowLeft,
  FileText,
  Shield
} from "lucide-react";

interface FormData {
  companyName: string;
  registrationNumber: string;
  address: string;
  businessType: string;
  contactPersonName: string;
  contactPersonEmail: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface UploadedFiles {
  incorporation: File | null;
  taxClearance: File | null;
  companyProfile: File | null;
  cacForm: File | null;
  otherDocuments: File[];
}

interface DocumentExpiry {
  incorporation?: string;
  taxClearance?: string;
  companyProfile?: string;
  cacForm?: string;
}

interface ExtractionStatus {
  incorporation?: 'processing' | 'success' | 'failed' | 'manual';
  taxClearance?: 'processing' | 'success' | 'failed' | 'manual';
  companyProfile?: 'processing' | 'success' | 'failed' | 'manual';
  cacForm?: 'processing' | 'success' | 'failed' | 'manual';
}

export default function CompanyRegistration() {
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    registrationNumber: "",
    address: "",
    businessType: "",
    contactPersonName: "",
    contactPersonEmail: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({
    incorporation: null,
    taxClearance: null,
    companyProfile: null,
    cacForm: null,
    otherDocuments: []
  });

  const [documentExpiry, setDocumentExpiry] = useState<DocumentExpiry>({});
  const [extractionStatus, setExtractionStatus] = useState<ExtractionStatus>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const businessTypes = [
    "Limited Liability Company",
    "Partnership",
    "Sole Proprietorship",
    "Public Limited Company",
    "NGO/Non-Profit",
    "Cooperative Society",
    "Government Agency",
    "International Organization"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fileType: keyof UploadedFiles) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // File validation
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

    const filesToProcess = Array.from(files);
    const validFiles = filesToProcess.filter(file => {
      if (file.size > maxSize) {
        alert(`File "${file.name}" is too large. Maximum size allowed is 5MB.`);
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        alert(`File "${file.name}" has an invalid format. Only PDF, JPG, JPEG, and PNG files are allowed.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    if (fileType === "otherDocuments") {
      setUploadedFiles(prev => ({
        ...prev,
        [fileType]: [...prev.otherDocuments, ...validFiles]
      }));
    } else {
      setUploadedFiles(prev => ({
        ...prev,
        [fileType]: validFiles[0]
      }));
    }

    // Clear any previous errors for this field
    if (errors[fileType]) {
      setErrors(prev => ({
        ...prev,
        [fileType]: ""
      }));
    }
  };

  const removeFile = (fileType: keyof UploadedFiles, index?: number) => {
    if (fileType === "otherDocuments" && typeof index === "number") {
      setUploadedFiles(prev => ({
        ...prev,
        otherDocuments: prev.otherDocuments.filter((_, i) => i !== index)
      }));
    } else {
      setUploadedFiles(prev => ({
        ...prev,
        [fileType]: null
      }));
      // Clear expiry date when file is removed
      setDocumentExpiry(prev => ({
        ...prev,
        [fileType]: undefined
      }));
      setExtractionStatus(prev => ({
        ...prev,
        [fileType]: undefined
      }));
    }
  };

  // Simulate OCR text extraction from document
  const extractTextFromDocument = async (file: File): Promise<string> => {
    // In a real implementation, this would use OCR services like:
    // - Google Cloud Vision API
    // - AWS Textract
    // - Azure Computer Vision
    // - Tesseract.js for client-side OCR

    // Simulated extraction with common document patterns
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock extracted text based on file name patterns
        const fileName = file.name.toLowerCase();

        if (fileName.includes('tax') || fileName.includes('clearance')) {
          resolve(`TAX CLEARANCE CERTIFICATE
            This is to certify that SAMPLE COMPANY LIMITED
            has fulfilled all tax obligations as at December 31, 2024
            Valid until: 31/12/2025
            Expiry Date: December 31, 2025
            Nigeria Internal Revenue Service`);
        } else if (fileName.includes('cac') || fileName.includes('incorporation')) {
          resolve(`CERTIFICATE OF INCORPORATION
            Company Name: SAMPLE COMPANY LIMITED
            Registration Number: RC123456
            Date of Incorporation: 15/01/2020
            Valid Period: 5 Years
            Expires: 15/01/2025
            Corporate Affairs Commission`);
        } else {
          resolve(`BUSINESS DOCUMENT
            Company: SAMPLE BUSINESS
            Issue Date: 10/05/2023
            Validity Period: 2 Years
            Expiration: 10/05/2025
            Valid until 10th May 2025`);
        }
      }, 2000 + Math.random() * 3000); // Simulate processing time
    });
  };

  // Extract dates from text using regex patterns
  const extractExpiryDate = (text: string): string | null => {
    const datePatterns = [
      // DD/MM/YYYY or DD-MM-YYYY
      /(?:expir[ey]s?|valid\s+until|expir[ey]\s+date|expires?\s+on)\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
      // Month DD, YYYY
      /(?:expir[ey]s?|valid\s+until|expir[ey]\s+date|expires?\s+on)\s*:?\s*([a-z]+\s+\d{1,2},?\s+\d{4})/i,
      // DD Month YYYY
      /(?:expir[ey]s?|valid\s+until|expir[ey]\s+date|expires?\s+on)\s*:?\s*(\d{1,2}(?:st|nd|rd|th)?\s+[a-z]+\s+\d{4})/i,
      // YYYY-MM-DD
      /(?:expir[ey]s?|valid\s+until|expir[ey]\s+date|expires?\s+on)\s*:?\s*(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/i,
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    // Fallback: look for any date-like patterns
    const fallbackPatterns = [
      /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})\b/g,
      /\b([a-z]+\s+\d{1,2},?\s+\d{4})\b/gi,
      /\b(\d{1,2}(?:st|nd|rd|th)?\s+[a-z]+\s+\d{4})\b/gi
    ];

    for (const pattern of fallbackPatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        // Return the last date found (likely to be expiry)
        return matches[matches.length - 1];
      }
    }

    return null;
  };

  // Validate and format extracted date
  const validateAndFormatDate = (dateString: string): string | null => {
    try {
      // Try to parse various date formats
      let date: Date;

      if (dateString.includes('/') || dateString.includes('-')) {
        // Handle DD/MM/YYYY or MM/DD/YYYY formats
        const parts = dateString.split(/[\/\-]/);
        if (parts.length === 3) {
          // Assume DD/MM/YYYY format for international compliance
          date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        } else {
          date = new Date(dateString);
        }
      } else {
        // Handle text dates
        date = new Date(dateString);
      }

      if (isNaN(date.getTime())) {
        return null;
      }

      // Check if date is in the future (valid for a document)
      const today = new Date();
      if (date < today) {
        return null; // Expired document
      }

      // Format as YYYY-MM-DD for HTML date input
      return date.toISOString().split('T')[0];
    } catch {
      return null;
    }
  };

  // Process document for expiry date extraction
  const processDocumentForExpiry = async (file: File, fileType: keyof UploadedFiles) => {
    if (fileType === 'otherDocuments') return;

    setExtractionStatus(prev => ({
      ...prev,
      [fileType]: 'processing'
    }));

    try {
      // Extract text from document
      const extractedText = await extractTextFromDocument(file);

      // Extract expiry date from text
      const rawDate = extractExpiryDate(extractedText);

      if (rawDate) {
        const formattedDate = validateAndFormatDate(rawDate);

        if (formattedDate) {
          setDocumentExpiry(prev => ({
            ...prev,
            [fileType]: formattedDate
          }));
          setExtractionStatus(prev => ({
            ...prev,
            [fileType]: 'success'
          }));
        } else {
          // Date found but invalid/expired
          setExtractionStatus(prev => ({
            ...prev,
            [fileType]: 'failed'
          }));
        }
      } else {
        // No date pattern found
        setExtractionStatus(prev => ({
          ...prev,
          [fileType]: 'failed'
        }));
      }
    } catch (error) {
      console.error('Error processing document:', error);
      setExtractionStatus(prev => ({
        ...prev,
        [fileType]: 'failed'
      }));
    }
  };

  // Handle manual date input
  const handleManualDateInput = (fileType: keyof UploadedFiles, date: string) => {
    setDocumentExpiry(prev => ({
      ...prev,
      [fileType]: date
    }));
    setExtractionStatus(prev => ({
      ...prev,
      [fileType]: 'manual'
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required field validation
    if (!formData.companyName.trim()) newErrors.companyName = "Company name is required";
    if (!formData.registrationNumber.trim()) newErrors.registrationNumber = "Registration number is required";
    if (!formData.address.trim()) newErrors.address = "Company address is required";
    if (!formData.businessType) newErrors.businessType = "Business type is required";
    if (!formData.contactPersonName.trim()) newErrors.contactPersonName = "Contact person name is required";
    if (!formData.contactPersonEmail.trim()) newErrors.contactPersonEmail = "Contact email is required";
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must agree to the terms and conditions";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.contactPersonEmail && !emailRegex.test(formData.contactPersonEmail)) {
      newErrors.contactPersonEmail = "Please enter a valid email address";
    }

    // Password validation
    if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Phone validation
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    // Document validation
    if (!uploadedFiles.incorporation) newErrors.incorporation = "Certificate of Incorporation is required";
    if (!uploadedFiles.taxClearance) newErrors.taxClearance = "Tax Clearance Certificate is required";
    if (!uploadedFiles.companyProfile) newErrors.companyProfile = "Company Profile is required";
    if (!uploadedFiles.cacForm) newErrors.cacForm = "CAC Form is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Here you would typically send the data to your backend
      console.log("Form Data:", formData);
      console.log("Uploaded Files:", uploadedFiles);
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Submitted</h2>
            <p className="text-gray-600 mb-6">
              Thank you for registering. Your application is under review. You will receive an email notification once your account is activated.
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-green-700">KanoProc</h1>
                <p className="text-xs text-gray-600">Company Registration</p>
              </div>
            </Link>
            <Link 
              to="/" 
              className="flex items-center px-4 py-2 text-gray-600 hover:text-green-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Company Registration</h1>
            <p className="text-gray-600 mt-1">Register your company to participate in Kano State procurement opportunities</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Company Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.companyName ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter company name"
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.companyName}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Registration Number (CAC) *
                  </label>
                  <input
                    type="text"
                    id="registrationNumber"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.registrationNumber ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter CAC registration number"
                  />
                  {errors.registrationNumber && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.registrationNumber}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Address *
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter complete company address"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.address}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type *
                  </label>
                  <select
                    id="businessType"
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.businessType ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select business type</option>
                    {businessTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.businessType && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.businessType}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contactPersonName" className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    id="contactPersonName"
                    name="contactPersonName"
                    value={formData.contactPersonName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.contactPersonName ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter contact person full name"
                  />
                  {errors.contactPersonName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.contactPersonName}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="contactPersonEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person Email *
                  </label>
                  <input
                    type="email"
                    id="contactPersonEmail"
                    name="contactPersonEmail"
                    value={formData.contactPersonEmail}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.contactPersonEmail ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter email address"
                  />
                  {errors.contactPersonEmail && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.contactPersonEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter phone number"
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Password Setup */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Password Setup</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter password (min. 8 characters)"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Document Uploads */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Uploads</h2>
              <div className="space-y-6">
                {/* Certificate of Incorporation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certificate of Incorporation *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    {uploadedFiles.incorporation ? (
                      <div className="flex items-center justify-between bg-green-50 p-3 rounded-md">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-green-600 mr-2" />
                          <span className="text-sm text-green-800">{uploadedFiles.incorporation.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('incorporation')}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <label htmlFor="incorporation" className="cursor-pointer">
                          <span className="text-sm text-gray-600">Click to upload or drag and drop</span>
                          <input
                            type="file"
                            id="incorporation"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(e, 'incorporation')}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                  {errors.incorporation && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.incorporation}
                    </p>
                  )}
                </div>

                {/* Tax Clearance Certificate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Clearance Certificate *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    {uploadedFiles.taxClearance ? (
                      <div className="flex items-center justify-between bg-green-50 p-3 rounded-md">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-green-600 mr-2" />
                          <span className="text-sm text-green-800">{uploadedFiles.taxClearance.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('taxClearance')}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <label htmlFor="taxClearance" className="cursor-pointer">
                          <span className="text-sm text-gray-600">Click to upload or drag and drop</span>
                          <input
                            type="file"
                            id="taxClearance"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(e, 'taxClearance')}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                  {errors.taxClearance && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.taxClearance}
                    </p>
                  )}
                </div>

                {/* Company Profile */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Profile *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    {uploadedFiles.companyProfile ? (
                      <div className="flex items-center justify-between bg-green-50 p-3 rounded-md">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-green-600 mr-2" />
                          <span className="text-sm text-green-800">{uploadedFiles.companyProfile.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('companyProfile')}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <label htmlFor="companyProfile" className="cursor-pointer">
                          <span className="text-sm text-gray-600">Click to upload or drag and drop</span>
                          <input
                            type="file"
                            id="companyProfile"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(e, 'companyProfile')}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                  {errors.companyProfile && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.companyProfile}
                    </p>
                  )}
                </div>

                {/* CAC Form */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CAC Form *
                    <span className="text-xs text-gray-500 ml-2">(PDF, JPG, PNG - Max 5MB)</span>
                  </label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-green-400 transition-colors"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('border-green-400', 'bg-green-50');
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-green-400', 'bg-green-50');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-green-400', 'bg-green-50');
                      const files = e.dataTransfer.files;
                      if (files.length > 0) {
                        const mockEvent = {
                          target: { files }
                        } as React.ChangeEvent<HTMLInputElement>;
                        handleFileUpload(mockEvent, 'cacForm');
                      }
                    }}
                  >
                    {uploadedFiles.cacForm ? (
                      <div className="flex items-center justify-between bg-green-50 p-3 rounded-md">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-green-600 mr-2" />
                          <div>
                            <span className="text-sm text-green-800 block">{uploadedFiles.cacForm.name}</span>
                            <span className="text-xs text-green-600">
                              {(uploadedFiles.cacForm.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('cacForm')}
                          className="text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <label htmlFor="cacForm" className="cursor-pointer block">
                          <span className="text-sm text-gray-600 block mb-1">
                            <strong>Click to upload</strong> or drag and drop your CAC Form
                          </span>
                          <span className="text-xs text-gray-500">
                            PDF, JPG, JPEG or PNG (max. 5MB)
                          </span>
                          <input
                            type="file"
                            id="cacForm"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(e, 'cacForm')}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                  {errors.cacForm && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.cacForm}
                    </p>
                  )}
                </div>

                {/* Other Documents */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Other Statutory Documents (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    {uploadedFiles.otherDocuments.length > 0 ? (
                      <div className="space-y-2">
                        {uploadedFiles.otherDocuments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded-md">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 text-blue-600 mr-2" />
                              <span className="text-sm text-blue-800">{file.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile('otherDocuments', index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <label htmlFor="otherDocuments" className="block cursor-pointer text-center p-3 border border-dashed border-blue-300 rounded-md text-blue-600 hover:bg-blue-50">
                          Add more documents
                          <input
                            type="file"
                            id="otherDocuments"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(e, 'otherDocuments')}
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <label htmlFor="otherDocuments" className="cursor-pointer">
                          <span className="text-sm text-gray-600">Click to upload additional documents</span>
                          <input
                            type="file"
                            id="otherDocuments"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(e, 'otherDocuments')}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div>
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                  I agree to the <a href="#" className="text-green-600 hover:underline">Terms and Conditions</a> and acknowledge that all information provided is accurate and complete. *
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.agreeToTerms}
                </p>
              )}
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Security Notice</p>
                  <p>
                    Your application will be reviewed by our admin team. You will receive an email notification once your account is activated. 
                    Please ensure all documents are valid and up-to-date to avoid delays in processing.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <Link
                  to="/"
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Register
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
