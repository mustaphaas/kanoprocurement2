import React, { useState, useRef, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  MessageSquare,
  Send,
  Plus,
  Search,
  Filter,
  Users,
  Building,
  Calendar,
  Paperclip,
  Eye,
  EyeOff,
  MoreHorizontal,
  Archive,
  Phone,
  Video,
  Star,
  Reply,
  Clock,
  Check,
  CheckCheck,
} from "lucide-react";

interface Conversation {
  id: string;
  subject: string;
  participants: string[];
  mdaId: string;
  mdaName: string;
  lastMessageAt: string;
  unreadCount: number;
  relatedType: "alert" | "contract" | "tender" | "procurement_plan";
  relatedId: string;
  isStarred: boolean;
  isArchived: boolean;
}

interface Message {
  id: string;
  conversationId: string;
  from: string;
  fromRole: string;
  body: string;
  attachments: string[];
  timestamp: string;
  isRead: boolean;
  isDelivered: boolean;
}

interface CollaborationCenterProps {
  conversations: Conversation[];
  messages: Message[];
  currentUser: string;
  onSendMessage: (
    conversationId: string,
    message: string,
    attachments?: string[],
  ) => void;
  onCreateConversation: (
    subject: string,
    mdaId: string,
    relatedType: string,
    relatedId: string,
  ) => void;
  onMarkAsRead: (conversationId: string) => void;
  onToggleStarred: (conversationId: string) => void;
  onArchiveConversation: (conversationId: string) => void;
}

const CollaborationCenter: React.FC<CollaborationCenterProps> = ({
  conversations,
  messages,
  currentUser,
  onSendMessage,
  onCreateConversation,
  onMarkAsRead,
  onToggleStarred,
  onArchiveConversation,
}) => {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newConversationData, setNewConversationData] = useState({
    subject: "",
    mdaId: "",
    relatedType: "",
    relatedId: "",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedConversation]);

  const filteredConversations = conversations
    .filter((conv) => {
      if (conv.isArchived && filterType !== "archived") return false;
      if (filterType === "starred" && !conv.isStarred) return false;
      if (filterType === "unread" && conv.unreadCount === 0) return false;
      if (filterType === "archived" && !conv.isArchived) return false;

      if (searchTerm) {
        return (
          conv.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conv.mdaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conv.participants.some((p) =>
            p.toLowerCase().includes(searchTerm.toLowerCase()),
          )
        );
      }

      return true;
    })
    .sort((a, b) => {
      // Sort by last message time, most recent first
      return (
        new Date(b.lastMessageAt).getTime() -
        new Date(a.lastMessageAt).getTime()
      );
    });

  const conversationMessages = messages
    .filter(
      (msg) =>
        selectedConversation && msg.conversationId === selectedConversation.id,
    )
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

  const handleSendMessage = () => {
    if (selectedConversation && newMessage.trim()) {
      onSendMessage(selectedConversation.id, newMessage);
      setNewMessage("");
    }
  };

  const handleCreateConversation = () => {
    if (newConversationData.subject && newConversationData.mdaId) {
      onCreateConversation(
        newConversationData.subject,
        newConversationData.mdaId,
        newConversationData.relatedType,
        newConversationData.relatedId,
      );
      setNewConversationData({
        subject: "",
        mdaId: "",
        relatedType: "",
        relatedId: "",
      });
      setShowNewConversation(false);
    }
  };

  const getRelatedTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      alert: "bg-red-100 text-red-800",
      contract: "bg-blue-100 text-blue-800",
      tender: "bg-green-100 text-green-800",
      procurement_plan: "bg-purple-100 text-purple-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const formatTime = (timestamp: string) => {
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
        date.toLocaleDateString([], { month: "short", day: "numeric" }) +
        " " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    }
  };

  const totalUnreadCount = conversations.reduce(
    (sum, conv) => sum + conv.unreadCount,
    0,
  );
  const starredCount = conversations.filter((conv) => conv.isStarred).length;
  const archivedCount = conversations.filter((conv) => conv.isArchived).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Collaboration Center
          </h1>
          <p className="text-gray-600 mt-1">
            Communicate with MDAs and resolve issues in real-time
          </p>
        </div>
        <Dialog
          open={showNewConversation}
          onOpenChange={setShowNewConversation}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Conversation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start New Conversation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Enter conversation subject..."
                  value={newConversationData.subject}
                  onChange={(e) =>
                    setNewConversationData((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="mda">Select MDA</Label>
                <Select
                  value={newConversationData.mdaId}
                  onValueChange={(value) =>
                    setNewConversationData((prev) => ({
                      ...prev,
                      mdaId: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose MDA..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mda-health">
                      Ministry of Health
                    </SelectItem>
                    <SelectItem value="mda-education">
                      Ministry of Education
                    </SelectItem>
                    <SelectItem value="mda-works">Ministry of Works</SelectItem>
                    <SelectItem value="mda-agriculture">
                      Ministry of Agriculture
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="relatedType">Related To</Label>
                <Select
                  value={newConversationData.relatedType}
                  onValueChange={(value) =>
                    setNewConversationData((prev) => ({
                      ...prev,
                      relatedType: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alert">Alert</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="tender">Tender</SelectItem>
                    <SelectItem value="procurement_plan">
                      Procurement Plan
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="relatedId">Related ID</Label>
                <Input
                  id="relatedId"
                  placeholder="Enter related ID (optional)..."
                  value={newConversationData.relatedId}
                  onChange={(e) =>
                    setNewConversationData((prev) => ({
                      ...prev,
                      relatedId: e.target.value,
                    }))
                  }
                />
              </div>
              <Button onClick={handleCreateConversation} className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Start Conversation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-md border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Conversations
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {conversations.length}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Unread Messages
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {totalUnreadCount}
                </p>
              </div>
              <Eye className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Starred</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {starredCount}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-l-4 border-l-gray-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Archived</p>
                <p className="text-2xl font-bold text-gray-600">
                  {archivedCount}
                </p>
              </div>
              <Archive className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chat Interface */}
      <Card className="h-[600px]">
        <CardContent className="p-0 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
            {/* Conversations List */}
            <div className="border-r bg-gray-50 h-full flex flex-col">
              <div className="p-4 border-b bg-white">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter conversations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Conversations</SelectItem>
                      <SelectItem value="unread">
                        Unread ({totalUnreadCount})
                      </SelectItem>
                      <SelectItem value="starred">
                        Starred ({starredCount})
                      </SelectItem>
                      <SelectItem value="archived">
                        Archived ({archivedCount})
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    No conversations found.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => {
                          setSelectedConversation(conversation);
                          if (conversation.unreadCount > 0) {
                            onMarkAsRead(conversation.id);
                          }
                        }}
                        className={`p-4 cursor-pointer border-b transition-colors hover:bg-white ${
                          selectedConversation?.id === conversation.id
                            ? "bg-white border-blue-200"
                            : "bg-gray-50"
                        } ${conversation.unreadCount > 0 ? "font-medium" : ""}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-sm">
                              {conversation.mdaName}
                            </span>
                            {conversation.isStarred && (
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-red-500 text-white text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-900 mb-1 truncate">
                          {conversation.subject}
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge
                            className={getRelatedTypeColor(
                              conversation.relatedType,
                            )}
                          >
                            {conversation.relatedType.replace("_", " ")}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatTime(conversation.lastMessageAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Message Area */}
            <div className="lg:col-span-2 h-full flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Conversation Header */}
                  <div className="p-4 border-b bg-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {selectedConversation.subject}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {selectedConversation.mdaName}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {selectedConversation.participants.length}{" "}
                            participants
                          </div>
                          <Badge
                            className={getRelatedTypeColor(
                              selectedConversation.relatedType,
                            )}
                          >
                            {selectedConversation.relatedType.replace("_", " ")}
                          </Badge>
                          {selectedConversation.relatedId && (
                            <span>ID: {selectedConversation.relatedId}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            onToggleStarred(selectedConversation.id)
                          }
                        >
                          <Star
                            className={`h-4 w-4 ${selectedConversation.isStarred ? "text-yellow-500 fill-yellow-500" : ""}`}
                          />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            onArchiveConversation(selectedConversation.id)
                          }
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {conversationMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.from === currentUser ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.from === currentUser
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          {message.from !== currentUser && (
                            <div className="text-xs font-medium mb-1">
                              {message.from} ({message.fromRole})
                            </div>
                          )}
                          <div className="text-sm">{message.body}</div>
                          {message.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {message.attachments.map((attachment, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-1 text-xs"
                                >
                                  <Paperclip className="h-3 w-3" />
                                  {attachment}
                                </div>
                              ))}
                            </div>
                          )}
                          <div
                            className={`text-xs mt-1 flex items-center gap-1 ${
                              message.from === currentUser
                                ? "text-blue-100"
                                : "text-gray-500"
                            }`}
                          >
                            <Clock className="h-3 w-3" />
                            {formatTime(message.timestamp)}
                            {message.from === currentUser && (
                              <>
                                {message.isDelivered ? (
                                  <CheckCheck className="h-3 w-3" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t bg-white">
                    <div className="flex items-center gap-2">
                      <Textarea
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="flex-1 min-h-[40px] max-h-[120px] resize-none"
                      />
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-sm">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollaborationCenter;
