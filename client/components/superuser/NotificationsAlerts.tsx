import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  MessageSquare, 
  Mail,
  Eye,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  XCircle,
  Settings,
  Filter
} from "lucide-react";

interface AlertsData {
  tenderDelays: number;
  overdueNOCs: number;
  contractIssues: number;
  urgentAlerts: Array<{
    id: string;
    type: "tender_delay" | "overdue_noc" | "contract_issue" | "system_alert";
    title: string;
    description: string;
    priority: "low" | "medium" | "high" | "urgent";
    timestamp: string;
    mda?: string;
  }>;
  mdaMessages: Array<{
    id: string;
    from: string;
    mda: string;
    subject: string;
    preview: string;
    timestamp: string;
    isUnread: boolean;
  }>;
}

interface NotificationsAlertsProps {
  data: AlertsData;
}

export function NotificationsAlerts({ data }: NotificationsAlertsProps) {
  const [activeTab, setActiveTab] = useState("alerts");

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "tender_delay": return <Clock className="h-4 w-4" />;
      case "overdue_noc": return <AlertTriangle className="h-4 w-4" />;
      case "contract_issue": return <XCircle className="h-4 w-4" />;
      case "system_alert": return <AlertCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "tender_delay": return "text-orange-600";
      case "overdue_noc": return "text-red-600";
      case "contract_issue": return "text-purple-600";
      case "system_alert": return "text-blue-600";
      default: return "text-gray-600";
    }
  };

  const totalAlerts = data.tenderDelays + data.overdueNOCs + data.contractIssues;
  const unreadMessages = data.mdaMessages.filter(msg => msg.isUnread).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Notifications & Alerts</h2>
          <p className="text-muted-foreground">Real-time alerts and communication from MDAs</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {totalAlerts} Active Alerts
          </Badge>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tender Delays</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{data.tenderDelays}</div>
            <p className="text-xs text-orange-700">
              Tenders behind schedule
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue NOCs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data.overdueNOCs}</div>
            <p className="text-xs text-red-700">
              NOC requests overdue
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contract Issues</CardTitle>
            <XCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{data.contractIssues}</div>
            <p className="text-xs text-purple-700">
              Contracts with issues
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <Mail className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{unreadMessages}</div>
            <p className="text-xs text-blue-700">
              From MDAs to BPP
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Messages Tabs */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Real-time Alerts & Messages</CardTitle>
              <CardDescription>Monitor system alerts and MDA communications</CardDescription>
            </div>
            <Bell className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList className="grid w-fit grid-cols-2">
                <TabsTrigger value="alerts" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  System Alerts ({data.urgentAlerts.length})
                </TabsTrigger>
                <TabsTrigger value="messages" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  MDA Messages ({data.mdaMessages.length})
                </TabsTrigger>
              </TabsList>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>

            <TabsContent value="alerts" className="space-y-4">
              {data.urgentAlerts.length > 0 ? (
                <div className="space-y-3">
                  {data.urgentAlerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className="flex items-start justify-between p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-2 rounded-full bg-white border ${getTypeColor(alert.type)}`}>
                          {getTypeIcon(alert.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-foreground">{alert.title}</h4>
                            <Badge 
                              variant="outline" 
                              className={getPriorityColor(alert.priority)}
                            >
                              {alert.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{new Date(alert.timestamp).toLocaleString()}</span>
                            {alert.mda && (
                              <>
                                <span>•</span>
                                <span>MDA: {alert.mda}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No active alerts</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="messages" className="space-y-4">
              {data.mdaMessages.length > 0 ? (
                <div className="space-y-3">
                  {data.mdaMessages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex items-start justify-between p-4 rounded-lg border transition-colors ${
                        message.isUnread 
                          ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                          : 'bg-muted/30 border-border hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-2 rounded-full ${message.isUnread ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <Mail className={`h-4 w-4 ${message.isUnread ? 'text-blue-600' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-medium ${message.isUnread ? 'text-blue-900' : 'text-foreground'}`}>
                              {message.subject}
                            </h4>
                            {message.isUnread && (
                              <Badge variant="default" className="bg-blue-600">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{message.preview}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>From: {message.from}</span>
                            <span>•</span>
                            <span>MDA: {message.mda}</span>
                            <span>•</span>
                            <span>{new Date(message.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No messages from MDAs</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
