import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  User,
  UserRole,
  Department,
  Permission,
  UserStatus,
  DEFAULT_ROLES,
  DEFAULT_DEPARTMENTS,
  DEFAULT_PERMISSIONS,
  generateUserId,
} from "@shared/userManagement";
import {
  UserPlus,
  Mail,
  Phone,
  Building2,
  Shield,
  Settings,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Save,
  X,
} from "lucide-react";

interface AddUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  ministryId: string;
  currentUserId: string;
}

interface FormData {
  name: string;
  email: string;
  username: string;
  phone: string;
  employee_id: string;
  role_id: string;
  department_id: string;
  custom_permissions: string[];
  status: UserStatus;
  notes: string;
}

interface FormErrors {
  [key: string]: string;
}

export const AddUserForm: React.FC<AddUserFormProps> = ({
  isOpen,
  onClose,
  onSave,
  ministryId,
  currentUserId,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    username: "",
    phone: "",
    employee_id: "",
    role_id: "",
    department_id: "",
    custom_permissions: [],
    status: "active",
    notes: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPermissions, setShowPermissions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedRole = DEFAULT_ROLES.find(role => role.role_id === formData.role_id);
  const selectedDepartment = DEFAULT_DEPARTMENTS.find(dept => dept.department_id === formData.department_id);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required field validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.role_id) {
      newErrors.role_id = "Role is required";
    }

    if (!formData.department_id) {
      newErrors.department_id = "Department is required";
    }

    if (formData.phone && !/^[+]?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      custom_permissions: prev.custom_permissions.includes(permissionId)
        ? prev.custom_permissions.filter(id => id !== permissionId)
        : [...prev.custom_permissions, permissionId]
    }));
  };

  const getAllUserPermissions = (): Permission[] => {
    const rolePermissions = selectedRole?.default_permissions || [];
    const customPermissionIds = formData.custom_permissions;
    const customPermissions = DEFAULT_PERMISSIONS.filter(p => 
      customPermissionIds.includes(p.permission_id) && 
      !rolePermissions.some(rp => rp.permission_id === p.permission_id)
    );
    
    return [...rolePermissions, ...customPermissions];
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const allPermissions = getAllUserPermissions();
      
      const newUser: User = {
        user_id: generateUserId(),
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        username: formData.username.trim().toLowerCase(),
        role: selectedRole!,
        department: selectedDepartment!,
        permissions: allPermissions,
        status: formData.status,
        created_date: new Date().toISOString(),
        created_by: currentUserId,
        ministry_id: ministryId,
        phone: formData.phone.trim() || undefined,
        employee_id: formData.employee_id.trim() || undefined,
      };

      await onSave(newUser);
      handleClose();
    } catch (error) {
      console.error("Error creating user:", error);
      setErrors({ submit: "Failed to create user. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      email: "",
      username: "",
      phone: "",
      employee_id: "",
      role_id: "",
      department_id: "",
      custom_permissions: [],
      status: "active",
      notes: "",
    });
    setErrors({});
    setShowPermissions(false);
    onClose();
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const groupPermissionsByCategory = (permissions: Permission[]) => {
    return permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  };

  const categoryNames = {
    tender_management: "Tender Management",
    evaluation: "Bid Evaluation",
    financial: "Financial Management",
    reporting: "Reports & Analytics",
    user_management: "User Management",
    contract_management: "Contract Management",
    noc_management: "NOC Management",
    audit_compliance: "Audit & Compliance",
    system_admin: "System Administration",
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Add New User
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employee_id">Employee ID</Label>
                  <Input
                    id="employee_id"
                    placeholder="Enter employee ID"
                    value={formData.employee_id}
                    onChange={(e) => handleInputChange("employee_id", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className={errors.username ? "border-red-500" : ""}
                  />
                  {errors.username && (
                    <p className="text-sm text-red-600">{errors.username}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      placeholder="Enter phone number"
                      className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: UserStatus) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Active
                        </div>
                      </SelectItem>
                      <SelectItem value="inactive">
                        <div className="flex items-center gap-2">
                          <X className="h-4 w-4 text-gray-600" />
                          Inactive
                        </div>
                      </SelectItem>
                      <SelectItem value="pending_approval">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                          Pending Approval
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role and Department */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Role & Department Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select value={formData.role_id} onValueChange={(value) => handleInputChange("role_id", value)}>
                    <SelectTrigger className={errors.role_id ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select user role" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEFAULT_ROLES.map((role) => (
                        <SelectItem key={role.role_id} value={role.role_id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{role.role_name}</span>
                            <span className="text-xs text-gray-500">{role.role_description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role_id && (
                    <p className="text-sm text-red-600">{errors.role_id}</p>
                  )}
                  {selectedRole && (
                    <div className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                      <strong>Hierarchy Level:</strong> {selectedRole.hierarchy_level} | 
                      <strong> Default Permissions:</strong> {selectedRole.default_permissions.length}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select value={formData.department_id} onValueChange={(value) => handleInputChange("department_id", value)}>
                    <SelectTrigger className={errors.department_id ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEFAULT_DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept.department_id} value={dept.department_id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{dept.department_name}</span>
                            <span className="text-xs text-gray-500">{dept.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.department_id && (
                    <p className="text-sm text-red-600">{errors.department_id}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Permissions Management
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPermissions(!showPermissions)}
                  className="ml-auto"
                >
                  {showPermissions ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showPermissions ? "Hide" : "Show"} Permissions
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Role-based permissions summary */}
              {selectedRole && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Default Role Permissions ({selectedRole.default_permissions.length})
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedRole.default_permissions.slice(0, 6).map((permission) => (
                      <Badge key={permission.permission_id} variant="outline" className="text-xs">
                        {permission.permission_name}
                      </Badge>
                    ))}
                    {selectedRole.default_permissions.length > 6 && (
                      <Badge variant="outline" className="text-xs">
                        +{selectedRole.default_permissions.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Custom permissions */}
              {showPermissions && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Additional Custom Permissions</h4>
                    <span className="text-sm text-gray-600">
                      Total: {getAllUserPermissions().length} permissions
                    </span>
                  </div>
                  
                  {Object.entries(groupPermissionsByCategory(DEFAULT_PERMISSIONS)).map(([category, permissions]) => (
                    <div key={category} className="space-y-2">
                      <h5 className="font-medium text-sm text-gray-700">
                        {categoryNames[category as keyof typeof categoryNames] || category}
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {permissions.map((permission) => {
                          const isRolePermission = selectedRole?.default_permissions.some(
                            rp => rp.permission_id === permission.permission_id
                          );
                          const isCustomSelected = formData.custom_permissions.includes(permission.permission_id);
                          
                          return (
                            <div
                              key={permission.permission_id}
                              className={`flex items-start space-x-2 p-2 rounded border ${
                                isRolePermission
                                  ? "bg-blue-50 border-blue-200"
                                  : isCustomSelected
                                    ? "bg-green-50 border-green-200"
                                    : "bg-gray-50 border-gray-200"
                              }`}
                            >
                              <Checkbox
                                id={permission.permission_id}
                                checked={isRolePermission || isCustomSelected}
                                disabled={isRolePermission}
                                onCheckedChange={() => !isRolePermission && handlePermissionToggle(permission.permission_id)}
                                className="mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <Label
                                    htmlFor={permission.permission_id}
                                    className="text-sm font-medium cursor-pointer"
                                  >
                                    {permission.permission_name}
                                  </Label>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${getRiskLevelColor(permission.risk_level)}`}
                                  >
                                    {permission.risk_level}
                                  </Badge>
                                  {isRolePermission && (
                                    <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                                      Role Default
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                  {permission.description}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Additional Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes about this user..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {errors.submit && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
            {errors.submit}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating User...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Create User
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
