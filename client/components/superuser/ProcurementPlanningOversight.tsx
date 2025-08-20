import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  FileText, Clock, CheckCircle, AlertTriangle, Eye, MessageSquare,
  Send, Calendar, DollarSign, Building, Filter, Search, TrendingUp
} from 'lucide-react';

interface ProcurementPlan {
  id: string;
  title: string;
  mdaId: string;
  mdaName: string;
  status: "Draft" | "Submitted" | "UnderReview" | "Approved" | "Rejected";
  budgetRequested: number;
  submittedBy: string;
  submittedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  delayedDays?: number;
  remarks?: string;
  procurementItems: Array<{
    id: string;
    description: string;
    quantity: number;
    estimatedValue: number;
    procurementCategory: string;
  }>;
}

interface ProcurementPlanningOversightProps {
  procurementPlans: ProcurementPlan[];
  onUpdatePlan: (planId: string, updates: Partial<ProcurementPlan>) => void;
  onSendQuery: (planId: string, message: string) => void;
}

const ProcurementPlanningOversight: React.FC<ProcurementPlanningOversightProps> = ({
  procurementPlans,
  onUpdatePlan,
  onSendQuery
}) => {
  const [selectedPlan, setSelectedPlan] = useState<ProcurementPlan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [mdaFilter, setMdaFilter] = useState<string>('all');
  const [queryMessage, setQueryMessage] = useState('');

  const filteredPlans = procurementPlans.filter(plan => {
    const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.mdaName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
    const matchesMda = mdaFilter === 'all' || plan.mdaId === mdaFilter;
    return matchesSearch && matchesStatus && matchesMda;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Draft: 'bg-gray-100 text-gray-800',
      Submitted: 'bg-blue-100 text-blue-800',
      UnderReview: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Rejected': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'UnderReview': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <FileText className="h-4 w-4 text-blue-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleApprove = (planId: string) => {
    onUpdatePlan(planId, {
      status: 'Approved',
      approvedBy: 'BPP Superuser',
      approvedAt: new Date().toISOString()
    });
  };

  const handleReject = (planId: string) => {
    onUpdatePlan(planId, {
      status: 'Rejected',
      approvedBy: 'BPP Superuser',
      approvedAt: new Date().toISOString()
    });
  };

  const handleSendQuery = () => {
    if (selectedPlan && queryMessage.trim()) {
      onSendQuery(selectedPlan.id, queryMessage);
      setQueryMessage('');
    }
  };

  const statusCounts = procurementPlans.reduce((acc, plan) => {
    acc[plan.status] = (acc[plan.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const delayedPlans = procurementPlans.filter(plan => 
    plan.delayedDays && plan.delayedDays > 30
  );

  const uniqueMDAs = Array.from(new Set(procurementPlans.map(p => ({ id: p.mdaId, name: p.mdaName }))))
    .reduce((acc, mda) => {
      if (!acc.find(existing => existing.id === mda.id)) {
        acc.push(mda);
      }
      return acc;
    }, [] as Array<{ id: string; name: string }>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Procurement Planning Oversight</h1>
        <p className="text-gray-600 mt-1">Monitor and approve procurement plans from all MDAs</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="shadow-md border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Plans</p>
                <p className="text-2xl font-bold text-blue-600">{procurementPlans.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {(statusCounts.Submitted || 0) + (statusCounts.UnderReview || 0)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.Approved || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delayed (&gt;30 days)</p>
                <p className="text-2xl font-bold text-red-600">{delayedPlans.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(procurementPlans.reduce((sum, plan) => sum + plan.budgetRequested, 0))}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search procurement plans..."
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
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Submitted">Submitted</SelectItem>
                <SelectItem value="UnderReview">Under Review</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={mdaFilter} onValueChange={setMdaFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by MDA" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All MDAs</SelectItem>
                {uniqueMDAs.map((mda) => (
                  <SelectItem key={mda.id} value={mda.id}>{mda.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Procurement Plans ({filteredPlans.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>MDA</TableHead>
                <TableHead>Budget Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted Date</TableHead>
                <TableHead>Delay</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.id}</TableCell>
                  <TableCell className="max-w-xs truncate">{plan.title}</TableCell>
                  <TableCell>{plan.mdaName}</TableCell>
                  <TableCell>{formatCurrency(plan.budgetRequested)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(plan.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(plan.status)}
                        {plan.status}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(plan.submittedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {plan.delayedDays && plan.delayedDays > 0 ? (
                      <Badge className={plan.delayedDays > 30 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                        {plan.delayedDays} days
                      </Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800">On time</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPlan(plan)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Procurement Plan Details - {plan.id}</DialogTitle>
                          </DialogHeader>
                          {selectedPlan && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <div><span className="font-medium">Title:</span> {selectedPlan.title}</div>
                                    <div><span className="font-medium">MDA:</span> {selectedPlan.mdaName}</div>
                                    <div><span className="font-medium">Budget:</span> {formatCurrency(selectedPlan.budgetRequested)}</div>
                                    <div><span className="font-medium">Submitted by:</span> {selectedPlan.submittedBy}</div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Status & Timeline</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">Status:</span>
                                      <Badge className={getStatusColor(selectedPlan.status)}>
                                        {selectedPlan.status}
                                      </Badge>
                                    </div>
                                    <div><span className="font-medium">Submitted:</span> {new Date(selectedPlan.submittedAt).toLocaleDateString()}</div>
                                    {selectedPlan.approvedAt && (
                                      <div><span className="font-medium">Approved:</span> {new Date(selectedPlan.approvedAt).toLocaleDateString()}</div>
                                    )}
                                    {selectedPlan.delayedDays && selectedPlan.delayedDays > 0 && (
                                      <div className="text-red-600"><span className="font-medium">Delayed:</span> {selectedPlan.delayedDays} days</div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Procurement Items</h4>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Description</TableHead>
                                      <TableHead>Quantity</TableHead>
                                      <TableHead>Category</TableHead>
                                      <TableHead>Estimated Value</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {selectedPlan.procurementItems.map((item) => (
                                      <TableRow key={item.id}>
                                        <TableCell>{item.description}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>{item.procurementCategory}</TableCell>
                                        <TableCell>{formatCurrency(item.estimatedValue)}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>

                              {selectedPlan.status === 'Submitted' || selectedPlan.status === 'UnderReview' ? (
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Send Query/Comment</h4>
                                    <Textarea
                                      placeholder="Enter your query or comment for the MDA..."
                                      value={queryMessage}
                                      onChange={(e) => setQueryMessage(e.target.value)}
                                      className="min-h-[100px]"
                                    />
                                  </div>
                                  <div className="flex gap-3">
                                    <Button onClick={() => handleApprove(selectedPlan.id)} className="bg-green-600 hover:bg-green-700">
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approve Plan
                                    </Button>
                                    <Button onClick={() => handleReject(selectedPlan.id)} variant="destructive">
                                      <AlertTriangle className="h-4 w-4 mr-2" />
                                      Reject Plan
                                    </Button>
                                    <Button onClick={handleSendQuery} variant="outline">
                                      <MessageSquare className="h-4 w-4 mr-2" />
                                      Send Query
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-gray-600">
                                  Plan status: {selectedPlan.status}. 
                                  {selectedPlan.remarks && (
                                    <div className="mt-2">
                                      <span className="font-medium">Remarks:</span> {selectedPlan.remarks}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {plan.status === 'Submitted' || plan.status === 'UnderReview' ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(plan.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(plan.id)}
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </Button>
                        </>
                      ) : null}
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

export default ProcurementPlanningOversight;
