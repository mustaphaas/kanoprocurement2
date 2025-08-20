import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Award, 
  XCircle, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp,
  Filter,
  Eye
} from "lucide-react";

interface ProcurementData {
  totalTenders: number;
  ongoingTenders: number;
  evaluatedTenders: number;
  awardedTenders: number;
  pendingNOC: number;
  approvedNOC: number;
  rejectedNOC: number;
  highValueContracts: Array<{
    id: string;
    title: string;
    mda: string;
    value: string;
    status: string;
    dateAwarded: string;
  }>;
}

interface ProcurementActivitySummaryProps {
  data: ProcurementData;
  onFilterChange?: (filters: any) => void;
}

export function ProcurementActivitySummary({ data, onFilterChange }: ProcurementActivitySummaryProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "awarded": return "bg-green-100 text-green-800 border-green-200";
      case "ongoing": return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const totalNOC = data.pendingNOC + data.approvedNOC + data.rejectedNOC;
  const nocApprovalRate = totalNOC > 0 ? (data.approvedNOC / totalNOC) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Procurement Activity Summary</h2>
          <p className="text-muted-foreground">System-wide procurement and tender activities across all MDAs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onFilterChange?.({})}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            View All
          </Button>
        </div>
      </div>

      {/* Tender Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenders</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{data.totalTenders}</div>
            <p className="text-xs text-muted-foreground">
              Across all MDAs
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ongoing Tenders</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{data.ongoingTenders}</div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evaluated Tenders</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.evaluatedTenders}</div>
            <p className="text-xs text-muted-foreground">
              Evaluation completed
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Awarded Tenders</CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{data.awardedTenders}</div>
            <p className="text-xs text-muted-foreground">
              Successfully awarded
            </p>
          </CardContent>
        </Card>
      </div>

      {/* NOC Requests Overview */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">No Objection Certificate (NOC) Requests</CardTitle>
          <CardDescription>Status overview of NOC requests across all MDAs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="p-2 bg-yellow-100 rounded-full">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{data.pendingNOC}</div>
                <p className="text-sm text-yellow-700">Pending Approval</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{data.approvedNOC}</div>
                <p className="text-sm text-green-700">Approved</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="p-2 bg-red-100 rounded-full">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{data.rejectedNOC}</div>
                <p className="text-sm text-red-700">Rejected</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">NOC Approval Rate</span>
                <span className="text-sm text-muted-foreground">{nocApprovalRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${nocApprovalRate}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* High-Value Contracts */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">High-Value Contracts (Top 5)</CardTitle>
              <CardDescription>Recently awarded contracts with highest values</CardDescription>
            </div>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          {data.highValueContracts.length > 0 ? (
            <div className="space-y-4">
              {data.highValueContracts.map((contract, index) => (
                <div 
                  key={contract.id} 
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                      <span className="text-sm font-semibold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{contract.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>MDA: {contract.mda}</span>
                        <span>•</span>
                        <span>Awarded: {new Date(contract.dateAwarded).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semibold text-foreground">{contract.value}</div>
                      <Badge 
                        variant="outline" 
                        className={getStatusColor(contract.status)}
                      >
                        {contract.status}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No high-value contracts available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
