import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  FileText, AlertTriangle, Clock, CheckCircle, Eye, MessageSquare,
  TrendingUp, TrendingDown, DollarSign, Calendar, Flag, Activity,
  Building, Search, Filter, Send, Shield, Zap
} from 'lucide-react';

interface Contract {
  id: string;
  tenderId?: string;
  title: string;
  contractorId: string;
  contractorName: string;
  contractValue: number;
  originalValue: number;
  startDate: string;
  endDate: string;
  status: "Active" | "Completed" | "Delayed" | "Terminated";
  mdaId: string;
  mdaName: string;
  performance: "excellent" | "good" | "satisfactory" | "poor";
  delayedDays?: number;
  variationRequests: Array<{
    id: string;
    description: string;
    date: string;
    valueImpact: number;
    status: "Pending" | "Approved" | "Rejected";
  }>;
  riskFlags: Array<{
    type: "variation_excess" | "delay" | "noc_pending";
    severity: "high" | "medium" | "low";
    description: string;
    flaggedDate: string;
  }>;
  history: Array<{
    id: string;
    action: string;
    date: string;
    user: string;
    details: string;
  }>;
}

interface ContractOversightProps {
  contracts: Contract[];
  onSendFeedback: (contractId: string, message: string) => void;
  onUpdateContract: (contractId: string, updates: Partial<Contract>) => void;
}

const ContractOversight: React.FC<ContractOversightProps> = ({
  contracts,
  onSendFeedback,
  onUpdateContract
}) => {
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.contractorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.mdaName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    const matchesRisk = riskFilter === 'all' || 
                       (riskFilter === 'high-risk' && contract.riskFlags.some(flag => flag.severity === 'high')) ||
                       (riskFilter === 'medium-risk' && contract.riskFlags.some(flag => flag.severity === 'medium')) ||
                       (riskFilter === 'low-risk' && contract.riskFlags.length === 0);
    return matchesSearch && matchesStatus && matchesRisk;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Active: 'bg-green-100 text-green-800',
      Completed: 'bg-blue-100 text-blue-800',
      Delayed: 'bg-yellow-100 text-yellow-800',
      Terminated: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPerformanceColor = (performance: string) => {
    const colors: Record<string, string> = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      satisfactory: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-red-100 text-red-800'
    };
    return colors[performance] || 'bg-gray-100 text-gray-800';
  };

  const getRiskSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateVariationPercentage = (contract: Contract) => {
    const totalVariations = contract.variationRequests
      .filter(req => req.status === 'Approved')
      .reduce((sum, req) => sum + req.valueImpact, 0);
    return ((totalVariations / contract.originalValue) * 100);
  };

  const getProgressPercentage = (contract: Contract) => {
    const totalDays = Math.ceil((new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.ceil((Date.now() - new Date(contract.startDate).getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);
  };

  const handleSendFeedback = () => {
    if (selectedContract && feedbackMessage.trim()) {
      onSendFeedback(selectedContract.id, feedbackMessage);
      setFeedbackMessage('');
    }
  };

  // Calculate statistics
  const statusCounts = contracts.reduce((acc, contract) => {
    acc[contract.status] = (acc[contract.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const highRiskContracts = contracts.filter(c => c.riskFlags.some(flag => flag.severity === 'high'));
  const delayedContracts = contracts.filter(c => c.status === 'Delayed' || (c.delayedDays && c.delayedDays > 0));
  const variationExcessContracts = contracts.filter(c => calculateVariationPercentage(c) > 15);

  const totalContractValue = contracts.reduce((sum, c) => sum + c.contractValue, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Contract Oversight</h1>
        <p className="text-gray-600 mt-1">Monitor contracts across all MDAs with automated risk flagging</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="shadow-md border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contracts</p>
                <p className="text-2xl font-bold text-blue-600">{contracts.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.Active || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-red-600">{highRiskContracts.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delayed</p>
                <p className="text-2xl font-bold text-yellow-600">{delayedContracts.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-xl font-bold text-purple-600">{formatCurrency(totalContractValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Alerts */}
      {(highRiskContracts.length > 0 || variationExcessContracts.length > 0) && (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Flag className="h-5 w-5" />
              Risk Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {variationExcessContracts.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-800">
                      {variationExcessContracts.length} contracts have variations exceeding 15%
                    </span>
                  </div>
                </div>
              )}
              {delayedContracts.length > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">
                      {delayedContracts.length} contracts are delayed beyond schedule
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search contracts, contractors, or MDAs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Delayed">Delayed</SelectItem>
                <SelectItem value="Terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="high-risk">High Risk</SelectItem>
                <SelectItem value="medium-risk">Medium Risk</SelectItem>
                <SelectItem value="low-risk">Low Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contracts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Contract Monitoring ({filteredContracts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Contractor</TableHead>
                <TableHead>MDA</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Risk Flags</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">{contract.id}</TableCell>
                  <TableCell className="max-w-xs truncate">{contract.title}</TableCell>
                  <TableCell>{contract.contractorName}</TableCell>
                  <TableCell>{contract.mdaName}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{formatCurrency(contract.contractValue)}</div>
                      {contract.contractValue !== contract.originalValue && (
                        <div className="text-xs text-orange-600">
                          Original: {formatCurrency(contract.originalValue)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(contract.status)}>
                      {contract.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="w-20">
                      <Progress value={getProgressPercentage(contract)} className="h-2" />
                      <div className="text-xs text-gray-500 mt-1">
                        {Math.round(getProgressPercentage(contract))}%
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {contract.riskFlags.map((flag, index) => (
                        <Badge
                          key={index}
                          className={getRiskSeverityColor(flag.severity)}
                        >
                          {flag.type.replace('_', ' ')}
                        </Badge>
                      ))}
                      {contract.riskFlags.length === 0 && (
                        <Badge className="bg-green-100 text-green-800">No risks</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedContract(contract)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-6xl">
                          <DialogHeader>
                            <DialogTitle>Contract Details - {contract.id}</DialogTitle>
                          </DialogHeader>
                          {selectedContract && (
                            <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                              {/* Basic Information */}
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-3">Contract Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <div><span className="font-medium">Title:</span> {selectedContract.title}</div>
                                    <div><span className="font-medium">Contractor:</span> {selectedContract.contractorName}</div>
                                    <div><span className="font-medium">MDA:</span> {selectedContract.mdaName}</div>
                                    <div><span className="font-medium">Current Value:</span> {formatCurrency(selectedContract.contractValue)}</div>
                                    <div><span className="font-medium">Original Value:</span> {formatCurrency(selectedContract.originalValue)}</div>
                                    <div>
                                      <span className="font-medium">Variation:</span> 
                                      <span className={calculateVariationPercentage(selectedContract) > 15 ? 'text-red-600 font-medium' : ''}>
                                        {' '}{calculateVariationPercentage(selectedContract).toFixed(1)}%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-3">Timeline & Performance</h4>
                                  <div className="space-y-2 text-sm">
                                    <div><span className="font-medium">Start Date:</span> {new Date(selectedContract.startDate).toLocaleDateString()}</div>
                                    <div><span className="font-medium">End Date:</span> {new Date(selectedContract.endDate).toLocaleDateString()}</div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">Status:</span>
                                      <Badge className={getStatusColor(selectedContract.status)}>
                                        {selectedContract.status}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">Performance:</span>
                                      <Badge className={getPerformanceColor(selectedContract.performance)}>
                                        {selectedContract.performance}
                                      </Badge>
                                    </div>
                                    <div>
                                      <span className="font-medium">Progress:</span>
                                      <div className="mt-1">
                                        <Progress value={getProgressPercentage(selectedContract)} className="h-2" />
                                        <div className="text-xs text-gray-500 mt-1">
                                          {Math.round(getProgressPercentage(selectedContract))}% complete
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Risk Flags */}
                              {selectedContract.riskFlags.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-3">Risk Flags</h4>
                                  <div className="space-y-2">
                                    {selectedContract.riskFlags.map((flag, index) => (
                                      <div key={index} className="p-3 border rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                          <Badge className={getRiskSeverityColor(flag.severity)}>
                                            {flag.severity.toUpperCase()} RISK
                                          </Badge>
                                          <span className="text-sm text-gray-500">
                                            Flagged: {new Date(flag.flaggedDate).toLocaleDateString()}
                                          </span>
                                        </div>
                                        <div className="text-sm font-medium">{flag.type.replace('_', ' ').toUpperCase()}</div>
                                        <div className="text-sm text-gray-600">{flag.description}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Variation Requests */}
                              {selectedContract.variationRequests.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-3">Variation Requests</h4>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Value Impact</TableHead>
                                        <TableHead>Status</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {selectedContract.variationRequests.map((variation) => (
                                        <TableRow key={variation.id}>
                                          <TableCell>{variation.description}</TableCell>
                                          <TableCell>{new Date(variation.date).toLocaleDateString()}</TableCell>
                                          <TableCell className={variation.valueImpact > 0 ? 'text-red-600' : 'text-green-600'}>
                                            {variation.valueImpact > 0 ? '+' : ''}{formatCurrency(variation.valueImpact)}
                                          </TableCell>
                                          <TableCell>
                                            <Badge className={getStatusColor(variation.status)}>
                                              {variation.status}
                                            </Badge>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              )}

                              {/* Contract History */}
                              <div>
                                <h4 className="font-medium text-gray-900 mb-3">Contract History</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                  {selectedContract.history.map((entry) => (
                                    <div key={entry.id} className="flex items-start gap-3 p-2 border rounded">
                                      <Activity className="h-4 w-4 text-blue-500 mt-0.5" />
                                      <div className="flex-1 text-sm">
                                        <div className="font-medium">{entry.action}</div>
                                        <div className="text-gray-600">{entry.details}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                          {entry.user} - {new Date(entry.date).toLocaleDateString()}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Send Feedback */}
                              <div className="space-y-4 border-t pt-4">
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Send Feedback to MDA</h4>
                                  <Textarea
                                    placeholder="Enter your feedback or instructions for the MDA..."
                                    value={feedbackMessage}
                                    onChange={(e) => setFeedbackMessage(e.target.value)}
                                    className="min-h-[100px]"
                                  />
                                </div>
                                <Button onClick={handleSendFeedback} className="w-full">
                                  <Send className="h-4 w-4 mr-2" />
                                  Send Feedback
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractOversight;
