import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Bell, AlertTriangle, Clock, CheckCircle, Eye, MessageSquare,
  Send, Filter, Search, Calendar, Flag, Zap, RefreshCw, Users,
  FileText, DollarSign, Building, Activity, Ban, Mail
} from 'lucide-react';

interface SuperUserAlert {
  id: string;
  type: "tender_delay" | "noc_pending" | "contract_variation" | "committee_unassigned";
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  mdaId: string;
  mdaName: string;
  relatedId: string;
  createdAt: string;
  isRead: boolean;
  actionRequired: boolean;
}

interface NotificationCenterProps {
  alerts: SuperUserAlert[];
  onMarkAsRead: (alertId: string) => void;
  onSendReminder: (alertId: string, message: string) => void;
  onRequestClarification: (alertId: string, message: string) => void;
  onDismissAlert: (alertId: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  alerts,
  onMarkAsRead,
  onSendReminder,
  onRequestClarification,
  onDismissAlert
}) => {
  const [selectedAlert, setSelectedAlert] = useState<SuperUserAlert | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [mdaFilter, setMdaFilter] = useState<string>('all');
  const [reminderMessage, setReminderMessage] = useState('');
  const [clarificationMessage, setClarificationMessage] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getFilteredAlerts = () => {
    let filtered = alerts;

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(alert => {
        switch (activeTab) {
          case 'unread': return !alert.isRead;
          case 'critical': return alert.severity === 'critical';
          case 'action-required': return alert.actionRequired;
          case 'procurement': return alert.type.includes('tender') || alert.type.includes('procurement');
          case 'contracts': return alert.type.includes('contract');
          case 'noc': return alert.type.includes('noc');
          default: return true;
        }
      });
    }

    // Apply other filters
    if (searchTerm) {
      filtered = filtered.filter(alert =>
        alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.mdaName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(alert => alert.severity === severityFilter);
    }

    if (mdaFilter !== 'all') {
      filtered = filtered.filter(alert => alert.mdaId === mdaFilter);
    }

    return filtered.sort((a, b) => {
      // Sort by severity, then by date
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tender_delay': return <Clock className="h-4 w-4" />;
      case 'noc_pending': return <FileText className="h-4 w-4" />;
      case 'contract_variation': return <DollarSign className="h-4 w-4" />;
      case 'committee_unassigned': return <Users className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      tender_delay: 'text-yellow-600',
      noc_pending: 'text-blue-600',
      contract_variation: 'text-red-600',
      committee_unassigned: 'text-purple-600'
    };
    return colors[type] || 'text-gray-600';
  };

  const handleSendReminder = () => {
    if (selectedAlert && reminderMessage.trim()) {
      onSendReminder(selectedAlert.id, reminderMessage);
      setReminderMessage('');
    }
  };

  const handleRequestClarification = () => {
    if (selectedAlert && clarificationMessage.trim()) {
      onRequestClarification(selectedAlert.id, clarificationMessage);
      setClarificationMessage('');
    }
  };

  const filteredAlerts = getFilteredAlerts();
  const unreadCount = alerts.filter(a => !a.isRead).length;
  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const actionRequiredCount = alerts.filter(a => a.actionRequired).length;

  const uniqueMDAs = Array.from(new Set(alerts.map(a => ({ id: a.mdaId, name: a.mdaName }))))
    .reduce((acc, mda) => {
      if (!acc.find(existing => existing.id === mda.id)) {
        acc.push(mda);
      }
      return acc;
    }, [] as Array<{ id: string; name: string }>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notification Center</h1>
          <p className="text-gray-600 mt-1">Real-time alerts and notifications from all MDAs</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setLastRefresh(new Date())}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-md border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold text-blue-600">{alerts.length}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-yellow-600">{unreadCount}</p>
              </div>
              <Mail className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Action Required</p>
                <p className="text-2xl font-bold text-purple-600">{actionRequiredCount}</p>
              </div>
              <Flag className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
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

      {/* Alerts Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Alerts & Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="all">All ({alerts.length})</TabsTrigger>
              <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
              <TabsTrigger value="critical">Critical ({criticalCount})</TabsTrigger>
              <TabsTrigger value="action-required">Action Required ({actionRequiredCount})</TabsTrigger>
              <TabsTrigger value="procurement">Procurement</TabsTrigger>
              <TabsTrigger value="contracts">Contracts</TabsTrigger>
              <TabsTrigger value="noc">NOC</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <div className="space-y-3">
                {filteredAlerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    No alerts found matching your filters.
                  </div>
                ) : (
                  filteredAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 border rounded-lg transition-all hover:shadow-md ${
                        !alert.isRead ? 'bg-blue-50 border-blue-200' : 'bg-white'
                      } ${getSeverityColor(alert.severity)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-full ${getTypeColor(alert.type)} bg-current bg-opacity-10`}>
                            {getTypeIcon(alert.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">{alert.title}</h4>
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity.toUpperCase()}
                              </Badge>
                              {alert.actionRequired && (
                                <Badge className="bg-purple-100 text-purple-800">
                                  ACTION REQUIRED
                                </Badge>
                              )}
                              {!alert.isRead && (
                                <Badge className="bg-blue-100 text-blue-800">
                                  NEW
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{alert.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                {alert.mdaName}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(alert.createdAt).toLocaleDateString()} {new Date(alert.createdAt).toLocaleTimeString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                ID: {alert.relatedId}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {!alert.isRead && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onMarkAsRead(alert.id)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => setSelectedAlert(alert)}
                              >
                                Actions
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Alert Actions - {alert.title}</DialogTitle>
                              </DialogHeader>
                              {selectedAlert && (
                                <div className="space-y-6">
                                  <div className="p-4 border rounded-lg bg-gray-50">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge className={getSeverityColor(selectedAlert.severity)}>
                                        {selectedAlert.severity.toUpperCase()}
                                      </Badge>
                                      <Badge className="bg-gray-100 text-gray-800">
                                        {selectedAlert.type.replace('_', ' ').toUpperCase()}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{selectedAlert.description}</p>
                                    <div className="text-xs text-gray-500">
                                      <div>MDA: {selectedAlert.mdaName}</div>
                                      <div>Related ID: {selectedAlert.relatedId}</div>
                                      <div>Created: {new Date(selectedAlert.createdAt).toLocaleString()}</div>
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-medium text-gray-900 mb-2">Send Reminder</h4>
                                      <Textarea
                                        placeholder="Enter reminder message for the MDA..."
                                        value={reminderMessage}
                                        onChange={(e) => setReminderMessage(e.target.value)}
                                        className="min-h-[80px]"
                                      />
                                      <Button onClick={handleSendReminder} className="mt-2">
                                        <Send className="h-4 w-4 mr-2" />
                                        Send Reminder
                                      </Button>
                                    </div>

                                    <div>
                                      <h4 className="font-medium text-gray-900 mb-2">Request Clarification</h4>
                                      <Textarea
                                        placeholder="Request clarification or additional information..."
                                        value={clarificationMessage}
                                        onChange={(e) => setClarificationMessage(e.target.value)}
                                        className="min-h-[80px]"
                                      />
                                      <Button onClick={handleRequestClarification} className="mt-2" variant="outline">
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Request Clarification
                                      </Button>
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t">
                                      {!selectedAlert.isRead && (
                                        <Button
                                          onClick={() => {
                                            onMarkAsRead(selectedAlert.id);
                                            setSelectedAlert(null);
                                          }}
                                          variant="outline"
                                        >
                                          <Eye className="h-4 w-4 mr-2" />
                                          Mark as Read
                                        </Button>
                                      )}
                                      <Button
                                        onClick={() => {
                                          onDismissAlert(selectedAlert.id);
                                          setSelectedAlert(null);
                                        }}
                                        variant="destructive"
                                      >
                                        <Ban className="h-4 w-4 mr-2" />
                                        Dismiss Alert
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationCenter;
