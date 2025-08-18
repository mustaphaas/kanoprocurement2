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
import { CreateMDAUserRequest, MDAUserPermissions } from "@shared/api";

interface MinistryUserFormProps {
  mode: "create" | "edit";
  mdaId: string;
  onSubmit: (data: CreateMDAUserRequest) => void;
  onCancel: () => void;
  initialData?: {
    email: string;
    displayName: string;
    role: "procurement_officer" | "evaluator" | "accountant" | "viewer";
    department: string;
    permissions: MDAUserPermissions;
  };
}

export default function MinistryUserForm({
  mode = "create",
  mdaId,
  onSubmit,
  onCancel,
  initialData,
}: MinistryUserFormProps) {
  const [formData, setFormData] = useState({
    mdaId: mdaId,
    email: initialData?.email || "",
    displayName: initialData?.displayName || "",
    role: initialData?.role || ("procurement_officer" as
      | "procurement_officer"
      | "evaluator"
      | "accountant"
      | "viewer"),
    department: initialData?.department || "",
    permissions: initialData?.permissions || ({
      canCreateTenders: true,
      canEvaluateBids: true,
      canViewFinancials: false,
      canGenerateReports: true,
      accessLevel: "write",
    } as MDAUserPermissions),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleDescriptions = {
    procurement_officer: "Can create tenders, manage procurement processes, and evaluate bids",
    evaluator: "Can evaluate bids and provide technical assessments",
    accountant: "Can view financials, generate reports, and track budget allocations",
    viewer: "Read-only access to view tenders and reports",
  };

  const departmentOptions = [
    "Procurement Department",
    "Finance Department",
    "Technical Department",
    "Legal Department",
    "Planning Department",
    "Quality Assurance",
    "Project Management",
    "Contract Administration",
    "Audit Department",
    "Information Technology",
    "Human Resources",
    "General Administration",
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.displayName.trim()) {
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
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting user form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updatePermissions = (field: keyof MDAUserPermissions, value: boolean | string) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [field]: value,
      },
    }));
  };

  // Auto-update permissions based on role
  const handleRoleChange = (newRole: typeof formData.role) => {
    let defaultPermissions: MDAUserPermissions;

    switch (newRole) {
      case "procurement_officer":
        defaultPermissions = {
          canCreateTenders: true,
          canEvaluateBids: true,
          canViewFinancials: true,
          canGenerateReports: true,
          accessLevel: "write",
        };
        break;
      case "evaluator":
        defaultPermissions = {
          canCreateTenders: false,
          canEvaluateBids: true,
          canViewFinancials: false,
          canGenerateReports: true,
          accessLevel: "read",
        };
        break;
      case "accountant":
        defaultPermissions = {
          canCreateTenders: false,
          canEvaluateBids: false,
          canViewFinancials: true,
          canGenerateReports: true,
          accessLevel: "read",
        };
        break;
      case "viewer":
        defaultPermissions = {
          canCreateTenders: false,
          canEvaluateBids: false,
          canViewFinancials: false,
          canGenerateReports: true,
          accessLevel: "read",
        };
        break;
      default:
        return;
    }

    setFormData(prev => ({
      ...prev,
      role: newRole,
      permissions: defaultPermissions,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {mode === "create" ? "Add New User" : "Edit User"}
            </h2>
            <p className="text-sm text-gray-600">
              {mode === "create" 
                ? "Create a new user account for this ministry"
                : "Update user information and permissions"
              }
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="user@ministry.gov.ng"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.displayName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="John Doe"
            />
            {errors.displayName && (
              <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>
            )}
          </div>
        </div>

        {/* Role and Department */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role *
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleRoleChange(e.target.value as typeof formData.role)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="procurement_officer">Procurement Officer</option>
              <option value="evaluator">Evaluator</option>
              <option value="accountant">Accountant</option>
              <option value="viewer">Viewer</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {roleDescriptions[formData.role]}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department *
            </label>
            <select
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.department ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Department</option>
              {departmentOptions.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            {errors.department && (
              <p className="mt-1 text-sm text-red-600">{errors.department}</p>
            )}
          </div>
        </div>

        {/* Permissions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            User Permissions
          </label>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.permissions.canCreateTenders}
                  onChange={(e) => updatePermissions("canCreateTenders", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-700">Create Tenders</span>
                  <p className="text-xs text-gray-500">Can create and publish new tenders</p>
                </div>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.permissions.canEvaluateBids}
                  onChange={(e) => updatePermissions("canEvaluateBids", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-700">Evaluate Bids</span>
                  <p className="text-xs text-gray-500">Can review and score bid submissions</p>
                </div>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.permissions.canViewFinancials}
                  onChange={(e) => updatePermissions("canViewFinancials", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-700">View Financials</span>
                  <p className="text-xs text-gray-500">Can access budget and financial data</p>
                </div>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.permissions.canGenerateReports}
                  onChange={(e) => updatePermissions("canGenerateReports", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-700">Generate Reports</span>
                  <p className="text-xs text-gray-500">Can create and export reports</p>
                </div>
              </label>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Level
              </label>
              <select
                value={formData.permissions.accessLevel}
                onChange={(e) => updatePermissions("accessLevel", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="read">Read Only</option>
                <option value="write">Read & Write</option>
                <option value="admin">Administrative</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
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
                {mode === "create" ? "Creating..." : "Updating..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {mode === "create" ? "Create User" : "Update User"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
