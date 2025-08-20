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
  Building2,
  TrendingUp,
  Activity,
  Calendar,
  Eye,
  ExternalLink,
} from "lucide-react";

interface MDAData {
  totalMDAs: number;
  activeMDAs: number;
  inactiveMDAs: number;
  recentlyAdded: Array<{
    id: string;
    name: string;
    activationDate: string;
    status: "active" | "inactive" | "pending";
  }>;
}

interface MDAOverviewSectionProps {
  data: MDAData;
  onDrillDown?: (mda: string) => void;
}

export function MDAOverviewSection({
  data,
  onDrillDown,
}: MDAOverviewSectionProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const activePercentage = (data.activeMDAs / data.totalMDAs) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Total MDAs Overview
          </h2>
          <p className="text-muted-foreground">
            Monitor all Ministry, Department and Agency activities
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          View All MDAs
        </Button>
      </div>

      {/* MDA Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total MDAs */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total MDAs</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {data.totalMDAs}
            </div>
            <p className="text-xs text-muted-foreground">
              Registered ministries, departments and agencies
            </p>
          </CardContent>
        </Card>

        {/* Active MDAs */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active MDAs</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data.activeMDAs}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${activePercentage}%` }}
                />
              </div>
              <span>{activePercentage.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Inactive MDAs */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive MDAs</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {data.inactiveMDAs}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires activation or review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recently Added MDAs */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">
                Recently Added MDAs
              </CardTitle>
              <CardDescription>
                Latest ministries, departments and agencies onboarded
              </CardDescription>
            </div>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          {data.recentlyAdded.length > 0 ? (
            <div className="space-y-4">
              {data.recentlyAdded.map((mda) => (
                <div
                  key={mda.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">
                        {mda.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Activated on{" "}
                        {new Date(mda.activationDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={getStatusColor(mda.status)}
                    >
                      {mda.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDrillDown?.(mda.id)}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recently added MDAs</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
