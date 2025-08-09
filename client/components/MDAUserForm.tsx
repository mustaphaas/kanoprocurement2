import { useState } from "react";
import {
  X,
  Save,
  UserPlus,
  Mail,
  User,
  Building2,
  Shield,
  CheckCircle,
  AlertTriangle,
  Eye,
  FileText,
  BarChart3,
  Settings,
} from "lucide-react";
import { MDA, CreateMDAUserRequest, MDAUserPermissions } from "@shared/api";

interface MDAUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMDAUserRequest) => void;
  mda: MDA;
  mode: "create" | "edit";
  initialData?: any;
}

export default function MDAUserForm({
  isOpen,
  onClose,
  onSubmit,
  mda,
  mode = "create",
  initialData,
}: MDAUserFormProps) {
  const [formData, setFormData] = useState({
    mdaId: mda.id,
    email: initialData?.email || "",
    displayName: initialData?.displayName || "",
    role:
      initialData?.role ||
      ("procurement_officer" as
        | "procurement_officer"
        | "evaluator"
        | "accountant"
        | "viewer"),
    department: initialData?.department || "",
    permissions:
      initialData?.permissions ||
      ({
        canCreateTenders: false,
        canEvaluateBids: false,
        canViewFinancials: false,
        canGenerateReports: false,
        accessLevel: "read",
      } as MDAUserPermissions),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userRoles = [
    {
      id: "procurement_officer",
      name: "Procurement Officer",
      description: "Can create and manage procurement tenders",
      icon: <FileText className="h-5 w-5" />,
      defaultPermissions: {
        canCreateTenders: true,
        canEvaluateBids: true,
        canViewFinancials: true,
        canGenerateReports: true,
        accessLevel: "write" as const,
      },
    },
    {
      id: "evaluator",
      name: "Evaluator",
      description: "Evaluates bids and provides technical assessments",
      icon: <CheckCircle className="h-5 w-5" />,
      defaultPermissions: {
        canCreateTenders: false,
        canEvaluateBids: true,
        canViewFinancials: false,
        canGenerateReports: true,
        accessLevel: "read" as const,
      },
    },
    {
      id: "accountant",
      name: "Accountant",
      description: "Handles financial aspects and budget management",
      icon: <BarChart3 className="h-5 w-5" />,
      defaultPermissions: {
        canCreateTenders: false,
        canEvaluateBids: false,
        canViewFinancials: true,
        canGenerateReports: true,
        accessLevel: "read" as const,
      },
    },
    {
      id: "viewer",
      name: "Viewer",
      description: "Read-only access for monitoring and reporting",
      icon: <Eye className="h-5 w-5" />,
      defaultPermissions: {
        canCreateTenders: false,
        canEvaluateBids: false,
        canViewFinancials: false,
        canGenerateReports: true,
        accessLevel: "read" as const,
      },
    },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.displayName) {
      newErrors.displayName = "Display name is required";
    }

    if (!formData.department) {
      newErrors.department = "Department is required";
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
      await onSubmit(formData);
      onClose();
      // Reset form
      setFormData({
        mdaId: mda.id,
        email: "",
        displayName: "",
        role: "procurement_officer",
        department: "",
        permissions: {
          canCreateTenders: false,
          canEvaluateBids: false,
          canViewFinancials: false,
          canGenerateReports: false,
          accessLevel: "read",
        },
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = (roleId: string) => {
    const role = userRoles.find((r) => r.id === roleId);
    if (role) {
      setFormData((prev) => ({
        ...prev,
        role: roleId as any,
        permissions: role.defaultPermissions,
      }));
    }
  };

  const handlePermissionChange = (
    permission: keyof MDAUserPermissions,
    value: boolean | string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value,
      },
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-start justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <UserPlus className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {mode === "create" ? "Add New User" : "Edit User"}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Add user to {mda.name}
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

              <div className="space-y-6">
                {/* MDA Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">{mda.name}</p>
                      <p className="text-sm text-gray-600">
                        {mda.type.charAt(0).toUpperCase() + mda.type.slice(1)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.email ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="user@ministry.kano.gov.ng"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="displayName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        id="displayName"
                        value={formData.displayName}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            displayName: e.target.value,
                          }))
                        }
                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.displayName
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        placeholder="Hajiya Khadija Ahmed"
                      />
                    </div>
                    {errors.displayName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.displayName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label
                    htmlFor="department"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Department *
                  </label>
                  <input
                    type="text"
                    id="department"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        department: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.department ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="e.g., Procurement Department, Finance, Technical Evaluation"
                  />
                  {errors.department && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.department}
                    </p>
                  )}
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    User Role *
                  </label>
                  <div className="space-y-3">
                    {userRoles.map((role) => (
                      <label
                        key={role.id}
                        className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          name="role"
                          value={role.id}
                          checked={formData.role === role.id}
                          onChange={() => handleRoleChange(role.id)}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            {role.icon}
                            <span className="font-medium text-gray-900">
                              {role.name}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {role.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {role.defaultPermissions.canCreateTenders && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Create Tenders
                              </span>
                            )}
                            {role.defaultPermissions.canEvaluateBids && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                Evaluate Bids
                              </span>
                            )}
                            {role.defaultPermissions.canViewFinancials && (
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                View Financials
                              </span>
                            )}
                            {role.defaultPermissions.canGenerateReports && (
                              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                Generate Reports
                              </span>
                            )}
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                role.defaultPermissions.accessLevel === "write"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {role.defaultPermissions.accessLevel === "write"
                                ? "Write Access"
                                : "Read Only"}
                            </span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Custom Permissions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Custom Permissions
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.permissions.canCreateTenders}
                          onChange={(e) =>
                            handlePermissionChange(
                              "canCreateTenders",
                              e.target.checked,
                            )
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          Create and manage tenders
                        </span>
                      </label>

                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.permissions.canEvaluateBids}
                          onChange={(e) =>
                            handlePermissionChange(
                              "canEvaluateBids",
                              e.target.checked,
                            )
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          Evaluate bids and proposals
                        </span>
                      </label>

                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.permissions.canViewFinancials}
                          onChange={(e) =>
                            handlePermissionChange(
                              "canViewFinancials",
                              e.target.checked,
                            )
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          View financial information
                        </span>
                      </label>

                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.permissions.canGenerateReports}
                          onChange={(e) =>
                            handlePermissionChange(
                              "canGenerateReports",
                              e.target.checked,
                            )
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          Generate reports
                        </span>
                      </label>
                    </div>

                    <div>
                      <label
                        htmlFor="accessLevel"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Access Level
                      </label>
                      <select
                        id="accessLevel"
                        value={formData.permissions.accessLevel}
                        onChange={(e) =>
                          handlePermissionChange("accessLevel", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="read">Read Only</option>
                        <option value="write">Read & Write</option>
                        <option value="admin">Administrative</option>
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        Determines the overall access level for this user
                      </p>
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">
                        Security Notice
                      </h4>
                      <p className="text-sm text-blue-700 mt-1">
                        A temporary password will be generated and sent to the
                        user's email address. They will be required to change it
                        on first login. All user activities will be logged for
                        audit purposes.
                      </p>
                    </div>
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
                    {mode === "create" ? "Create User" : "Update User"}
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
