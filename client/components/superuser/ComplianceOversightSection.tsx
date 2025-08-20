import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  AlertTriangle, 
  Clock, 
  Flag, 
  FileCheck, 
  AlertCircle,
  TrendingUp,
  Eye,
  Calendar,
  DollarSign
} from "lucide-react";

interface ComplianceData {
  pendingProcurementPlans: number;
  delayedNOCRequests: number;
  flaggedTenders: number;
  contractsWithVariations: number;
  pendingApprovals: Array<{
    id: string;
    type: "procurement_plan" | "noc_request" | "contract_variation";
    mda: string;
    title: string;
    daysOverdue: number;
  }>;
}

interface ComplianceOversightSectionProps {
  data: ComplianceData;
  onFilterChange?: (filters: any) => void;
}

export function ComplianceOversightSection({ data, onFilterChange }: ComplianceOversightSectionProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "procurement_plan": return "bg-blue-100 text-blue-800 border-blue-200";
      case "noc_request": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "contract_variation": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "procurement_plan": return <FileCheck className="h-4 w-4" />;
      case "noc_request": return <Clock className="h-4 w-4" />;
      case "contract_variation": return <DollarSign className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getUrgencyColor = (daysOverdue: number) => {
    if (daysOverdue >= 21) return "text-red-600";
    if (daysOverdue >= 14) return "text-orange-600";
    if (daysOverdue >= 7) return "text-yellow-600";
    return "text-green-600";
  };

  const totalIssues = data.pendingProcurementPlans + data.delayedNOCRequests + 
                     data.flaggedTenders + data.contractsWithVariations;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Compliance & Oversight</h2>
          <p className="text-muted-foreground">Monitor compliance issues and oversight requirements</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {totalIssues} Total Issues
          </Badge>
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </div>

      {/* Compliance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Plans</CardTitle>
            <FileCheck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{data.pendingProcurementPlans}</div>
            <p className="text-xs text-orange-700">
              Procurement plans awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delayed NOCs</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data.delayedNOCRequests}</div>
            <p className="text-xs text-red-700">
              NOC requests delayed &gt;14 days
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Tenders</CardTitle>
            <Flag className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{data.flaggedTenders}</div>
            <p className="text-xs text-yellow-700">
              Tenders flagged for irregularities
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contract Variations</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{data.contractsWithVariations}</div>
            <p className="text-xs text-purple-700">
              Contracts with variations &gt;15%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Status Overview */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Compliance Status Overview</CardTitle>
              <CardDescription>Real-time view of compliance across all procurement activities</CardDescription>
            </div>
            <Shield className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Compliance Score */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Overall Compliance Score</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Procurement Plans</span>
                  <span className="text-sm font-medium">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }} />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">NOC Processing</span>
                  <span className="text-sm font-medium">72%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '72%' }} />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tender Compliance</span>
                  <span className="text-sm font-medium">91%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '91%' }} />
                </div>
              </div>
            </div>

            {/* Risk Indicators */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Risk Indicators</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-800">High Risk</p>
                    <p className="text-xs text-red-600">5 tenders with irregularities</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Medium Risk</p>
                    <p className="text-xs text-yellow-600">12 delayed approvals</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Shield className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Low Risk</p>
                    <p className="text-xs text-green-600">Most processes compliant</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Approvals & Actions */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Pending Approvals & Overdue Items</CardTitle>
              <CardDescription>Items requiring immediate attention or approval</CardDescription>
            </div>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          {data.pendingApprovals.length > 0 ? (
            <div className="space-y-4">
              {data.pendingApprovals.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-red-100 rounded-full">
                      {getTypeIcon(item.type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{item.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>MDA: {item.mda}</span>
                        <span>•</span>
                        <span className={getUrgencyColor(item.daysOverdue)}>
                          {item.daysOverdue} days overdue
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="outline" 
                      className={getTypeColor(item.type)}
                    >
                      {item.type.replace('_', ' ')}
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
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No pending approvals</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
