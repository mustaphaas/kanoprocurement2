import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  User,
  UserCheck,
  Shield,
  Activity,
  PieChart,
  Eye,
  Building2,
  Calendar,
  Settings,
} from "lucide-react";

interface UserActivityData {
  totalUsers: number;
  roleDistribution: {
    procurementOfficers: number;
    accountants: number;
    evaluators: number;
    admins: number;
  };
  activeCommittees: number;
  assignedMembers: number;
  committees: Array<{
    id: string;
    name: string;
    mda: string;
    memberCount: number;
    status: "active" | "inactive";
  }>;
}

interface UserCommitteeActivityProps {
  data: UserActivityData;
}

export function UserCommitteeActivity({ data }: UserCommitteeActivityProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const roleData = [
    {
      role: "Procurement Officers",
      count: data.roleDistribution.procurementOfficers,
      icon: UserCheck,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      role: "Accountants",
      count: data.roleDistribution.accountants,
      icon: User,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      role: "Evaluators",
      count: data.roleDistribution.evaluators,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      role: "Admins",
      count: data.roleDistribution.admins,
      icon: Shield,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
  ];

  const totalRoles = Object.values(data.roleDistribution).reduce(
    (sum, count) => sum + count,
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            User & Committee Activity
          </h2>
          <p className="text-muted-foreground">
            Monitor user engagement and committee management across MDAs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Manage Users
          </Button>
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            View All
          </Button>
        </div>
      </div>

      {/* User Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {data.totalUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              Registered across all MDAs
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Committees
            </CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data.activeCommittees}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently operational
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Assigned Members
            </CardTitle>
            <UserCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {data.assignedMembers}
            </div>
            <p className="text-xs text-muted-foreground">
              Members in committees
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Role Distribution */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">
                Role Distribution
              </CardTitle>
              <CardDescription>
                User roles across all MDAs in the procurement system
              </CardDescription>
            </div>
            <PieChart className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Role Statistics */}
            <div className="space-y-4">
              {roleData.map((role) => {
                const percentage =
                  totalRoles > 0 ? (role.count / totalRoles) * 100 : 0;
                const Icon = role.icon;

                return (
                  <div
                    key={role.role}
                    className={`flex items-center justify-between p-4 rounded-lg border ${role.bgColor} ${role.borderColor}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 bg-white rounded-full border ${role.borderColor}`}
                      >
                        <Icon className={`h-4 w-4 ${role.color}`} />
                      </div>
                      <div>
                        <p className={`font-medium ${role.color}`}>
                          {role.role}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {percentage.toFixed(1)}% of total
                        </p>
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${role.color}`}>
                      {role.count}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Visual Distribution */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">
                Distribution Overview
              </h4>
              <div className="space-y-3">
                {roleData.map((role) => {
                  const percentage =
                    totalRoles > 0 ? (role.count / totalRoles) * 100 : 0;

                  return (
                    <div key={role.role} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {role.role}
                        </span>
                        <span className="text-sm font-medium">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${role.color.replace("text-", "bg-")}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Committees */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">
                Active Evaluation Committees
              </CardTitle>
              <CardDescription>
                Currently operational committees across all MDAs
              </CardDescription>
            </div>
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          {data.committees.length > 0 ? (
            <div className="space-y-4">
              {data.committees.map((committee) => (
                <div
                  key={committee.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">
                        {committee.name}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>MDA: {committee.mda}</span>
                        <span>•</span>
                        <span>{committee.memberCount} members</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={getStatusColor(committee.status)}
                    >
                      {committee.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No active committees found
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Committee Performance Summary */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Committee Performance Summary
          </CardTitle>
          <CardDescription>
            Key metrics for committee efficiency and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">87%</div>
              <p className="text-sm text-green-700">
                Committees with Full Membership
              </p>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">92%</div>
              <p className="text-sm text-blue-700">On-time Evaluation Rate</p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">15</div>
              <p className="text-sm text-purple-700">
                Avg. Days per Evaluation
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
