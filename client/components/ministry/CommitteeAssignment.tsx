import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/dropdown-menu";
import {
  User,
  Committee,
  CommitteeMember,
  CommitteeType,
  CommitteeRole,
  COIDeclaration,
  COIStatus,
  getUsersByRole,
  getUsersByDepartment,
  canUserJoinCommittee,
  generateCommitteeId,
  generateCOIId,
} from "@shared/userManagement";
import {
  Users,
  UserPlus,
  Search,
  Shield,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Filter,
  Building2,
  Award,
  FileText,
  DollarSign,
  Scale,
  Gavel,
  Crown,
  UserCheck,
  Clock,
  X,
} from "lucide-react";

interface CommitteeAssignmentProps {
  ministryId: string;
  currentUserId: string;
  users: User[];
  tenders?: any[]; // From tender management
  onCommitteeUpdate?: (committee: Committee) => void;
}

export const CommitteeAssignment: React.FC<CommitteeAssignmentProps> = ({
  ministryId,
  currentUserId,
  users,
  tenders = [],
  onCommitteeUpdate,
}) => {
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [coiDeclarations, setCOIDeclarations] = useState<COIDeclaration[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showCOIForm, setShowCOIForm] = useState(false);
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(
    null,
  );
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [committeeTypeFilter, setCommitteeTypeFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  const [createFormData, setCreateFormData] = useState({
    name: "",
    type: "" as CommitteeType,
    tender_id: "none",
  });

  const [assignFormData, setAssignFormData] = useState({
    user_id: "",
    role: "" as CommitteeRole,
    has_coi: false,
    coi_details: "",
  });

  const [coiFormData, setCOIFormData] = useState({
    has_conflict: false,
    conflict_type: "",
    conflict_details: "",
    relationship_type: "",
    company_name: "",
    financial_interest: "",
  });

  useEffect(() => {
    loadCommittees();
    loadCOIDeclarations();
  }, [ministryId]);

  const loadCommittees = () => {
    setIsLoading(true);
    try {
      const storageKey = `ministry_committees_${ministryId}`;
      const stored = localStorage.getItem(storageKey);

      if (stored) {
        setCommittees(JSON.parse(stored));
      } else {
        // Generate sample committees
        const sampleCommittees = generateSampleCommittees();
        setCommittees(sampleCommittees);
        localStorage.setItem(storageKey, JSON.stringify(sampleCommittees));
      }
    } catch (error) {
      console.error("Error loading committees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCOIDeclarations = () => {
    try {
      const storageKey = `ministry_coi_${ministryId}`;
      const stored = localStorage.getItem(storageKey);

      if (stored) {
        setCOIDeclarations(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading COI declarations:", error);
    }
  };

  const saveCommittees = (updatedCommittees: Committee[]) => {
    const storageKey = `ministry_committees_${ministryId}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedCommittees));
    setCommittees(updatedCommittees);
  };

  const saveCOIDeclarations = (updatedCOI: COIDeclaration[]) => {
    const storageKey = `ministry_coi_${ministryId}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedCOI));
    setCOIDeclarations(updatedCOI);
  };

  const generateSampleCommittees = (): Committee[] => {
    return [
      {
        committee_id: generateCommitteeId(),
        committee_name: "Medical Equipment Evaluation Committee",
        committee_type: "technical_evaluation",
        members: [
          {
            user_id:
              users.find((u) => u.role.role_name.includes("Evaluator"))
                ?.user_id || "",
            committee_role: "chair",
            assigned_date: new Date().toISOString(),
            assigned_by: currentUserId,
            status: "active",
            coi_status: "declared_no_conflict",
          },
        ],
        created_date: new Date().toISOString(),
        status: "active",
        tender_id: tenders[0]?.id,
        ministry_id: ministryId,
      },
    ];
  };

  const handleCreateCommittee = async () => {
    if (!createFormData.name || !createFormData.type) return;

    const newCommittee: Committee = {
      committee_id: generateCommitteeId(),
      committee_name: createFormData.name,
      committee_type: createFormData.type,
      members: [],
      created_date: new Date().toISOString(),
      status: "active",
      tender_id: createFormData.tender_id && createFormData.tender_id !== "none" ? createFormData.tender_id : undefined,
      ministry_id: ministryId,
    };

    const updatedCommittees = [...committees, newCommittee];
    saveCommittees(updatedCommittees);
    onCommitteeUpdate?.(newCommittee);

    setCreateFormData({ name: "", type: "" as CommitteeType, tender_id: "" });
    setShowCreateForm(false);
  };

  const handleAssignMember = async () => {
    if (!selectedCommittee || !assignFormData.user_id || !assignFormData.role)
      return;

    const user = users.find((u) => u.user_id === assignFormData.user_id);
    if (!user) return;

    // Check if user can join committee (COI check)
    const tenderId = selectedCommittee.tender_id;
    if (tenderId && !canUserJoinCommittee(user, tenderId, coiDeclarations)) {
      alert("User has a conflict of interest and cannot join this committee");
      return;
    }

    const newMember: CommitteeMember = {
      user_id: assignFormData.user_id,
      committee_role: assignFormData.role,
      assigned_date: new Date().toISOString(),
      assigned_by: currentUserId,
      status: "active",
      coi_status: assignFormData.has_coi
        ? "declared_with_conflict"
        : "declared_no_conflict",
    };

    const updatedCommittees = committees.map((c) =>
      c.committee_id === selectedCommittee.committee_id
        ? { ...c, members: [...c.members, newMember] }
        : c,
    );

    saveCommittees(updatedCommittees);

    // Create COI declaration if needed
    if (assignFormData.has_coi && tenderId) {
      const coiDeclaration: COIDeclaration = {
        coi_id: generateCOIId(),
        user_id: assignFormData.user_id,
        tender_id: tenderId,
        declaration_type: "professional",
        has_conflict: true,
        conflict_details: assignFormData.coi_details,
        declared_date: new Date().toISOString(),
        status: "pending_review",
      };

      const updatedCOI = [...coiDeclarations, coiDeclaration];
      saveCOIDeclarations(updatedCOI);
    }

    setAssignFormData({
      user_id: "",
      role: "" as CommitteeRole,
      has_coi: false,
      coi_details: "",
    });
    setShowAssignForm(false);
  };

  const handleRemoveMember = (committee: Committee, memberId: string) => {
    const updatedCommittees = committees.map((c) =>
      c.committee_id === committee.committee_id
        ? { ...c, members: c.members.filter((m) => m.user_id !== memberId) }
        : c,
    );
    saveCommittees(updatedCommittees);
  };

  const handleCOIDeclaration = async () => {
    if (!selectedUser || !selectedCommittee?.tender_id) return;

    const coiDeclaration: COIDeclaration = {
      coi_id: generateCOIId(),
      user_id: selectedUser.user_id,
      tender_id: selectedCommittee.tender_id,
      declaration_type: coiFormData.conflict_type as any,
      has_conflict: coiFormData.has_conflict,
      conflict_details: coiFormData.conflict_details,
      relationship_type: coiFormData.relationship_type as any,
      company_name: coiFormData.company_name,
      financial_interest: coiFormData.financial_interest,
      declared_date: new Date().toISOString(),
      status: coiFormData.has_conflict
        ? "pending_review"
        : "declared_no_conflict",
    };

    const updatedCOI = [...coiDeclarations, coiDeclaration];
    saveCOIDeclarations(updatedCOI);

    setCOIFormData({
      has_conflict: false,
      conflict_type: "",
      conflict_details: "",
      relationship_type: "",
      company_name: "",
      financial_interest: "",
    });
    setShowCOIForm(false);
  };

  const getCommitteeTypeIcon = (type: CommitteeType) => {
    switch (type) {
      case "technical_evaluation":
        return Building2;
      case "financial_evaluation":
        return DollarSign;
      case "procurement_planning":
        return FileText;
      case "contract_review":
        return Award;
      case "audit_committee":
        return Scale;
      default:
        return Users;
    }
  };

  const getRoleIcon = (role: CommitteeRole) => {
    switch (role) {
      case "chair":
        return Crown;
      case "secretary":
        return FileText;
      case "evaluator":
        return UserCheck;
      case "financial_analyst":
        return DollarSign;
      case "technical_expert":
        return Building2;
      case "legal_advisor":
        return Scale;
      default:
        return Users;
    }
  };

  const getCOIStatusColor = (status: COIStatus) => {
    switch (status) {
      case "declared_no_conflict":
        return "bg-green-100 text-green-800";
      case "declared_with_conflict":
        return "bg-yellow-100 text-yellow-800";
      case "pending_review":
        return "bg-orange-100 text-orange-800";
      case "approved_with_conflict":
        return "bg-blue-100 text-blue-800";
      case "rejected_conflict":
        return "bg-red-100 text-red-800";
      case "not_declared":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEligibleUsers = (role: CommitteeRole, type: CommitteeType) => {
    let eligible = users.filter((u) => u.status === "active");

    // Filter by role-based criteria
    switch (role) {
      case "chair":
        eligible = eligible.filter((u) => u.role.hierarchy_level <= 2);
        break;
      case "evaluator":
        eligible = getUsersByRole(users, "ROLE_EVALUATOR");
        break;
      case "financial_analyst":
        eligible = getUsersByDepartment(users, "DEPT_FINANCE");
        break;
      case "technical_expert":
        eligible = getUsersByDepartment(users, "DEPT_TECHNICAL");
        break;
      case "legal_advisor":
        eligible = getUsersByDepartment(users, "DEPT_LEGAL");
        break;
    }

    return eligible;
  };

  const filteredCommittees = committees.filter((committee) => {
    const matchesSearch =
      searchTerm === "" ||
      committee.committee_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      committeeTypeFilter === "all" ||
      committee.committee_type === committeeTypeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Committee Assignment
          </h1>
          <p className="text-gray-600">
            Manage evaluation committees and member assignments
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Create Committee
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Committees
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {committees.length}
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
                  Active Committees
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {committees.filter((c) => c.status === "active").length}
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
                <p className="text-sm font-medium text-gray-600">
                  Total Members
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {committees.reduce((sum, c) => sum + c.members.length, 0)}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  COI Declarations
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {coiDeclarations.length}
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
          <div className="flex items-center gap-4">
            <div className="relative min-w-[300px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search committees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={committeeTypeFilter}
              onValueChange={setCommitteeTypeFilter}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="technical_evaluation">
                  Technical Evaluation
                </SelectItem>
                <SelectItem value="financial_evaluation">
                  Financial Evaluation
                </SelectItem>
                <SelectItem value="procurement_planning">
                  Procurement Planning
                </SelectItem>
                <SelectItem value="contract_review">Contract Review</SelectItem>
                <SelectItem value="audit_committee">Audit Committee</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Committees List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCommittees.map((committee) => {
          const TypeIcon = getCommitteeTypeIcon(committee.committee_type);

          return (
            <Card
              key={committee.committee_id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TypeIcon className="h-5 w-5 text-blue-600" />
                  {committee.committee_name}
                  <Badge
                    variant="outline"
                    className={
                      committee.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {committee.status}
                  </Badge>
                </CardTitle>
                <div className="text-sm text-gray-600">
                  {committee.committee_type.replace("_", " ")} •{" "}
                  {committee.members.length} members
                </div>
              </CardHeader>
              <CardContent>
                {/* Members List */}
                <div className="space-y-2 mb-4">
                  {committee.members.map((member) => {
                    const user = users.find(
                      (u) => u.user_id === member.user_id,
                    );
                    const RoleIcon = getRoleIcon(member.committee_role);

                    if (!user) return null;

                    return (
                      <div
                        key={member.user_id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <RoleIcon className="h-4 w-4 text-gray-600" />
                          <span className="font-medium">{user.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {member.committee_role}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getCOIStatusColor(member.coi_status)}`}
                          >
                            COI: {member.coi_status.replace("_", " ")}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setSelectedCommittee(committee);
                                setShowCOIForm(true);
                              }}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Update COI
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleRemoveMember(committee, member.user_id)
                              }
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCommittee(committee);
                      setShowAssignForm(true);
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                  {committee.tender_id && (
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Tender
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Committee Form */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Committee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="committee-name">Committee Name</Label>
              <Input
                id="committee-name"
                placeholder="Enter committee name"
                value={createFormData.name}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="committee-type">Committee Type</Label>
              <Select
                value={createFormData.type}
                onValueChange={(value: CommitteeType) =>
                  setCreateFormData({ ...createFormData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select committee type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical_evaluation">
                    Technical Evaluation
                  </SelectItem>
                  <SelectItem value="financial_evaluation">
                    Financial Evaluation
                  </SelectItem>
                  <SelectItem value="procurement_planning">
                    Procurement Planning
                  </SelectItem>
                  <SelectItem value="contract_review">
                    Contract Review
                  </SelectItem>
                  <SelectItem value="audit_committee">
                    Audit Committee
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tender-id">Related Tender (Optional)</Label>
              <Select
                value={createFormData.tender_id}
                onValueChange={(value) =>
                  setCreateFormData({ ...createFormData, tender_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No tender</SelectItem>
                  {tenders.map((tender) => (
                    <SelectItem key={tender.id} value={tender.id}>
                      {tender.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCommittee}>Create Committee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Member Form */}
      <Dialog open={showAssignForm} onOpenChange={setShowAssignForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Committee Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="member-role">Committee Role</Label>
              <Select
                value={assignFormData.role}
                onValueChange={(value: CommitteeRole) =>
                  setAssignFormData({ ...assignFormData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chair">Committee Chair</SelectItem>
                  <SelectItem value="secretary">Secretary</SelectItem>
                  <SelectItem value="evaluator">Evaluator</SelectItem>
                  <SelectItem value="financial_analyst">
                    Financial Analyst
                  </SelectItem>
                  <SelectItem value="technical_expert">
                    Technical Expert
                  </SelectItem>
                  <SelectItem value="legal_advisor">Legal Advisor</SelectItem>
                  <SelectItem value="observer">Observer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="member-user">Select User</Label>
              <Select
                value={assignFormData.user_id}
                onValueChange={(value) =>
                  setAssignFormData({ ...assignFormData, user_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {getEligibleUsers(
                    assignFormData.role,
                    selectedCommittee?.committee_type || "technical_evaluation",
                  ).map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      <div className="flex flex-col">
                        <span>{user.name}</span>
                        <span className="text-xs text-gray-500">
                          {user.role.role_name} •{" "}
                          {user.department.department_name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-coi"
                checked={assignFormData.has_coi}
                onCheckedChange={(checked) =>
                  setAssignFormData({
                    ...assignFormData,
                    has_coi: checked === true,
                  })
                }
              />
              <Label htmlFor="has-coi">
                User has declared conflict of interest
              </Label>
            </div>

            {assignFormData.has_coi && (
              <div>
                <Label htmlFor="coi-details">COI Details</Label>
                <Input
                  id="coi-details"
                  placeholder="Describe the conflict of interest"
                  value={assignFormData.coi_details}
                  onChange={(e) =>
                    setAssignFormData({
                      ...assignFormData,
                      coi_details: e.target.value,
                    })
                  }
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignMember}>Assign Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* COI Declaration Form */}
      <Dialog open={showCOIForm} onOpenChange={setShowCOIForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Conflict of Interest Declaration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-conflict"
                checked={coiFormData.has_conflict}
                onCheckedChange={(checked) =>
                  setCOIFormData({
                    ...coiFormData,
                    has_conflict: checked === true,
                  })
                }
              />
              <Label htmlFor="has-conflict">
                I have a conflict of interest
              </Label>
            </div>

            {coiFormData.has_conflict && (
              <>
                <div>
                  <Label htmlFor="conflict-type">Type of Conflict</Label>
                  <Select
                    value={coiFormData.conflict_type}
                    onValueChange={(value) =>
                      setCOIFormData({ ...coiFormData, conflict_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select conflict type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="financial">
                        Financial Interest
                      </SelectItem>
                      <SelectItem value="personal">
                        Personal Relationship
                      </SelectItem>
                      <SelectItem value="professional">
                        Professional Relationship
                      </SelectItem>
                      <SelectItem value="family">Family Connection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="conflict-details">Conflict Details</Label>
                  <Input
                    id="conflict-details"
                    placeholder="Describe the nature of the conflict"
                    value={coiFormData.conflict_details}
                    onChange={(e) =>
                      setCOIFormData({
                        ...coiFormData,
                        conflict_details: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="company-name">
                    Company/Organization Name
                  </Label>
                  <Input
                    id="company-name"
                    placeholder="Name of related company or organization"
                    value={coiFormData.company_name}
                    onChange={(e) =>
                      setCOIFormData({
                        ...coiFormData,
                        company_name: e.target.value,
                      })
                    }
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCOIForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleCOIDeclaration}>Submit Declaration</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
