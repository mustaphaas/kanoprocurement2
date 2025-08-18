import { useState } from "react";
import {
  X,
  Save,
  Building2,
  Building,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  User,
  DollarSign,
  Calendar,
  Plus,
  Trash2,
  Shield,
  UserPlus,
  Users,
} from "lucide-react";
import {
  CreateMDARequest,
  MDASettings,
  CreateMDAAdminRequest,
  MDAPermissions,
} from "@shared/api";

interface MDAWithAdminData {
  mda: CreateMDARequest;
  admin: CreateMDAAdminRequest;
}

interface MDAWithAdminFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MDAWithAdminData) => void;
  mode: "create" | "edit";
  initialData?: any;
  parentMDAs?: Array<{ id: string; name: string; type: string }>;
}

export default function MDAWithAdminForm({
  isOpen,
  onClose,
  onSubmit,
  mode = "create",
  initialData,
  parentMDAs = [],
}: MDAWithAdminFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [mdaFormData, setMDAFormData] = useState({
    name: initialData?.mda?.name || "",
    type:
      initialData?.mda?.type ||
      ("ministry" as "ministry" | "department" | "agency"),
    description: initialData?.mda?.description || "",
    parentMDA: initialData?.mda?.parentMDA || "",
    contactEmail: initialData?.mda?.contactEmail || "",
    contactPhone: initialData?.mda?.contactPhone || "",
    address: initialData?.mda?.address || "",
    headOfMDA: initialData?.mda?.headOfMDA || "",
    settings:
      initialData?.mda?.settings ||
      ({
        procurementThresholds: {
          level1: 5000000,
          level2: 25000000,
          level3: 100000000,
        },
        allowedCategories: [""],
        customWorkflows: false,
        budgetYear: new Date().getFullYear().toString(),
        totalBudget: 0,
      } as MDASettings),
  });

  const [adminFormData, setAdminFormData] = useState({
    mdaId: "", // Will be set when MDA is created
    email: initialData?.admin?.email || "",
    displayName: initialData?.admin?.displayName || "",
    role:
      initialData?.admin?.role ||
      ("mda_admin" as "mda_admin" | "mda_super_admin"),
    permissions:
      initialData?.admin?.permissions ||
      ({
        canCreateUsers: true,
        canManageTenders: true,
        canApproveContracts: false,
        canViewReports: true,
        canManageSettings: false,
        maxApprovalAmount: 10000000,
      } as MDAPermissions),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const procurementCategories = [
    "Construction",
    "Consultancy Services",
    "Goods and Supplies",
    "ICT Equipment",
    "Medical Equipment",
    "Pharmaceuticals",
    "Transportation",
    "Maintenance Services",
    "Training and Capacity Building",
    "Infrastructure",
    "Educational Materials",
    "Healthcare Services",
    "Legal Services",
    "Financial Services",
    "Security Services",
    "Cleaning Services",
    "Catering Services",
    "Office Equipment",
    "Vehicle and Fuel",
    "Other Services",
  ];

  const validateMDAForm = () => {
    const newErrors: Record<string, string> = {};

    if (!mdaFormData.name.trim()) {
      newErrors.name = "MDA name is required";
    }

    if (!mdaFormData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!mdaFormData.contactEmail) {
      newErrors.contactEmail = "Contact email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mdaFormData.contactEmail)) {
      newErrors.contactEmail = "Invalid email format";
    }

    if (!mdaFormData.contactPhone) {
      newErrors.contactPhone = "Contact phone is required";
    }

    if (!mdaFormData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!mdaFormData.headOfMDA.trim()) {
      newErrors.headOfMDA = "Head of MDA is required";
    }

    if (mdaFormData.settings.totalBudget <= 0) {
      newErrors.totalBudget = "Total budget must be greater than 0";
    }

    if (
      mdaFormData.settings.allowedCategories.filter((cat) => cat.trim())
        .length === 0
    ) {
      newErrors.allowedCategories =
        "At least one procurement category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAdminForm = () => {
    const newErrors: Record<string, string> = {};

    if (!adminFormData.email) {
      newErrors.adminEmail = "Admin email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminFormData.email)) {
      newErrors.adminEmail = "Invalid email format";
    }

    if (!adminFormData.displayName.trim()) {
      newErrors.displayName = "Admin display name is required";
    }

    if (adminFormData.permissions.maxApprovalAmount <= 0) {
      newErrors.maxApprovalAmount =
        "Maximum approval amount must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateMDAForm()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep === 1) {
      handleNext();
      return;
    }

    if (!validateAdminForm()) return;

    setIsSubmitting(true);

    try {
      const mdaData: MDAWithAdminData = {
        mda: mdaFormData,
        admin: {
          ...adminFormData,
          mdaId: "", // Will be set by the handler after MDA creation
        },
      };

      await onSubmit(mdaData);
      onClose();
    } catch (error) {
      console.error("Error creating MDA with admin:", error);
      alert("Error creating MDA. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCategory = () => {
    setMDAFormData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        allowedCategories: [...prev.settings.allowedCategories, ""],
      },
    }));
  };

  const removeCategory = (index: number) => {
    setMDAFormData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        allowedCategories: prev.settings.allowedCategories.filter(
          (_, i) => i !== index,
        ),
      },
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Building2 className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {mode === "create"
                  ? "Create New MDA with Administrator"
                  : "Edit MDA"}
              </h2>
              <p className="text-sm text-gray-600">
                Step {currentStep} of 2:{" "}
                {currentStep === 1
                  ? "MDA Information"
                  : "Administrator Assignment"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-gray-50">
          <div className="flex items-center">
            <div
              className={`flex items-center ${currentStep >= 1 ? "text-blue-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
              >
                1
              </div>
              <span className="ml-2 text-sm font-medium">MDA Details</span>
            </div>
            <div
              className={`flex-1 h-1 mx-4 ${currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"}`}
            ></div>
            <div
              className={`flex items-center ${currentStep >= 2 ? "text-blue-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
              >
                2
              </div>
              <span className="ml-2 text-sm font-medium">Administrator</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    MDA Name *
                  </label>
                  <input
                    type="text"
                    value={mdaFormData.name}
                    onChange={(e) =>
                      setMDAFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="e.g., Ministry of Health"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    value={mdaFormData.type}
                    onChange={(e) =>
                      setMDAFormData((prev) => ({
                        ...prev,
                        type: e.target.value as
                          | "ministry"
                          | "department"
                          | "agency",
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ministry">Ministry</option>
                    <option value="department">Department</option>
                    <option value="agency">Agency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={mdaFormData.description}
                  onChange={(e) =>
                    setMDAFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Brief description of the MDA's purpose and responsibilities"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    value={mdaFormData.contactEmail}
                    onChange={(e) =>
                      setMDAFormData((prev) => ({
                        ...prev,
                        contactEmail: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.contactEmail ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="contact@ministry.gov.ng"
                  />
                  {errors.contactEmail && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.contactEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    value={mdaFormData.contactPhone}
                    onChange={(e) =>
                      setMDAFormData((prev) => ({
                        ...prev,
                        contactPhone: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.contactPhone ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="+234 xxx xxx xxxx"
                  />
                  {errors.contactPhone && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.contactPhone}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={mdaFormData.address}
                    onChange={(e) =>
                      setMDAFormData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.address ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Official address"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Head of MDA *
                  </label>
                  <input
                    type="text"
                    value={mdaFormData.headOfMDA}
                    onChange={(e) =>
                      setMDAFormData((prev) => ({
                        ...prev,
                        headOfMDA: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.headOfMDA ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Name of the head/minister/director"
                  />
                  {errors.headOfMDA && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.headOfMDA}
                    </p>
                  )}
                </div>
              </div>

              {/* Budget Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Year *
                  </label>
                  <input
                    type="text"
                    value={mdaFormData.settings.budgetYear}
                    onChange={(e) =>
                      setMDAFormData((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          budgetYear: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Budget (₦) *
                  </label>
                  <input
                    type="number"
                    value={mdaFormData.settings.totalBudget}
                    onChange={(e) =>
                      setMDAFormData((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          totalBudget: Number(e.target.value),
                        },
                      }))
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.totalBudget ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="0"
                  />
                  {errors.totalBudget && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.totalBudget}
                    </p>
                  )}
                </div>
              </div>

              {/* Procurement Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allowed Procurement Categories *
                </label>
                <div className="space-y-2">
                  {mdaFormData.settings.allowedCategories.map(
                    (category, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <select
                          value={category}
                          onChange={(e) => {
                            const newCategories = [
                              ...mdaFormData.settings.allowedCategories,
                            ];
                            newCategories[index] = e.target.value;
                            setMDAFormData((prev) => ({
                              ...prev,
                              settings: {
                                ...prev.settings,
                                allowedCategories: newCategories,
                              },
                            }));
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select a category</option>
                          {procurementCategories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => removeCategory(index)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ),
                  )}
                  <button
                    type="button"
                    onClick={addCategory}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Category
                  </button>
                </div>
                {errors.allowedCategories && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.allowedCategories}
                  </p>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-medium text-blue-900">
                    Administrator Assignment
                  </h3>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Assign an administrator who will manage users and operations
                  for this MDA.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Administrator Email *
                  </label>
                  <input
                    type="email"
                    value={adminFormData.email}
                    onChange={(e) =>
                      setAdminFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.adminEmail ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="admin@ministry.gov.ng"
                  />
                  {errors.adminEmail && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.adminEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    value={adminFormData.displayName}
                    onChange={(e) =>
                      setAdminFormData((prev) => ({
                        ...prev,
                        displayName: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.displayName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="John Doe"
                  />
                  {errors.displayName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.displayName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Administrator Role *
                </label>
                <select
                  value={adminFormData.role}
                  onChange={(e) =>
                    setAdminFormData((prev) => ({
                      ...prev,
                      role: e.target.value as "mda_admin" | "mda_super_admin",
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="mda_admin">MDA Administrator</option>
                  <option value="mda_super_admin">
                    MDA Super Administrator
                  </option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  MDA Administrator: Can create users and manage tenders. MDA
                  Super Administrator: Full permissions including settings
                  management.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Approval Amount (₦) *
                </label>
                <input
                  type="number"
                  value={adminFormData.permissions.maxApprovalAmount}
                  onChange={(e) =>
                    setAdminFormData((prev) => ({
                      ...prev,
                      permissions: {
                        ...prev.permissions,
                        maxApprovalAmount: Number(e.target.value),
                      },
                    }))
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.maxApprovalAmount
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="10000000"
                />
                {errors.maxApprovalAmount && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.maxApprovalAmount}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Administrator Permissions
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={adminFormData.permissions.canCreateUsers}
                      onChange={(e) =>
                        setAdminFormData((prev) => ({
                          ...prev,
                          permissions: {
                            ...prev.permissions,
                            canCreateUsers: e.target.checked,
                          },
                        }))
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Can create and manage users
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={adminFormData.permissions.canManageTenders}
                      onChange={(e) =>
                        setAdminFormData((prev) => ({
                          ...prev,
                          permissions: {
                            ...prev.permissions,
                            canManageTenders: e.target.checked,
                          },
                        }))
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Can manage tenders and procurement
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={adminFormData.permissions.canApproveContracts}
                      onChange={(e) =>
                        setAdminFormData((prev) => ({
                          ...prev,
                          permissions: {
                            ...prev.permissions,
                            canApproveContracts: e.target.checked,
                          },
                        }))
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Can approve contracts
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={adminFormData.permissions.canViewReports}
                      onChange={(e) =>
                        setAdminFormData((prev) => ({
                          ...prev,
                          permissions: {
                            ...prev.permissions,
                            canViewReports: e.target.checked,
                          },
                        }))
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Can view reports and analytics
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={adminFormData.permissions.canManageSettings}
                      onChange={(e) =>
                        setAdminFormData((prev) => ({
                          ...prev,
                          permissions: {
                            ...prev.permissions,
                            canManageSettings: e.target.checked,
                          },
                        }))
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Can manage MDA settings
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t border-gray-200">
            <div>
              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Back
                </button>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : currentStep === 1 ? (
                  <>
                    Next
                    <Plus className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create MDA & Administrator
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
