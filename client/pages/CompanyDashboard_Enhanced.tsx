import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/StaticAuthContext";
import { formatCurrency } from "@/lib/utils";
import { getDashboardConfig, type CompanyStatus } from "@/lib/dashboardConfig";
import { persistentStorage } from "@/lib/persistentStorage";
import { logUserAction } from "@/lib/auditLogStorage";
import CompanyMessageCenter from "@/components/CompanyMessageCenter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Home,
  Info,
  HelpCircle,
  Globe,
  ExternalLink,
  Phone,
  LogOut,
  AlertTriangle,
  CheckCircle,
  Ban,
  FileText,
  TrendingUp,
  Users,
  Clock,
  Bell,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Plus,
  Mail,
  Send,
  DollarSign,
  Award,
  Calendar,
  MapPin,
  Star,
  Upload,
  Settings,
  MessageSquare,
  CreditCard,
  BarChart3,
  FileCheck,
  AlertCircle,
  ChevronRight,
  Menu,
  X,
  Target,
  Bookmark,
  History,
  Shield,
  Gavel,
  Archive,
  Lock,
  RefreshCw,
} from "lucide-react";

type CompanyStatus = "Pending" | "Approved" | "Suspended" | "Blacklisted";

interface CompanyData {
  name: string;
  email: string;
  status: CompanyStatus;
  registrationDate: string;
  lastLogin: string;
  documents: {
    cac: { uploaded: boolean; verified: boolean };
    tax: { uploaded: boolean; verified: boolean };
    experience: { uploaded: boolean; verified: boolean };
    financial: { uploaded: boolean; verified: boolean };
  };
}

export default function CompanyDashboardEnhanced() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: "Sample Company Ltd",
    email: "company@example.com",
    status: "Approved",
    registrationDate: "2024-01-15",
    lastLogin: "2024-12-15",
    documents: {
      cac: { uploaded: true, verified: true },
      tax: { uploaded: true, verified: true },
      experience: { uploaded: true, verified: false },
      financial: { uploaded: false, verified: false },
    },
  });

  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 min-h-screen">
      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden rounded-xl bg-white/90 backdrop-blur-sm border border-teal-100 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/5 to-cyan-600/5"></div>
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl shadow-lg">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-teal-800 to-cyan-800 bg-clip-text text-transparent">
                    Company Dashboard
                  </h2>
                  <p className="text-lg text-gray-600 font-medium">
                    Complete procurement and tendering management platform
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 font-medium">
                    System Active
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                      companyData.status === "Approved"
                        ? "bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800"
                        : companyData.status === "Pending"
                          ? "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800"
                          : companyData.status === "Suspended"
                            ? "bg-gradient-to-r from-orange-100 to-red-100 text-orange-800"
                            : "bg-gradient-to-r from-red-100 to-rose-100 text-red-800"
                    }`}
                  >
                    {companyData.status === "Approved" && (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    )}
                    {companyData.status === "Pending" && (
                      <Clock className="h-4 w-4 mr-1" />
                    )}
                    {companyData.status === "Suspended" && (
                      <AlertTriangle className="h-4 w-4 mr-1" />
                    )}
                    {companyData.status === "Blacklisted" && (
                      <Ban className="h-4 w-4 mr-1" />
                    )}
                    {companyData.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  // Navigation function
                }}
                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-lg"
              >
                <Search className="h-5 w-5 mr-2" />
                Browse Tenders
              </button>
              <button
                onClick={() => {
                  // Navigation function
                }}
                className="border-teal-200 text-teal-700 hover:bg-teal-50 border px-6 py-3 rounded-lg"
              >
                <FileCheck className="h-4 w-4 mr-2" />
                My Documents
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-teal-100 shadow-lg p-2">
          <TabsList className="grid w-full grid-cols-6 bg-transparent gap-1">
            <TabsTrigger
              value="dashboard"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-teal-50 border border-transparent data-[state=active]:border-teal-200"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="font-medium">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger
              value="tenders"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-blue-50 border border-transparent data-[state=active]:border-blue-200"
            >
              <FileText className="h-4 w-4" />
              <span className="font-medium">Tenders</span>
            </TabsTrigger>
            <TabsTrigger
              value="bids"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-emerald-50 border border-transparent data-[state=active]:border-emerald-200"
            >
              <Target className="h-4 w-4" />
              <span className="font-medium">My Bids</span>
            </TabsTrigger>
            <TabsTrigger
              value="contracts"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-purple-50 border border-transparent data-[state=active]:border-purple-200"
            >
              <FileCheck className="h-4 w-4" />
              <span className="font-medium">Contracts</span>
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-amber-50 border border-transparent data-[state=active]:border-amber-200"
            >
              <Users className="h-4 w-4" />
              <span className="font-medium">Profile</span>
            </TabsTrigger>
            <TabsTrigger
              value="support"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-rose-50 border border-transparent data-[state=active]:border-rose-200"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="font-medium">Support</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-100 shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Tenders
                  </p>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                </div>
                <FileText className="h-8 w-8 text-teal-600" />
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100 shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Submitted Bids
                  </p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-emerald-100 shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Won Contracts
                  </p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
                <Award className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-purple-100 shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Value
                  </p>
                  <p className="text-2xl font-bold text-gray-900">₦2.5B</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tenders" className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100 shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Available Tenders
            </h3>
            <p className="text-gray-600">
              Tender listings will be displayed here...
            </p>
          </div>
        </TabsContent>

        <TabsContent value="bids" className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-emerald-100 shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              My Bid Submissions
            </h3>
            <p className="text-gray-600">
              Your bid history will be displayed here...
            </p>
          </div>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-purple-100 shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Awarded Contracts
            </h3>
            <p className="text-gray-600">
              Your awarded contracts will be displayed here...
            </p>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-amber-100 shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Company Profile
            </h3>
            <p className="text-gray-600">
              Company information and documents...
            </p>
          </div>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-rose-100 shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Support & Help
            </h3>
            <p className="text-gray-600">
              Contact support and view help resources...
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
