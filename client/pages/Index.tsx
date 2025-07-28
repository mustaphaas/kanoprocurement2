import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  FileText,
  Users,
  Bell,
  LogIn,
  UserPlus,
  Menu,
  Search,
  CheckCircle,
  Shield,
  Globe,
  TrendingUp,
  DollarSign,
  Clock,
  Eye,
  ArrowRight,
  MapPin,
  Award,
  Download,
  X
} from "lucide-react";

interface FeaturedTender {
  id: string;
  title: string;
  description: string;
  value: string;
  deadline: string;
  status: string;
  statusColor: string;
  category: string;
}

export default function Index() {
  const [currentTenderIndex, setCurrentTenderIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const featuredTenders: FeaturedTender[] = [
    {
      id: "KS-2024-001",
      title: "Road Construction Project",
      description: "Construction of 50km rural roads to improve connectivity across Kano North LGA",
      value: "₦2.5B",
      deadline: "Feb 15, 2024",
      status: "Open",
      statusColor: "bg-green-100 text-green-800",
      category: "Infrastructure"
    },
    {
      id: "KS-2024-005",
      title: "Healthcare Equipment Supply",
      description: "Supply and installation of modern medical equipment for 25 primary healthcare centers",
      value: "₦1.8B",
      deadline: "Feb 28, 2024",
      status: "Open",
      statusColor: "bg-green-100 text-green-800",
      category: "Healthcare"
    },
    {
      id: "KS-2024-012",
      title: "School Infrastructure Upgrade",
      description: "Renovation and modernization of 15 public secondary schools across rural areas",
      value: "₦3.2B",
      deadline: "Mar 10, 2024",
      status: "Open",
      statusColor: "bg-green-100 text-green-800",
      category: "Education"
    },
    {
      id: "KS-2024-008",
      title: "ICT Infrastructure Development",
      description: "Fiber optic network expansion to connect all LGA headquarters",
      value: "₦4.1B",
      deadline: "Feb 20, 2024",
      status: "Closing Soon",
      statusColor: "bg-orange-100 text-orange-800",
      category: "Technology"
    },
    {
      id: "KS-2024-003",
      title: "Water Treatment Plant",
      description: "Construction of modern water treatment facility serving 200,000 residents",
      value: "₦5.7B",
      deadline: "Mar 05, 2024",
      status: "Open",
      statusColor: "bg-green-100 text-green-800",
      category: "Infrastructure"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTenderIndex((prev) => (prev + 1) % featuredTenders.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [featuredTenders.length]);

  const currentTender = featuredTenders[currentTenderIndex];

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-green-700">KanoProc</h1>
                <p className="text-xs text-gray-600">Kano State E-Procurement Portal</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#home" className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-green-700 bg-green-50">
                <Building2 className="h-4 w-4" />
                <span>Home</span>
              </a>
              <a href="#tenders" className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-green-700">
                <FileText className="h-4 w-4" />
                <span>Tenders</span>
              </a>
              <a href="#about" className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-green-700">
                <Users className="h-4 w-4" />
                <span>About</span>
              </a>
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <button className="hidden md:flex items-center px-3 py-2 text-gray-600 hover:text-green-700">
                <Bell className="h-4 w-4" />
              </button>
              <button className="hidden sm:flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:text-green-700">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </button>
              <Link to="/register" className="hidden sm:flex items-center px-4 py-2 bg-green-700 text-white rounded-md text-sm font-medium hover:bg-green-800">
                <UserPlus className="h-4 w-4 mr-2" />
                Register
              </Link>
              <button 
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="space-y-2">
                <a href="#home" className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-green-700 bg-green-50">
                  <Building2 className="h-4 w-4" />
                  <span>Home</span>
                </a>
                <a href="#tenders" className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-green-700">
                  <FileText className="h-4 w-4" />
                  <span>Tenders</span>
                </a>
                <a href="#about" className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-green-700">
                  <Users className="h-4 w-4" />
                  <span>About</span>
                </a>
                <div className="pt-4 border-t space-y-2">
                  <button className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-green-700 w-full">
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </button>
                  <button className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium bg-green-700 text-white hover:bg-green-800 w-full">
                    <UserPlus className="h-4 w-4" />
                    <span>Register</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section id="home" className="bg-gradient-to-br from-green-50 via-white to-green-25 py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Official Government Portal
                  </span>
                  <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    Kano State
                    <span className="text-green-700 block">E-Procurement</span>
                    Portal
                  </h1>
                  <p className="text-xl text-gray-600 max-w-lg">
                    Transparent, efficient, and digital procurement platform connecting government 
                    opportunities with qualified vendors across Kano State.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="inline-flex items-center px-8 py-4 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800">
                    <Building2 className="mr-2 h-5 w-5" />
                    Register Your Company
                  </button>
                  <button className="inline-flex items-center px-8 py-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
                    <Search className="mr-2 h-5 w-5" />
                    Browse Tenders
                  </button>
                </div>

                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Verified Vendors Only</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span>Secure Platform</span>
                  </div>
                </div>
              </div>

              {/* Animated Tender Slideshow */}
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-100 to-green-50 rounded-3xl transform rotate-6"></div>
                  <div className="relative bg-white rounded-3xl shadow-2xl p-8 transform -rotate-2 overflow-hidden">
                    {/* Progress bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
                      <div 
                        className="h-full bg-green-700 transition-all duration-[4000ms] ease-linear"
                        style={{ width: `${((currentTenderIndex + 1) / featuredTenders.length) * 100}%` }}
                      ></div>
                    </div>
                    
                    {/* Slideshow content */}
                    <div className="space-y-6 transition-all duration-500 ease-in-out">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                            <FileText className="h-6 w-6 text-green-700" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Featured Tender</h3>
                            <p className="text-sm text-gray-600">{currentTender.id}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentTender.statusColor}`}>
                          {currentTender.status}
                        </span>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-lg">{currentTender.title}</h4>
                          <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">{currentTender.category}</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">
                          {currentTender.description}
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Value:</span>
                            <span className="font-medium">{currentTender.value}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Deadline:</span>
                            <span className="font-medium">{currentTender.deadline}</span>
                          </div>
                        </div>
                      </div>

                      {/* Navigation dots */}
                      <div className="flex justify-center space-x-2 pt-4">
                        {featuredTenders.map((_, index) => (
                          <button
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              index === currentTenderIndex
                                ? 'bg-green-700 w-6'
                                : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                            onClick={() => setCurrentTenderIndex(index)}
                          />
                        ))}
                      </div>

                      {/* Action button */}
                      <button className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Active Tenders */}
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Active Tenders</p>
                    <p className="text-3xl font-bold text-gray-900">127</p>
                    <p className="text-green-600 text-sm font-medium mt-1">+12%</p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-green-700" />
                  </div>
                </div>
              </div>

              {/* Registered Companies */}
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Registered Companies</p>
                    <p className="text-3xl font-bold text-gray-900">2,847</p>
                    <p className="text-green-600 text-sm font-medium mt-1">+8%</p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-green-700" />
                  </div>
                </div>
              </div>

              {/* Completed Projects */}
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Completed Projects</p>
                    <p className="text-3xl font-bold text-gray-900">1,236</p>
                    <p className="text-green-600 text-sm font-medium mt-1">+15%</p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-700" />
                  </div>
                </div>
              </div>

              {/* Total Value */}
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Value (₦)</p>
                    <p className="text-3xl font-bold text-gray-900">45.2B</p>
                    <p className="text-green-600 text-sm font-medium mt-1">+22%</p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-700" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20" id="about">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Why Choose KanoProc?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our platform is designed to make procurement fair, efficient, and transparent 
                for both government agencies and vendors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow border">
                <div className="w-16 h-16 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-green-700" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Transparent Process</h3>
                <p className="text-gray-600">Open and transparent procurement process with full audit trails and accountability.</p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow border">
                <div className="w-16 h-16 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-green-700" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Digital First</h3>
                <p className="text-gray-600">Fully digital procurement process reducing paperwork and increasing efficiency.</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow border">
                <div className="w-16 h-16 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-700" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Fair Competition</h3>
                <p className="text-gray-600">Equal opportunities for all qualified vendors through standardized processes.</p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow border">
                <div className="w-16 h-16 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-green-700" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Growth Focused</h3>
                <p className="text-gray-600">Supporting local businesses and economic growth in Kano State.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Tenders Section */}
        <section id="tenders" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  Recent Tenders
                </h2>
                <p className="text-xl text-gray-600">
                  Latest procurement opportunities from Kano State Government
                </p>
              </div>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                View All Tenders
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tender 1 */}
              <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow border">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mb-2">
                      KS-2024-001
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Open
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
                    Construction of 50km Rural Roads in Kano North
                  </h3>
                  <p className="text-green-700 font-medium mb-4">Infrastructure</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-600">Value</p>
                      <p className="font-semibold text-lg">₦2.5B</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Deadline</p>
                      <p className="font-medium">2024-02-15</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-4">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>Kano North LGA</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>245 views</span>
                    </div>
                  </div>

                  <button className="w-full mt-4 inline-flex items-center justify-center px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800">
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Tender 2 */}
              <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow border">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mb-2">
                      KS-2024-002
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Open
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
                    Supply of Medical Equipment for Primary Healthcare Centers
                  </h3>
                  <p className="text-green-700 font-medium mb-4">Healthcare</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-600">Value</p>
                      <p className="font-semibold text-lg">₦850M</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Deadline</p>
                      <p className="font-medium">2024-02-20</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-4">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>Statewide</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>189 views</span>
                    </div>
                  </div>

                  <button className="w-full mt-4 inline-flex items-center justify-center px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800">
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Tender 3 */}
              <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow border">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mb-2">
                      KS-2024-003
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Closing Soon
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
                    ICT Infrastructure Upgrade for Government Offices
                  </h3>
                  <p className="text-green-700 font-medium mb-4">Technology</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-600">Value</p>
                      <p className="font-semibold text-lg">₦1.2B</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Deadline</p>
                      <p className="font-medium">2024-02-10</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-4">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>Kano Municipal</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>167 views</span>
                    </div>
                  </div>

                  <button className="w-full mt-4 inline-flex items-center justify-center px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800">
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Insights Section */}
        <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
                <Globe className="h-4 w-4 mr-2" />
                Powered by Artificial Intelligence
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                AI-Driven Procurement Intelligence
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Leveraging advanced AI technologies to make procurement smarter, faster, and more transparent
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              {/* AI Features */}
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Tender Matching</h3>
                    <p className="text-gray-600">
                      AI algorithms automatically match vendors with relevant tenders based on their expertise, 
                      past performance, and capacity, increasing bid quality by 40%.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Fraud Detection & Risk Assessment</h3>
                    <p className="text-gray-600">
                      Machine learning models analyze bidding patterns and vendor behavior to detect anomalies 
                      and prevent fraudulent activities in real-time.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Predictive Project Analytics</h3>
                    <p className="text-gray-600">
                      AI forecasts project completion timelines, budget requirements, and potential risks 
                      based on historical data and market conditions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Automated Document Processing</h3>
                    <p className="text-gray-600">
                      Natural language processing automatically extracts and validates information from 
                      tender documents, reducing processing time by 75%.
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Dashboard Mockup */}
              <div className="relative">
                <div className="bg-white shadow-2xl rounded-lg border">
                  <div className="p-6 pb-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">AI Procurement Dashboard</h3>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600 font-medium">Live Analysis</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-6">
                    {/* AI Insights Widget */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm text-gray-600">CURRENT INSIGHTS</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium">Tender Optimization</p>
                              <p className="text-xs text-gray-600">3 tenders can be combined for efficiency</p>
                            </div>
                          </div>
                          <span className="text-xs font-medium text-blue-600">+15% savings</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium">Vendor Performance</p>
                              <p className="text-xs text-gray-600">Top performers identified for fast-track</p>
                            </div>
                          </div>
                          <span className="text-xs font-medium text-green-600">98% accuracy</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium">Risk Alert</p>
                              <p className="text-xs text-gray-600">Market price fluctuation detected</p>
                            </div>
                          </div>
                          <span className="text-xs font-medium text-orange-600">Monitor</span>
                        </div>
                      </div>
                    </div>

                    {/* AI Metrics */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">92%</div>
                        <div className="text-xs text-gray-600">Match Accuracy</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">1.2s</div>
                        <div className="text-xs text-gray-600">Avg Processing</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">₦8.2B</div>
                        <div className="text-xs text-gray-600">AI Savings</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">99.8%</div>
                        <div className="text-xs text-gray-600">Fraud Detection</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-bounce">
                  <Globe className="h-4 w-4 text-white" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center animate-pulse">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>

            {/* AI Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-0">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-blue-700 mb-1">2.3M</div>
                <div className="text-sm text-blue-600">Documents Processed</div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-0">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-purple-700 mb-1">847</div>
                <div className="text-sm text-purple-600">Risks Prevented</div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-0">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-green-700 mb-1">65%</div>
                <div className="text-sm text-green-600">Time Reduction</div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border-0">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-orange-700 mb-1">₦12.8B</div>
                <div className="text-sm text-orange-600">Cost Optimized</div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center mt-12">
              <button className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Globe className="mr-2 h-4 w-4" />
                Explore AI Features
              </button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-green-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl lg:text-4xl font-bold">
                Ready to Start Bidding?
              </h2>
              <p className="text-xl text-green-100">
                Join thousands of registered vendors and access exclusive government 
                procurement opportunities in Kano State.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="inline-flex items-center px-8 py-4 bg-white text-green-700 rounded-lg font-medium hover:bg-gray-50">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Register Now
                </button>
                <button className="inline-flex items-center px-8 py-4 border border-white text-white rounded-lg font-medium hover:bg-green-600">
                  <FileText className="mr-2 h-5 w-5" />
                  Read Guidelines
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-green-700">KanoProc</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4 max-w-md">
                Kano State Government's official e-procurement portal. Streamlining government 
                procurement processes through digital transformation for transparency and efficiency.
              </p>
              <div className="text-xs text-gray-600">
                © 2024 Kano State Government. All rights reserved.
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#tenders" className="text-gray-600 hover:text-green-700">Browse Tenders</a></li>
                <li><a href="#" className="text-gray-600 hover:text-green-700">Company Registration</a></li>
                <li><a href="#" className="text-gray-600 hover:text-green-700">Bidding Guidelines</a></li>
                <li><a href="#" className="text-gray-600 hover:text-green-700">Contact Support</a></li>
              </ul>
            </div>

            {/* Government Links */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Government</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://kanostate.gov.ng/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-green-700">Kano State Website</a></li>
                <li><a href="#" className="text-gray-600 hover:text-green-700">Transparency Portal</a></li>
                <li><a href="#" className="text-gray-600 hover:text-green-700">Procurement Policies</a></li>
                <li><a href="#" className="text-gray-600 hover:text-green-700">Annual Reports</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
