import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dialog";
import {
  MessageSquare,
  Bell,
  Search,
  Filter,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  AlertCircle,
  DollarSign,
  Building,
  Calendar,
  Award,
  Target,
  Download,
  Phone,
  Check,
} from "lucide-react";
import {
  messageService,
  type CompanyMessage,
  type MessageAction,
} from "@/lib/messageService";
import { formatCurrency } from "@/lib/utils";

interface CompanyMessageCenterProps {
  companyEmail?: string;
  onActionClick?: (action: MessageAction, message: CompanyMessage) => void;
}

const CompanyMessageCenter: React.FC<CompanyMessageCenterProps> = ({
  companyEmail,
  onActionClick,
}) => {
  const [messages, setMessages] = useState<CompanyMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<CompanyMessage[]>(
    [],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] = useState<CompanyMessage | null>(
    null,
  );
  const [showDetails, setShowDetails] = useState(false);

  // Load messages on component mount and subscribe to updates
  useEffect(() => {
    const loadMessages = () => {
      const allMessages = messageService.getMessages(companyEmail);
      setMessages(allMessages);
    };

    loadMessages();

    // Subscribe to message updates
    const unsubscribe = messageService.subscribe(loadMessages);

    // Cross-tab and cross-context listeners
    const onCustom = (e: any) => {
      const target = e?.detail?.email?.toLowerCase?.();
      if (!companyEmail || !target || companyEmail.toLowerCase() === target) {
        loadMessages();
      }
    };
    const onStorage = () => loadMessages();
    window.addEventListener(
      "companyMessagesUpdated",
      onCustom as EventListener,
    );
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(
        "companyMessagesUpdated",
        onCustom as EventListener,
      );
      window.removeEventListener("storage", onStorage);
      unsubscribe();
    };
  }, [companyEmail]);

  // Filter messages based on search term and filters
  useEffect(() => {
    let filtered = [...messages];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (message) =>
          message.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (message.metadata?.tenderTitle &&
            message.metadata.tenderTitle
              .toLowerCase()
              .includes(searchTerm.toLowerCase())),
      );
    }

    // Apply type filter
    if (filterType !== "all") {
      if (filterType === "unread") {
        filtered = filtered.filter((message) => !message.read);
      } else if (filterType === "read") {
        filtered = filtered.filter((message) => message.read);
      } else {
        filtered = filtered.filter((message) => message.type === filterType);
      }
    }

    // Apply category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter(
        (message) => message.category === filterCategory,
      );
    }

    setFilteredMessages(filtered);
  }, [messages, searchTerm, filterType, filterCategory]);

  const getMessageIcon = (type: CompanyMessage["type"]) => {
    switch (type) {
      case "bid_created":
        return <FileText className="h-5 w-5 text-blue-600" />;
      case "tender_closing_soon":
        return <Clock className="h-5 w-5 text-orange-600" />;
      case "tender_closed":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case "eoi_confirmed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "bid_confirmed":
        return <Award className="h-5 w-5 text-purple-600" />;
      case "bid_evaluated":
        return <Target className="h-5 w-5 text-indigo-600" />;
      case "contract_awarded":
        return <Award className="h-5 w-5 text-yellow-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: CompanyMessage["category"]) => {
    switch (category) {
      case "success":
        return "bg-green-100 text-green-800 border-green-200";
      case "warning":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      case "urgent":
        return "bg-red-100 text-red-800 border-red-300 animate-pulse";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const handleMarkAsRead = (messageId: string) => {
    messageService.markAsRead(messageId, companyEmail);
  };

  const handleMarkAllAsRead = () => {
    messageService.markAllAsRead(companyEmail);
  };

  const handleDeleteMessage = (messageId: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      messageService.deleteMessage(messageId, companyEmail);
    }
  };

  const handleActionClick = (
    action: MessageAction,
    message: CompanyMessage,
  ) => {
    if (onActionClick) {
      onActionClick(action, message);
    } else {
      // Default action handling
      console.log("Action clicked:", action, "for message:", message);
    }
  };

  const handleMessageClick = (message: CompanyMessage) => {
    if (!message.read) {
      handleMarkAsRead(message.id);
    }
    setSelectedMessage(message);
    setShowDetails(true);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return (
        "Today " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    } else if (diffDays === 2) {
      return (
        "Yesterday " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    } else if (diffDays < 7) {
      return (
        date.toLocaleDateString([], { weekday: "short" }) +
        " " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    } else {
      return (
        date.toLocaleDateString() +
        " " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    }
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <MessageSquare className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Message Center</h2>
            <p className="text-gray-600">
              Stay updated with tender notifications and status changes
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
              <Check className="h-4 w-4 mr-2" />
              Mark All Read ({unreadCount})
            </Button>
          )}
          <Badge className="bg-blue-100 text-blue-800">
            {messages.length} Total Messages
          </Badge>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Messages
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {messages.length}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-orange-600">
                  {unreadCount}
                </p>
              </div>
              <Bell className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tender Updates
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {
                    messages.filter(
                      (m) =>
                        m.type === "tender_closing_soon" ||
                        m.type === "tender_closed" ||
                        m.type === "bid_created",
                    ).length
                  }
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Confirmations
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {
                    messages.filter(
                      (m) =>
                        m.type === "eoi_confirmed" ||
                        m.type === "bid_confirmed",
                    ).length
                  }
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Messages</SelectItem>
                <SelectItem value="unread">Unread ({unreadCount})</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="bid_created">New Tenders</SelectItem>
                <SelectItem value="tender_closing_soon">
                  Closing Soon
                </SelectItem>
                <SelectItem value="tender_closed">Closed Tenders</SelectItem>
                <SelectItem value="eoi_confirmed">EOI Confirmations</SelectItem>
                <SelectItem value="bid_confirmed">Bid Confirmations</SelectItem>
                <SelectItem value="bid_evaluated">Evaluations</SelectItem>
                <SelectItem value="contract_awarded">Contracts</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="info">Information</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Messages ({filteredMessages.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredMessages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No messages found</p>
              <p className="text-sm">
                {searchTerm || filterType !== "all" || filterCategory !== "all"
                  ? "Try adjusting your filters to see more messages."
                  : "You'll receive notifications here when tenders are created, closed, or when you submit bids."}
              </p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => handleMessageClick(message)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !message.read
                      ? "bg-blue-50 border-l-4 border-l-blue-500"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getMessageIcon(message.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4
                            className={`text-sm font-medium text-gray-900 ${!message.read ? "font-bold" : ""}`}
                          >
                            {message.title}
                          </h4>
                          <Badge className={getCategoryColor(message.category)}>
                            {message.category}
                          </Badge>
                          {!message.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {message.message}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{formatTimestamp(message.timestamp)}</span>
                          {message.metadata?.tenderTitle && (
                            <span className="flex items-center">
                              <FileText className="h-3 w-3 mr-1" />
                              {message.metadata.tenderTitle}
                            </span>
                          )}
                          {message.metadata?.ministry && (
                            <span className="flex items-center">
                              <Building className="h-3 w-3 mr-1" />
                              {message.metadata.ministry}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {!message.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(message.id);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMessage(message.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  {message.actions && message.actions.length > 0 && (
                    <div className="mt-3 flex items-center space-x-2">
                      {message.actions.slice(0, 2).map((action) => (
                        <Button
                          key={action.id}
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActionClick(action, message);
                          }}
                          className="text-xs"
                        >
                          {action.action === "view_tender" && (
                            <ExternalLink className="h-3 w-3 mr-1" />
                          )}
                          {action.action === "download_document" && (
                            <Download className="h-3 w-3 mr-1" />
                          )}
                          {action.action === "contact_support" && (
                            <Phone className="h-3 w-3 mr-1" />
                          )}
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedMessage && getMessageIcon(selectedMessage.type)}
              <span>{selectedMessage?.title}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge className={getCategoryColor(selectedMessage.category)}>
                  {selectedMessage.category}
                </Badge>
                <span className="text-sm text-gray-500">
                  {formatTimestamp(selectedMessage.timestamp)}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-800 whitespace-pre-line">
                  {selectedMessage.message}
                </p>
              </div>

              {selectedMessage.metadata && (
                <div className="grid grid-cols-2 gap-4 bg-blue-50 rounded-lg p-4">
                  <div className="space-y-2">
                    {selectedMessage.metadata.tenderTitle && (
                      <div>
                        <label className="text-xs font-medium text-gray-600">
                          Tender
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedMessage.metadata.tenderTitle}
                        </p>
                      </div>
                    )}
                    {selectedMessage.metadata.ministry && (
                      <div>
                        <label className="text-xs font-medium text-gray-600">
                          Ministry
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedMessage.metadata.ministry}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {selectedMessage.metadata.value && (
                      <div>
                        <label className="text-xs font-medium text-gray-600">
                          Value
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedMessage.metadata.value}
                        </p>
                      </div>
                    )}
                    {selectedMessage.metadata.deadline && (
                      <div>
                        <label className="text-xs font-medium text-gray-600">
                          Deadline
                        </label>
                        <p className="text-sm text-gray-900">
                          {new Date(
                            selectedMessage.metadata.deadline,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedMessage.actions &&
                selectedMessage.actions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Available Actions
                    </h4>
                    <div className="space-y-2">
                      {selectedMessage.actions.map((action) => (
                        <Button
                          key={action.id}
                          variant="outline"
                          onClick={() =>
                            handleActionClick(action, selectedMessage)
                          }
                          className="w-full justify-start"
                        >
                          {action.action === "view_tender" && (
                            <ExternalLink className="h-4 w-4 mr-2" />
                          )}
                          {action.action === "download_document" && (
                            <Download className="h-4 w-4 mr-2" />
                          )}
                          {action.action === "contact_support" && (
                            <Phone className="h-4 w-4 mr-2" />
                          )}
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyMessageCenter;
