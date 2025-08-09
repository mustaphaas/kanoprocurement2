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
} from "lucide-react";
import { CreateMDARequest, MDASettings } from "@shared/api";

interface MDAFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMDARequest) => void;
  mode: "create" | "edit";
  initialData?: any;
  parentMDAs?: Array<{ id: string; name: string; type: string }>;
}

export default function MDAForm({
  isOpen,
  onClose,
  onSubmit,
  mode = "create",
  initialData,
  parentMDAs = [],
}: MDAFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    type:
      initialData?.type || ("ministry" as "ministry" | "department" | "agency"),
    description: initialData?.description || "",
    parentMDA: initialData?.parentMDA || "",
    contactEmail: initialData?.contactEmail || "",
    contactPhone: initialData?.contactPhone || "",
    address: initialData?.address || "",
    headOfMDA: initialData?.headOfMDA || "",
    settings:
      initialData?.settings ||
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "MDA name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.contactEmail) {
      newErrors.contactEmail = "Contact email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = "Please enter a valid email address";
    }

    if (!formData.contactPhone) {
      newErrors.contactPhone = "Contact phone is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.headOfMDA.trim()) {
      newErrors.headOfMDA = "Head of MDA is required";
    }

    if (formData.settings.totalBudget <= 0) {
      newErrors.totalBudget = "Total budget must be greater than 0";
    }

    if (formData.settings.procurementThresholds.level1 <= 0) {
      newErrors.level1 = "Level 1 threshold must be greater than 0";
    }

    if (
      formData.settings.procurementThresholds.level2 <=
      formData.settings.procurementThresholds.level1
    ) {
      newErrors.level2 = "Level 2 threshold must be greater than Level 1";
    }

    if (
      formData.settings.procurementThresholds.level3 <=
      formData.settings.procurementThresholds.level2
    ) {
      newErrors.level3 = "Level 3 threshold must be greater than Level 2";
    }

    if (
      formData.settings.allowedCategories.length === 0 ||
      (formData.settings.allowedCategories.length === 1 &&
        !formData.settings.allowedCategories[0])
    ) {
      newErrors.allowedCategories =
        "At least one procurement category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Filter out empty categories
      const cleanedData = {
        ...formData,
        settings: {
          ...formData.settings,
          allowedCategories: formData.settings.allowedCategories.filter(
            (cat) => cat.trim() !== "",
          ),
        },
      };

      await onSubmit(cleanedData);
      onClose();

      // Reset form
      setFormData({
        name: "",
        type: "ministry",
        description: "",
        parentMDA: "",
        contactEmail: "",
        contactPhone: "",
        address: "",
        headOfMDA: "",
        settings: {
          procurementThresholds: {
            level1: 5000000,
            level2: 25000000,
            level3: 100000000,
          },
          allowedCategories: [""],
          customWorkflows: false,
          budgetYear: new Date().getFullYear().toString(),
          totalBudget: 0,
        },
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCategory = () => {
    setFormData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        allowedCategories: [...prev.settings.allowedCategories, ""],
      },
    }));
  };

  const removeCategory = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        allowedCategories: prev.settings.allowedCategories.filter(
          (_, i) => i !== index,
        ),
      },
    }));
  };

  const updateCategory = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        allowedCategories: prev.settings.allowedCategories.map((cat, i) =>
          i === index ? value : cat,
        ),
      },
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ministry":
        return <Building className="h-5 w-5" />;
      case "department":
        return <Building2 className="h-5 w-5" />;
      case "agency":
        return <Briefcase className="h-5 w-5" />;
      default:
        return <Building2 className="h-5 w-5" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-start justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    {getTypeIcon(formData.type)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {mode === "create" ? "Create New MDA" : "Edit MDA"}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Configure the Ministry, Department, or Agency settings
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-8">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        MDA Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.name ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="e.g., Ministry of Health"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="type"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Type *
                      </label>
                      <select
                        id="type"
                        value={formData.type}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            type: e.target.value as any,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="ministry">Ministry</option>
                        <option value="department">Department</option>
                        <option value="agency">Agency</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="parentMDA"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Parent MDA
                      </label>
                      <select
                        id="parentMDA"
                        value={formData.parentMDA}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            parentMDA: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">None (Top Level)</option>
                        {parentMDAs.map((mda) => (
                          <option key={mda.id} value={mda.id}>
                            {mda.name} ({mda.type})
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        For departments that belong to a ministry
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Description *
                      </label>
                      <textarea
                        id="description"
                        rows={3}
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.description
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        placeholder="Describe the mandate and responsibilities of this MDA"
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="contactEmail"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Contact Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="email"
                          id="contactEmail"
                          value={formData.contactEmail}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              contactEmail: e.target.value,
                            }))
                          }
                          className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.contactEmail
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder="info@ministry.kano.gov.ng"
                        />
                      </div>
                      {errors.contactEmail && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.contactEmail}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="contactPhone"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Contact Phone *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="tel"
                          id="contactPhone"
                          value={formData.contactPhone}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              contactPhone: e.target.value,
                            }))
                          }
                          className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.contactPhone
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder="+234 64 123 4567"
                        />
                      </div>
                      {errors.contactPhone && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.contactPhone}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Address *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <textarea
                          id="address"
                          rows={2}
                          value={formData.address}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              address: e.target.value,
                            }))
                          }
                          className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.address
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder="Ministry Complex, Government House, Kano"
                        />
                      </div>
                      {errors.address && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.address}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="headOfMDA"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Head of MDA *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          id="headOfMDA"
                          value={formData.headOfMDA}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              headOfMDA: e.target.value,
                            }))
                          }
                          className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.headOfMDA
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder="Dr. Amina Kano"
                        />
                      </div>
                      {errors.headOfMDA && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.headOfMDA}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Budget Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Budget Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="budgetYear"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Budget Year *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          id="budgetYear"
                          value={formData.settings.budgetYear}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              settings: {
                                ...prev.settings,
                                budgetYear: e.target.value,
                              },
                            }))
                          }
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="2024"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="totalBudget"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Total Budget (₦) *
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          id="totalBudget"
                          value={formData.settings.totalBudget}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              settings: {
                                ...prev.settings,
                                totalBudget: parseInt(e.target.value) || 0,
                              },
                            }))
                          }
                          className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.totalBudget
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder="5000000000"
                        />
                      </div>
                      {errors.totalBudget && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.totalBudget}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Procurement Thresholds */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Procurement Approval Thresholds
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="level1"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Level 1 - MDA Head (₦) *
                      </label>
                      <input
                        type="number"
                        id="level1"
                        value={formData.settings.procurementThresholds.level1}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            settings: {
                              ...prev.settings,
                              procurementThresholds: {
                                ...prev.settings.procurementThresholds,
                                level1: parseInt(e.target.value) || 0,
                              },
                            },
                          }))
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.level1 ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="5000000"
                      />
                      {errors.level1 && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.level1}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="level2"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Level 2 - Higher Approval (₦) *
                      </label>
                      <input
                        type="number"
                        id="level2"
                        value={formData.settings.procurementThresholds.level2}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            settings: {
                              ...prev.settings,
                              procurementThresholds: {
                                ...prev.settings.procurementThresholds,
                                level2: parseInt(e.target.value) || 0,
                              },
                            },
                          }))
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.level2 ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="25000000"
                      />
                      {errors.level2 && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.level2}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="level3"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Level 3 - Tender Board (₦) *
                      </label>
                      <input
                        type="number"
                        id="level3"
                        value={formData.settings.procurementThresholds.level3}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            settings: {
                              ...prev.settings,
                              procurementThresholds: {
                                ...prev.settings.procurementThresholds,
                                level3: parseInt(e.target.value) || 0,
                              },
                            },
                          }))
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.level3 ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="100000000"
                      />
                      {errors.level3 && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.level3}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Allowed Categories */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Allowed Procurement Categories
                  </h3>
                  <div className="space-y-3">
                    {formData.settings.allowedCategories.map(
                      (category, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3"
                        >
                          <select
                            value={category}
                            onChange={(e) =>
                              updateCategory(index, e.target.value)
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select a category</option>
                            {procurementCategories.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                          {formData.settings.allowedCategories.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeCategory(index)}
                              className="p-2 text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ),
                    )}
                    <button
                      type="button"
                      onClick={addCategory}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Category</span>
                    </button>
                    {errors.allowedCategories && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.allowedCategories}
                      </p>
                    )}
                  </div>
                </div>

                {/* Additional Settings */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Additional Settings
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.settings.customWorkflows}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            settings: {
                              ...prev.settings,
                              customWorkflows: e.target.checked,
                            },
                          }))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">
                        Enable custom procurement workflows
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {mode === "create" ? "Creating..." : "Updating..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {mode === "create" ? "Create MDA" : "Update MDA"}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
