import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AddUserForm } from "./AddUserForm";
import {
  User,
  UserRole,
  Department,
  UserStatus,
  DEFAULT_ROLES,
  DEFAULT_DEPARTMENTS,
  generateUserId,
  hasPermission,
} from "@shared/userManagement";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  Download,
  RefreshCw,
  Building2,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";

interface UserManagementProps {
  ministryId: string;
  currentUserId: string;
  currentUser: User;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  ministryId,
  currentUserId,
  currentUser,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, [ministryId]);

  // Filter users when filters change
  useEffect(() => {
    applyFilters();
  }, [users, searchTerm, statusFilter, roleFilter, departmentFilter]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      // Load from localStorage first, then generate mock data if empty
      const storageKey = `ministry_users_${ministryId}`;
      const storedUsers = localStorage.getItem(storageKey);

      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        // Generate initial mock users
        const mockUsers = generateMockUsers();
        setUsers(mockUsers);
        localStorage.setItem(storageKey, JSON.stringify(mockUsers));
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUsers = (updatedUsers: User[]) => {
    const storageKey = `ministry_users_${ministryId}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  const generateMockUsers = (): User[] => {
    const mockUsers: User[] = [
      {
        user_id: "USR-ADMIN-001",
        name: "Dr. Amina Hassan",
        email: "amina.hassan@kanostate.gov.ng",
        username: "amina.hassan",
        role: DEFAULT_ROLES.find((r) => r.role_id === "ROLE_ADMIN")!,
        department: DEFAULT_DEPARTMENTS.find(
          (d) => d.department_id === "DEPT_ADMIN",
        )!,
        permissions: DEFAULT_ROLES.find((r) => r.role_id === "ROLE_ADMIN")!
          .default_permissions,
        status: "active",
        created_date: "2024-01-15T10:00:00Z",
        created_by: "SYSTEM",
        ministry_id: ministryId,
        phone: "+234 803 123 4567",
        employee_id: "EMP-001",
        last_login: "2024-02-15T09:30:00Z",
      },
      {
        user_id: "USR-PROC-001",
        name: "Mallam Ibrahim Kano",
        email: "ibrahim.kano@kanostate.gov.ng",
        username: "ibrahim.kano",
        role: DEFAULT_ROLES.find((r) => r.role_id === "ROLE_PROC_MANAGER")!,
        department: DEFAULT_DEPARTMENTS.find(
          (d) => d.department_id === "DEPT_PROCUREMENT",
        )!,
        permissions: DEFAULT_ROLES.find(
          (r) => r.role_id === "ROLE_PROC_MANAGER",
        )!.default_permissions,
        status: "active",
        created_date: "2024-01-16T11:00:00Z",
        created_by: "USR-ADMIN-001",
        ministry_id: ministryId,
        phone: "+234 805 987 6543",
        employee_id: "EMP-002",
        last_login: "2024-02-15T08:45:00Z",
      },
      {
        user_id: "USR-EVAL-001",
        name: "Engr. Fatima Aliyu",
        email: "fatima.aliyu@kanostate.gov.ng",
        username: "fatima.aliyu",
        role: DEFAULT_ROLES.find((r) => r.role_id === "ROLE_EVALUATOR")!,
        department: DEFAULT_DEPARTMENTS.find(
          (d) => d.department_id === "DEPT_TECHNICAL",
        )!,
        permissions: DEFAULT_ROLES.find((r) => r.role_id === "ROLE_EVALUATOR")!
          .default_permissions,
        status: "active",
        created_date: "2024-01-17T14:00:00Z",
        created_by: "USR-ADMIN-001",
        ministry_id: ministryId,
        phone: "+234 807 555 1234",
        employee_id: "EMP-003",
        last_login: "2024-02-14T16:20:00Z",
      },
      {
        user_id: "USR-FIN-001",
        name: "Malam Usman Bello",
        email: "usman.bello@kanostate.gov.ng",
        username: "usman.bello",
        role: DEFAULT_ROLES.find((r) => r.role_id === "ROLE_ACCOUNTANT")!,
        department: DEFAULT_DEPARTMENTS.find(
          (d) => d.department_id === "DEPT_FINANCE",
        )!,
        permissions: DEFAULT_ROLES.find((r) => r.role_id === "ROLE_ACCOUNTANT")!
          .default_permissions,
        status: "active",
        created_date: "2024-01-18T09:00:00Z",
        created_by: "USR-ADMIN-001",
        ministry_id: ministryId,
        phone: "+234 814 567 8901",
        employee_id: "EMP-004",
        last_login: "2024-02-15T07:15:00Z",
      },
      {
        user_id: "USR-LEGAL-001",
        name: "Barr. Zainab Ibrahim",
        email: "zainab.ibrahim@kanostate.gov.ng",
        username: "zainab.ibrahim",
        role: DEFAULT_ROLES.find((r) => r.role_id === "ROLE_LEGAL_ADVISOR")!,
        department: DEFAULT_DEPARTMENTS.find(
          (d) => d.department_id === "DEPT_LEGAL",
        )!,
        permissions: DEFAULT_ROLES.find(
          (r) => r.role_id === "ROLE_LEGAL_ADVISOR",
        )!.default_permissions,
        status: "active",
        created_date: "2024-01-19T10:30:00Z",
        created_by: "USR-ADMIN-001",
        ministry_id: ministryId,
        phone: "+234 809 234 5678",
        employee_id: "EMP-005",
        last_login: "2024-02-13T14:45:00Z",
      },
    ];

    return mockUsers;
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search) ||
          user.username.toLowerCase().includes(search) ||
          user.role.role_name.toLowerCase().includes(search) ||
          user.department.department_name.toLowerCase().includes(search),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role.role_id === roleFilter);
    }

    // Department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter(
        (user) => user.department.department_id === departmentFilter,
      );
    }

    setFilteredUsers(filtered);
  };

  const handleAddUser = async (newUser: User) => {
    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);

    // Log activity
    console.log(`User ${newUser.name} created by ${currentUser.name}`);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    // setShowEditForm(true); // Would implement edit form similar to add form
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    const updatedUsers = users.filter(
      (user) => user.user_id !== selectedUser.user_id,
    );
    saveUsers(updatedUsers);

    setShowDeleteDialog(false);
    setSelectedUser(null);

    // Log activity
    console.log(`User ${selectedUser.name} deleted by ${currentUser.name}`);
  };

  const handleStatusChange = async (user: User, newStatus: UserStatus) => {
    const updatedUsers = users.map((u) =>
      u.user_id === user.user_id ? { ...u, status: newStatus } : u,
    );
    saveUsers(updatedUsers);

    // Log activity
    console.log(
      `User ${user.name} status changed to ${newStatus} by ${currentUser.name}`,
    );
  };

  const getStatusConfig = (status: UserStatus) => {
    switch (status) {
      case "active":
        return { color: "bg-green-100 text-green-800", icon: CheckCircle };
      case "inactive":
        return { color: "bg-gray-100 text-gray-800", icon: X };
      case "suspended":
        return { color: "bg-red-100 text-red-800", icon: AlertTriangle };
      case "pending_approval":
        return { color: "bg-yellow-100 text-yellow-800", icon: Clock };
      default:
        return { color: "bg-gray-100 text-gray-800", icon: X };
    }
  };

  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin) return "Never";

    const date = new Date(lastLogin);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return "Today";
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const canManageUsers =
    hasPermission(currentUser, "user.create") ||
    hasPermission(currentUser, "user.edit");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            User Management
          </h1>
          <p className="text-gray-600">
            Manage ministry users, roles, and permissions
          </p>
        </div>
        {canManageUsers && (
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add New User
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.length}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Users
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter((u) => u.status === "active").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-purple-600">
                  {new Set(users.map((u) => u.department.department_id)).size}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Roles</p>
                <p className="text-2xl font-bold text-orange-600">
                  {new Set(users.map((u) => u.role.role_id)).size}
                </p>
              </div>
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative min-w-[300px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending_approval">Pending</SelectItem>
              </SelectContent>
            </Select>

            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {DEFAULT_ROLES.map((role) => (
                  <SelectItem key={role.role_id} value={role.role_id}>
                    {role.role_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Department Filter */}
            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {DEFAULT_DEPARTMENTS.map((dept) => (
                  <SelectItem
                    key={dept.department_id}
                    value={dept.department_id}
                  >
                    {dept.department_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={loadUsers}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
              Loading users...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const statusConfig = getStatusConfig(user.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <TableRow key={user.user_id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {user.role.role_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Level {user.role.hierarchy_level}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {user.department.department_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.department.department_code}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusConfig.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatLastLogin(user.last_login)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserDetails(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {canManageUsers && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleEditUser(user)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit User
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {user.status === "active" ? (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusChange(user, "inactive")
                                    }
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Deactivate
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusChange(user, "active")
                                    }
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Activate
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowDeleteDialog(true);
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete User
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add User Form */}
      <AddUserForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSave={handleAddUser}
        ministryId={ministryId}
        currentUserId={currentUserId}
      />

      {/* User Details Dialog */}
      {selectedUser && (
        <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Name
                  </Label>
                  <p className="text-sm">{selectedUser.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Employee ID
                  </Label>
                  <p className="text-sm">
                    {selectedUser.employee_id || "Not set"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Email
                  </Label>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Phone
                  </Label>
                  <p className="text-sm">{selectedUser.phone || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Role
                  </Label>
                  <p className="text-sm">{selectedUser.role.role_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Department
                  </Label>
                  <p className="text-sm">
                    {selectedUser.department.department_name}
                  </p>
                </div>
              </div>

              {/* Permissions */}
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Permissions ({selectedUser.permissions.length})
                </Label>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedUser.permissions.slice(0, 10).map((permission) => (
                    <Badge
                      key={permission.permission_id}
                      variant="outline"
                      className="text-xs"
                    >
                      {permission.permission_name}
                    </Badge>
                  ))}
                  {selectedUser.permissions.length > 10 && (
                    <Badge variant="outline" className="text-xs">
                      +{selectedUser.permissions.length - 10} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.name}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete User
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function Label({ className, children, ...props }: any) {
  return (
    <label
      className={`text-sm font-medium text-gray-700 ${className || ""}`}
      {...props}
    >
      {children}
    </label>
  );
}
