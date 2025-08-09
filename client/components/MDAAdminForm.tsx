import { useState } from "react";
import {
  X,
  Save,
  UserPlus,
  Building2,
  Mail,
  User,
  Shield,
  CheckCircle,
  AlertTriangle,
  DollarSign
} from "lucide-react";
import { MDA, CreateMDAAdminRequest, MDAPermissions } from '@shared/api';

interface MDAAdminFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMDAAdminRequest) => void;
  mdas: MDA[];
  selectedMDA?: MDA | null;
  mode: 'create' | 'edit';
  initialData?: any;
}

export default function MDAAdminForm({
  isOpen,
  onClose,
  onSubmit,
  mdas,
  selectedMDA,
  mode = 'create',
  initialData
}: MDAAdminFormProps) {
  const [formData, setFormData] = useState({
    mdaId: selectedMDA?.id || '',
    email: initialData?.email || '',
    displayName: initialData?.displayName || '',
    role: initialData?.role || 'mda_admin' as 'mda_admin' | 'mda_super_admin',
    permissions: initialData?.permissions || {
      canCreateUsers: false,
      canManageTenders: false,
      canApproveContracts: false,
      canViewReports: false,
      canManageSettings: false,
      maxApprovalAmount: 0
    } as MDAPermissions
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.mdaId) {
      newErrors.mdaId = 'Please select an MDA';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.displayName) {
      newErrors.displayName = 'Display name is required';
    }

    if (formData.permissions.maxApprovalAmount < 0) {
      newErrors.maxApprovalAmount = 'Maximum approval amount must be non-negative';
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
        mdaId: selectedMDA?.id || '',
        email: '',
        displayName: '',
        role: 'mda_admin',
        permissions: {
          canCreateUsers: false,
          canManageTenders: false,
          canApproveContracts: false,
          canViewReports: false,
          canManageSettings: false,
          maxApprovalAmount: 0
        }
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePermissionChange = (permission: keyof MDAPermissions, value: boolean | number) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value
      }
    }));
  };

  const getPresetPermissions = (role: 'mda_admin' | 'mda_super_admin') => {
    if (role === 'mda_super_admin') {
      return {
        canCreateUsers: true,
        canManageTenders: true,
        canApproveContracts: true,
        canViewReports: true,
        canManageSettings: true,
        maxApprovalAmount: 100000000 // 100M
      };
    } else {
      return {
        canCreateUsers: true,
        canManageTenders: true,
        canApproveContracts: false,
        canViewReports: true,
        canManageSettings: false,
        maxApprovalAmount: 25000000 // 25M
      };
    }
  };

  const handleRoleChange = (role: 'mda_admin' | 'mda_super_admin') => {
    setFormData(prev => ({
      ...prev,
      role,
      permissions: getPresetPermissions(role)
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
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <UserPlus className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {mode === 'create' ? 'Add New MDA Administrator' : 'Edit MDA Administrator'}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Configure admin access and permissions
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
                {/* MDA Selection */}
                <div>
                  <label htmlFor="mdaId" className="block text-sm font-medium text-gray-700 mb-2">
                    Ministry/Department/Agency *
                  </label>
                  <select
                    id="mdaId"
                    value={formData.mdaId}
                    onChange={(e) => setFormData(prev => ({ ...prev, mdaId: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.mdaId ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={!!selectedMDA}
                  >
                    <option value="">Select MDA</option>
                    {mdas.map((mda) => (
                      <option key={mda.id} value={mda.id}>
                        {mda.name} ({mda.type})
                      </option>
                    ))}
                  </select>
                  {errors.mdaId && (
                    <p className="mt-1 text-sm text-red-600">{errors.mdaId}</p>
                  )}
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="admin@ministry.kano.gov.ng"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        id="displayName"
                        value={formData.displayName}
                        onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          errors.displayName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Dr. Amina Kano"
                      />
                    </div>
                    {errors.displayName && (
                      <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>
                    )}
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Administrator Role *
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="role"
                        value="mda_admin"
                        checked={formData.role === 'mda_admin'}
                        onChange={() => handleRoleChange('mda_admin')}
                        className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-gray-900">MDA Administrator</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Can manage users, create tenders, and view reports. Limited approval authority.
                        </p>
                        <div className="text-xs text-blue-600 mt-1">
                          Max Approval: ₦25M • Can create users • Cannot manage settings
                        </div>
                      </div>
                    </label>

                    <label className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="role"
                        value="mda_super_admin"
                        checked={formData.role === 'mda_super_admin'}
                        onChange={() => handleRoleChange('mda_super_admin')}
                        className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-purple-600" />
                          <span className="font-medium text-gray-900">MDA Super Administrator</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Full administrative access including settings management and high-value approvals.
                        </p>
                        <div className="text-xs text-purple-600 mt-1">
                          Max Approval: ₦100M • Full permissions • Can manage all settings
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Permissions & Access Control
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.permissions.canCreateUsers}
                          onChange={(e) => handlePermissionChange('canCreateUsers', e.target.checked)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Create and manage users</span>
                      </label>

                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.permissions.canManageTenders}
                          onChange={(e) => handlePermissionChange('canManageTenders', e.target.checked)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Create and manage tenders</span>
                      </label>

                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.permissions.canApproveContracts}
                          onChange={(e) => handlePermissionChange('canApproveContracts', e.target.checked)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Approve contracts</span>
                      </label>

                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.permissions.canViewReports}
                          onChange={(e) => handlePermissionChange('canViewReports', e.target.checked)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">View reports and analytics</span>
                      </label>

                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.permissions.canManageSettings}
                          onChange={(e) => handlePermissionChange('canManageSettings', e.target.checked)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Manage MDA settings</span>
                      </label>
                    </div>

                    <div>
                      <label htmlFor="maxApprovalAmount" className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Approval Amount (₦)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          id="maxApprovalAmount"
                          value={formData.permissions.maxApprovalAmount}
                          onChange={(e) => handlePermissionChange('maxApprovalAmount', parseInt(e.target.value) || 0)}
                          className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                            errors.maxApprovalAmount ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="0"
                        />
                      </div>
                      {errors.maxApprovalAmount && (
                        <p className="mt-1 text-sm text-red-600">{errors.maxApprovalAmount}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Maximum amount this admin can approve without higher authorization
                      </p>
                    </div>
                  </div>
                </div>

                {/* Warning for Super Admin */}
                {formData.role === 'mda_super_admin' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">Super Administrator Access</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Super administrators have full access to all MDA functions including sensitive settings 
                          and high-value approvals. Only assign this role to trusted personnel.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {mode === 'create' ? 'Creating...' : 'Updating...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {mode === 'create' ? 'Create Administrator' : 'Update Administrator'}
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
