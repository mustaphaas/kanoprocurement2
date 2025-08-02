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
  X,
  Calendar,
  AlertTriangle,
  Zap,
  Star,
  Lightbulb,
  Target,
  Newspaper,
  PlayCircle,
  MessageSquare,
  Phone,
  Mail,
  BarChart3
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
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showPolicies, setShowPolicies] = useState(false);
  const [selectedTender, setSelectedTender] = useState<any>(null);
  const [showTenderDetails, setShowTenderDetails] = useState(false);

  // Comprehensive tender data
  const recentTenders = [
    {
      id: "KS-2024-001",
      title: "Construction of 50km Rural Roads in Kano North",
      category: "Infrastructure",
      value: "₦2.5B",
      deadline: "2024-02-15",
      location: "Kano North LGA",
      views: 245,
      status: "Open",
      description: "The project involves the construction and upgrading of 50 kilometers of rural roads in Kano North Local Government Area to improve connectivity and access to rural communities.",
      publishDate: "2024-01-15",
      closingDate: "2024-02-15",
      tenderFee: "���25,000",
      procuringEntity: "Kano State Ministry of Works",
      duration: "18 months",
      eligibility: "Category C contractors with road construction experience",
      requirements: [
        "Valid CAC certificate",
        "Tax clearance for last 3 years",
        "Professional license for civil engineering",
        "Evidence of similar projects (minimum 3)",
        "Financial capacity of at least ₦500M"
      ],
      technicalSpecs: [
        "Road width: 7.3 meters",
        "Pavement type: Flexible pavement with asphalt concrete wearing course",
        "Base course: Crushed stone base 150mm thick",
        "Sub-base: Selected material 200mm thick",
        "Drainage: Concrete lined drains on both sides"
      ]
    },
    {
      id: "KS-2024-002",
      title: "Supply of Medical Equipment to Primary Health Centers",
      category: "Healthcare",
      value: "₦850M",
      deadline: "2024-02-20",
      location: "Statewide",
      views: 189,
      status: "Open",
      description: "Procurement of essential medical equipment for 50 Primary Health Centers across Kano State to improve healthcare delivery and patient outcomes.",
      publishDate: "2024-01-20",
      closingDate: "2024-02-20",
      tenderFee: "₦15,000",
      procuringEntity: "Kano State Ministry of Health",
      duration: "6 months",
      eligibility: "Category B suppliers with healthcare equipment experience",
      requirements: [
        "Valid business registration",
        "ISO certification for medical devices",
        "Tax clearance certificates",
        "Manufacturer authorization letters",
        "After-sales service capability"
      ],
      technicalSpecs: [
        "Digital X-ray machines: 10 units",
        "Patient monitors: 50 units",
        "Ultrasound machines: 15 units",
        "Laboratory equipment: Complete set for 50 centers",
        "Installation and training included"
      ]
    },
    {
      id: "KS-2024-003",
      title: "Rehabilitation of Government Secondary Schools",
      category: "Education",
      value: "₦1.8B",
      deadline: "2024-02-25",
      location: "Various LGAs",
      views: 156,
      status: "Open",
      description: "Comprehensive rehabilitation and renovation of 25 government secondary schools across Kano State including classroom blocks, laboratories, and recreational facilities.",
      publishDate: "2024-01-25",
      closingDate: "2024-02-25",
      tenderFee: "₦20,000",
      procuringEntity: "Kano State Ministry of Education",
      duration: "12 months",
      eligibility: "Category C contractors with school construction experience",
      requirements: [
        "Valid contractor registration",
        "Professional indemnity insurance",
        "Evidence of school projects completed",
        "Qualified project management team",
        "Environmental impact assessment capability"
      ],
      technicalSpecs: [
        "Classroom renovation: 150 classrooms",
        "Laboratory upgrade: 50 science labs",
        "Library facilities: 25 libraries",
        "Sports facilities: Football fields and courts",
        "Solar power installation for all schools"
      ]
    }
  ];

  const handleViewTenderDetails = (tender: any) => {
    setSelectedTender(tender);
    setShowTenderDetails(true);
  };
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
              <Link to="/login" className="hidden sm:flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:text-green-700">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Link>
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
                  <Link to="/login" className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-green-700 w-full">
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </Link>
                  <Link to="/register" className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium bg-green-700 text-white hover:bg-green-800 w-full">
                    <UserPlus className="h-4 w-4" />
                    <span>Register</span>
                  </Link>
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
                  <Link to="/register" className="inline-flex items-center px-8 py-4 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800">
                    <Building2 className="mr-2 h-5 w-5" />
                    Register Your Company
                  </Link>
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

        {/* Latest News & Announcements */}
        <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
                <Newspaper className="h-4 w-4 mr-2" />
                Latest Updates
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                News & Announcements
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Stay informed with the latest procurement news, policy updates, and system enhancements
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Breaking News */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Zap className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          BREAKING
                        </span>
                        <span className="text-sm text-gray-500">2 hours ago</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        New AI-Powered Fraud Detection System Launched
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Kano State introduces advanced AI technology to detect and prevent fraudulent activities in procurement processes, increasing security by 99.8%.
                      </p>
                      <button className="inline-flex items-center text-red-600 hover:text-red-700 font-medium text-sm">
                        Read More <ArrowRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Award className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ACHIEVEMENT
                        </span>
                        <span className="text-sm text-gray-500">1 day ago</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        KanoProc Wins National Digital Excellence Award
                      </h3>
                      <p className="text-gray-600 mb-4">
                        The portal has been recognized for outstanding innovation in public procurement digitalization, setting standards for other states.
                      </p>
                      <button className="inline-flex items-center text-green-600 hover:text-green-700 font-medium text-sm">
                        Read More <ArrowRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          UPDATE
                        </span>
                        <span className="text-sm text-gray-500">3 days ago</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Enhanced Mobile App Now Available
                      </h3>
                      <p className="text-gray-600 mb-4">
                        New mobile application features real-time notifications, offline document access, and streamlined bidding process for contractors.
                      </p>
                      <button className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm">
                        Read More <ArrowRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions & Updates */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center space-x-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                      <PlayCircle className="h-5 w-5 text-green-600" />
                      <span className="text-green-800 font-medium">Watch Tutorial</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                      <Download className="h-5 w-5 text-blue-600" />
                      <span className="text-blue-800 font-medium">Download Guidelines</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                      <MessageSquare className="h-5 w-5 text-purple-600" />
                      <span className="text-purple-800 font-medium">Contact Support</span>
                    </button>
                  </div>
                </div>

                {/* System Status */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Platform Status</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-green-600">Operational</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Server Uptime</span>
                      <span className="text-sm font-medium text-gray-900">99.9%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Users</span>
                      <span className="text-sm font-medium text-gray-900">1,247 online</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Response Time</span>
                      <span className="text-sm font-medium text-gray-900">0.8s avg</span>
                    </div>
                  </div>
                </div>

                {/* Upcoming Events */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-yellow-400 pl-4">
                      <p className="text-sm font-medium text-gray-900">Virtual Vendor Training</p>
                      <p className="text-xs text-gray-600">Feb 15, 2024 • 10:00 AM</p>
                    </div>
                    <div className="border-l-4 border-blue-400 pl-4">
                      <p className="text-sm font-medium text-gray-900">Pre-bid Conference</p>
                      <p className="text-xs text-gray-600">Feb 20, 2024 • 2:00 PM</p>
                    </div>
                    <div className="border-l-4 border-green-400 pl-4">
                      <p className="text-sm font-medium text-gray-900">System Maintenance</p>
                      <p className="text-xs text-gray-600">Feb 25, 2024 • 12:00 AM</p>
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
              <Link to="/tenders" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                View All Tenders
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
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

                  <button
                    onClick={() => handleViewTenderDetails(recentTenders[0])}
                    className="w-full mt-4 inline-flex items-center justify-center px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors"
                  >
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

                  <button
                    onClick={() => handleViewTenderDetails(recentTenders[1])}
                    className="w-full mt-4 inline-flex items-center justify-center px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors"
                  >
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

                  <button
                    onClick={() => handleViewTenderDetails(recentTenders[2])}
                    className="w-full mt-4 inline-flex items-center justify-center px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors"
                  >
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
                <Link to="/register" className="inline-flex items-center px-8 py-4 bg-white text-green-700 rounded-lg font-medium hover:bg-gray-50">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Register Now
                </Link>
                <button
                  onClick={() => setShowGuidelines(true)}
                  className="inline-flex items-center px-8 py-4 border border-white text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Read Guidelines
                </button>
                <button
                  onClick={() => setShowPolicies(true)}
                  className="inline-flex items-center px-8 py-4 bg-white text-green-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  <Shield className="mr-2 h-5 w-5" />
                  Procurement Policies
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

      {/* Guidelines Modal */}
      {showGuidelines && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-start justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowGuidelines(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Kano State E-Procurement Guidelines</h2>
                  <button
                    onClick={() => setShowGuidelines(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-6">
                  {/* Quick Start Guide */}
                  <section>
                    <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center">
                      <Award className="h-5 w-5 mr-2" />
                      Quick Start Guide
                    </h3>
                    <div className="bg-green-50 rounded-lg p-4 space-y-2">
                      <div className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                        <p className="text-sm text-green-800"><strong>Register Your Company:</strong> Complete the online registration with all required documents</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                        <p className="text-sm text-green-800"><strong>Get Approved:</strong> Wait for administrative approval (typically 3-5 business days)</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                        <p className="text-sm text-green-800"><strong>Browse Tenders:</strong> Search and view available procurement opportunities</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                        <p className="text-sm text-green-800"><strong>Submit Bids:</strong> Purchase tender documents and submit your proposals</p>
                      </div>
                    </div>
                  </section>

                  {/* Contractors Registration Requirements */}
                  <section>
                    <h3 className="text-lg font-semibold text-blue-700 mb-3 flex items-center">
                      <Building2 className="h-5 w-5 mr-2" />
                      Contractors Registration Requirements
                    </h3>
                    <div className="bg-blue-50 rounded-lg p-4 space-y-4">
                      <div>
                        <h4 className="font-medium text-blue-900 mb-2">Required Documents:</h4>
                        <ul className="space-y-1 text-sm text-blue-800">
                          <li>• <strong>Evidence of Incorporation:</strong> Certificate from Corporate Affairs Commission (CAC)</li>
                          <li>• <strong>Memorandum and Articles of Association:</strong> Including names of Directors with their addresses and corresponding shares</li>
                          <li>• <strong>Key Personnel Details:</strong> Names, CVs, and professional registration certificates with recognized professional bodies</li>
                          <li>• <strong>Tax Clearance Certificates (TCC):</strong> For the most recent three (3) years</li>
                          <li>• <strong>Professional and Technical Qualifications:</strong> Of personnel assigned to execute the procurement</li>
                          <li>��� <strong>Previous Experience:</strong> Evidence of projects, programmes, and services executed with Kano State Government or any other government agency (national/international)</li>
                          <li>• <strong>Financial Capability:</strong> Bank statements or audited company accounts</li>
                          <li>• <strong>List of Equipment and Infrastructure:</strong> To be physically verified</li>
                          <li>• <strong>Business Premises License</strong></li>
                          <li>• <strong>Evidence of Registration with SCUML:</strong> Special Control Unit Against Money Laundering under EFCC</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-blue-900 mb-2">Sworn Court Affidavit (High Court of Justice) Testifying That:</h4>
                        <ul className="space-y-1 text-sm text-blue-800">
                          <li>• The company is not in receivership or subject to insolvency or bankruptcy</li>
                          <li>• The company is compliant with payment of taxes, pensions, and social security obligations</li>
                          <li>• No director has been convicted for criminal offenses relating to financial impropriety or falsification</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-blue-900 mb-2">Compliance Certificates Required:</h4>
                        <ul className="space-y-1 text-sm text-blue-800">
                          <li>• National Social Insurance Trust Fund (NSITF)</li>
                          <li>• Industrial Training Fund (ITF)</li>
                          <li>• National Pension Commission (PENCOM)</li>
                          <li>• Registration with Relevant Professional Bodies (for consultancy firms)</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-blue-900 mb-3">Category of Contractors Registration & Fees:</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm text-blue-800">
                            <thead>
                              <tr className="border-b border-blue-200">
                                <th className="text-left py-2 font-semibold">Category</th>
                                <th className="text-left py-2 font-semibold">Contract Value Range (₦)</th>
                                <th className="text-left py-2 font-semibold">Registration Fee (₦)</th>
                              </tr>
                            </thead>
                            <tbody className="space-y-1">
                              <tr className="border-b border-blue-100">
                                <td className="py-2 font-medium">A</td>
                                <td className="py-2">1,000,000.00 – 50,000,000.00</td>
                                <td className="py-2 text-green-700 font-medium">50,000.00</td>
                              </tr>
                              <tr className="border-b border-blue-100">
                                <td className="py-2 font-medium">B</td>
                                <td className="py-2">50,000,000.01 – 150,000,000.00</td>
                                <td className="py-2 text-green-700 font-medium">100,000.00</td>
                              </tr>
                              <tr className="border-b border-blue-100">
                                <td className="py-2 font-medium">C</td>
                                <td className="py-2">150,000,000.01 – 500,000,000.00</td>
                                <td className="py-2 text-green-700 font-medium">200,000.00</td>
                              </tr>
                              <tr className="border-b border-blue-100">
                                <td className="py-2 font-medium">D</td>
                                <td className="py-2">500,000,000.01 and above</td>
                                <td className="py-2 text-green-700 font-medium">300,000.00</td>
                              </tr>
                              <tr>
                                <td className="py-2 font-medium">E</td>
                                <td className="py-2">Multiple Registration</td>
                                <td className="py-2 text-green-700 font-medium">350,000.00</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <p className="text-xs text-blue-600 mt-3"><strong>Note:</strong> All documents must be current, properly notarized, and submitted with the appropriate registration fee based on your category.</p>
                    </div>
                  </section>

                  {/* Bidding Process */}
                  <section>
                    <h3 className="text-lg font-semibold text-purple-700 mb-3 flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Bidding Process Guidelines
                    </h3>
                    <div className="bg-purple-50 rounded-lg p-4 space-y-3">
                      <div>
                        <h4 className="font-medium text-purple-900">Before Bidding:</h4>
                        <ul className="text-sm text-purple-800 ml-4 space-y-1">
                          <li>• Purchase tender documents with valid payment</li>
                          <li>• Read all requirements and specifications carefully</li>
                          <li>• Attend pre-bid meetings (if scheduled)</li>
                          <li>• Submit clarification requests if needed</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-purple-900">Bid Submission:</h4>
                        <ul className="text-sm text-purple-800 ml-4 space-y-1">
                          <li>• Submit all required technical and financial documents</li>
                          <li>• Ensure compliance with specifications</li>
                          <li>• Submit before deadline (late submissions not accepted)</li>
                          <li>• Provide bid security/bond if required</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* Evaluation Criteria */}
                  <section>
                    <h3 className="text-lg font-semibold text-orange-700 mb-3 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Evaluation Criteria
                    </h3>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <p className="text-sm text-orange-800 mb-3">Bids are typically evaluated based on:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-orange-900">Technical (70%):</h4>
                          <ul className="text-sm text-orange-800 ml-4">
                            <li>• Technical specifications compliance</li>
                            <li>• Company experience and track record</li>
                            <li>• Personnel qualifications</li>
                            <li>• Methodology and approach</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-orange-900">Financial (30%):</h4>
                          <ul className="text-sm text-orange-800 ml-4">
                            <li>• Price competitiveness</li>
                            <li>• Value for money</li>
                            <li>• Financial capacity</li>
                            <li>• Payment terms</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Compliance & Legal */}
                  <section>
                    <h3 className="text-lg font-semibold text-red-700 mb-3 flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Compliance & Legal Requirements
                    </h3>
                    <div className="bg-red-50 rounded-lg p-4 space-y-3">
                      <div>
                        <h4 className="font-medium text-red-900">Mandatory Compliance:</h4>
                        <ul className="text-sm text-red-800 ml-4 space-y-1">
                          <li>• Nigerian company registration (minimum 51% Nigerian ownership)</li>
                          <li>• Valid tax payments and clearances</li>
                          <li>• No involvement in corrupt practices</li>
                          <li>• Compliance with labor laws and standards</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-red-900">Prohibited Practices:</h4>
                        <ul className="text-sm text-red-800 ml-4 space-y-1">
                          <li>• Bribery, corruption, or fraudulent practices</li>
                          <li>• Collusion with other bidders</li>
                          <li>• Submission of false information</li>
                          <li>• Conflict of interest situations</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* Payment & Contract Terms */}
                  <section>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                      <DollarSign className="h-5 w-5 mr-2" />
                      Payment & Contract Terms
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900">Payment Schedule:</h4>
                          <ul className="text-sm text-gray-700 ml-4">
                            <li>• Advance payment: Up to 15%</li>
                            <li>• Progress payments: Based on milestones</li>
                            <li>• Final payment: After completion & acceptance</li>
                            <li>• Retention: 5-10% for defect liability period</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Contract Management:</h4>
                          <ul className="text-sm text-gray-700 ml-4">
                            <li>• Regular progress reporting required</li>
                            <li>• Quality assurance checks</li>
                            <li>• Change order procedures</li>
                            <li>• Dispute resolution mechanisms</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Contact Information */}
                  <section>
                    <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Contact & Support
                    </h3>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-green-900">Technical Support:</h4>
                          <p className="text-sm text-green-800">Email: support@kanoproc.gov.ng</p>
                          <p className="text-sm text-green-800">Phone: +234 (0) 64 123-4567</p>
                          <p className="text-sm text-green-800">Hours: Mon-Fri, 8AM-5PM</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-green-900">Procurement Office:</h4>
                          <p className="text-sm text-green-800">Kano State Government House</p>
                          <p className="text-sm text-green-800">Kano, Kano State, Nigeria</p>
                          <p className="text-sm text-green-800">procurement@kanostate.gov.ng</p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Last updated: January 2024 • Version 2.1
                  </div>
                  <div className="flex space-x-3">
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </button>
                    <button
                      onClick={() => setShowGuidelines(false)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Procurement Policies Modal */}
      {showPolicies && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-start justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowPolicies(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Kano State Procurement Policies</h2>
                  <button
                    onClick={() => setShowPolicies(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-6">
                  {/* General Procurement Policy */}
                  <section>
                    <h3 className="text-lg font-semibold text-blue-700 mb-3 flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      General Procurement Policy
                    </h3>
                    <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                      <p className="text-sm text-blue-800"><strong>Objective:</strong> To ensure transparency, accountability, efficiency, and value for money in all procurement activities of Kano State Government.</p>

                      <div>
                        <h4 className="font-medium text-blue-900 mb-2">Core Principles:</h4>
                        <ul className="space-y-1 text-sm text-blue-800">
                          <li>• <strong>Transparency:</strong> All procurement processes shall be conducted in an open and transparent manner</li>
                          <li>• <strong>Competition:</strong> Fair and open competition among qualified suppliers</li>
                          <li>• <strong>Accountability:</strong> Clear responsibility and documentation for all procurement decisions</li>
                          <li>• <strong>Value for Money:</strong> Optimal combination of quality, price, and performance</li>
                          <li>• <strong>Integrity:</strong> Zero tolerance for corruption and unethical practices</li>
                          <li>• <strong>Equality:</strong> Non-discrimination and equal treatment of all bidders</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* Procurement Methods */}
                  <section>
                    <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Procurement Methods
                    </h3>
                    <div className="bg-green-50 rounded-lg p-4 space-y-4">
                      <div>
                        <h4 className="font-medium text-green-900">1. Open Competitive Bidding (OCB)</h4>
                        <p className="text-sm text-green-800">Default method for procurement above ₦25 million. Open to all qualified bidders with adequate notice period.</p>
                        <p className="text-xs text-green-600 mt-1"><strong>Timeline:</strong> Minimum 30 days notice period</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-green-900">2. Selective Bidding</h4>
                        <p className="text-sm text-green-800">For specialized goods/services where limited qualified suppliers exist. Pre-qualification required.</p>
                        <p className="text-xs text-green-600 mt-1"><strong>Threshold:</strong> ₦10 million - ₦25 million</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-green-900">3. Direct Procurement</h4>
                        <p className="text-sm text-green-800">For procurement below ₦10 million or emergency situations with proper justification.</p>
                        <p className="text-xs text-green-600 mt-1"><strong>Approval:</strong> Requires MDA head approval with justification</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-green-900">4. Request for Quotation (RFQ)</h4>
                        <p className="text-sm text-green-800">For goods/services below ₦5 million. Minimum three quotations required.</p>
                        <p className="text-xs text-green-600 mt-1"><strong>Process:</strong> Simplified procurement with shorter timelines</p>
                      </div>
                    </div>
                  </section>

                  {/* Approval Thresholds */}
                  <section>
                    <h3 className="text-lg font-semibold text-purple-700 mb-3 flex items-center">
                      <DollarSign className="h-5 w-5 mr-2" />
                      Approval Authority & Thresholds
                    </h3>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-purple-800">
                          <thead>
                            <tr className="border-b border-purple-200">
                              <th className="text-left py-2 font-semibold">Authority Level</th>
                              <th className="text-left py-2 font-semibold">Approval Limit</th>
                              <th className="text-left py-2 font-semibold">Requirements</th>
                            </tr>
                          </thead>
                          <tbody className="space-y-1">
                            <tr className="border-b border-purple-100">
                              <td className="py-2 font-medium">Procurement Officer</td>
                              <td className="py-2">Up to ₦1,000,000</td>
                              <td className="py-2">Three quotations required</td>
                            </tr>
                            <tr className="border-b border-purple-100">
                              <td className="py-2 font-medium">MDA Head</td>
                              <td className="py-2">₦1,000,001 - ₦25,000,000</td>
                              <td className="py-2">Competitive bidding process</td>
                            </tr>
                            <tr className="border-b border-purple-100">
                              <td className="py-2 font-medium">State Tender Board</td>
                              <td className="py-2">₦25,000,001 - ₦250,000,000</td>
                              <td className="py-2">Open competitive bidding mandatory</td>
                            </tr>
                            <tr>
                              <td className="py-2 font-medium">Governor/Executive Council</td>
                              <td className="py-2">Above ₦250,000,000</td>
                              <td className="py-2">Cabinet approval required</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </section>

                  {/* Vendor Management */}
                  <section>
                    <h3 className="text-lg font-semibold text-orange-700 mb-3 flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Vendor Management Policy
                    </h3>
                    <div className="bg-orange-50 rounded-lg p-4 space-y-3">
                      <div>
                        <h4 className="font-medium text-orange-900">Registration Requirements:</h4>
                        <ul className="text-sm text-orange-800 ml-4 space-y-1">
                          <li>• Valid business registration and tax compliance</li>
                          <li>• Professional qualifications and experience verification</li>
                          <li>• Financial capacity assessment</li>
                          <li>• Background checks and integrity verification</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-orange-900">Performance Monitoring:</h4>
                        <ul className="text-sm text-orange-800 ml-4 space-y-1">
                          <li>• Regular performance evaluations for all contractors</li>
                          <li>• Quality assurance and delivery timeline tracking</li>
                          <li>• Customer satisfaction feedback collection</li>
                          <li>• Performance-based vendor rating system</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-orange-900">Sanctions and Debarment:</h4>
                        <ul className="text-sm text-orange-800 ml-4 space-y-1">
                          <li>• Suspension for poor performance or contract violations</li>
                          <li>• Debarment for fraudulent activities or corruption</li>
                          <li>• Appeals process for contested sanctions</li>
                          <li>• Rehabilitation program for suspended vendors</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* Anti-Corruption Policy */}
                  <section>
                    <h3 className="text-lg font-semibold text-red-700 mb-3 flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Anti-Corruption & Ethics Policy
                    </h3>
                    <div className="bg-red-50 rounded-lg p-4 space-y-3">
                      <div>
                        <h4 className="font-medium text-red-900">Zero Tolerance Policy:</h4>
                        <p className="text-sm text-red-800">Kano State Government maintains zero tolerance for corruption in all forms including bribery, kickbacks, conflicts of interest, and fraudulent practices.</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-red-900">Prohibited Practices:</h4>
                        <ul className="text-sm text-red-800 ml-4 space-y-1">
                          <li>• Offering or accepting bribes, gifts, or favors</li>
                          <li>• Bid rigging, collusion, or price fixing</li>
                          <li>• Conflicts of interest without proper disclosure</li>
                          <li>• Fraudulent documentation or misrepresentation</li>
                          <li>• Abuse of confidential information</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-red-900">Reporting Mechanisms:</h4>
                        <ul className="text-sm text-red-800 ml-4 space-y-1">
                          <li>• Anonymous whistleblower hotline: 0800-REPORT</li>
                          <li>• Online reporting portal: report.kanoproc.gov.ng</li>
                          <li>• Protection for whistleblowers and witnesses</li>
                          <li>• Independent investigation procedures</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* Contract Management */}
                  <section>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Contract Management Policy
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-900">Contract Administration:</h4>
                        <ul className="text-sm text-gray-700 ml-4 space-y-1">
                          <li>• Designated contract managers for all major contracts</li>
                          <li>• Regular progress monitoring and milestone tracking</li>
                          <li>• Quality assurance and compliance verification</li>
                          <li>• Change order procedures and approval protocols</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900">Payment Terms:</h4>
                        <ul className="text-sm text-gray-700 ml-4 space-y-1">
                          <li>• Standard payment terms: 30 days upon delivery and acceptance</li>
                          <li>• Advance payments limited to 15% with bank guarantee</li>
                          <li>• Retention of 5-10% for defect liability period</li>
                          <li>• Performance-based payment schedules for service contracts</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900">Dispute Resolution:</h4>
                        <ul className="text-sm text-gray-700 ml-4 space-y-1">
                          <li>• Structured dispute resolution procedures</li>
                          <li>• Mediation and arbitration mechanisms</li>
                          <li>• Legal recourse for unresolved disputes</li>
                          <li>• Contract termination procedures</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* Sustainability & Local Content */}
                  <section>
                    <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center">
                      <Globe className="h-5 w-5 mr-2" />
                      Sustainability & Local Content Policy
                    </h3>
                    <div className="bg-green-50 rounded-lg p-4 space-y-3">
                      <div>
                        <h4 className="font-medium text-green-900">Environmental Considerations:</h4>
                        <ul className="text-sm text-green-800 ml-4 space-y-1">
                          <li>• Environmental impact assessment for major projects</li>
                          <li>• Preference for environmentally friendly products and services</li>
                          <li>• Waste reduction and recycling requirements</li>
                          <li>• Energy efficiency considerations in procurement decisions</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-green-900">Local Content Requirements:</h4>
                        <ul className="text-sm text-green-800 ml-4 space-y-1">
                          <li>• Minimum 60% Nigerian content for goods and services</li>
                          <li>• Priority for locally manufactured products</li>
                          <li>• Local skills development and technology transfer</li>
                          <li>• Support for small and medium enterprises (SMEs)</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-green-900">Social Responsibility:</h4>
                        <ul className="text-sm text-green-800 ml-4 space-y-1">
                          <li>• Community development and job creation priorities</li>
                          <li>• Gender equality and youth employment initiatives</li>
                          <li>• Disabled-friendly procurement practices</li>
                          <li>• Corporate social responsibility requirements</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* Compliance and Monitoring */}
                  <section>
                    <h3 className="text-lg font-semibold text-indigo-700 mb-3 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Compliance & Monitoring
                    </h3>
                    <div className="bg-indigo-50 rounded-lg p-4 space-y-3">
                      <div>
                        <h4 className="font-medium text-indigo-900">Regular Audits:</h4>
                        <ul className="text-sm text-indigo-800 ml-4 space-y-1">
                          <li>• Internal audit of all procurement activities</li>
                          <li>• External audit by independent auditors</li>
                          <li>• Public procurement audit by Auditor General</li>
                          <li>• Quarterly compliance reports</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-indigo-900">Key Performance Indicators:</h4>
                        <ul className="text-sm text-indigo-800 ml-4 space-y-1">
                          <li>• Cost savings achieved through competitive bidding</li>
                          <li>• Procurement cycle time efficiency</li>
                          <li>��� Vendor performance and delivery rates</li>
                          <li>• Compliance with procurement procedures</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-indigo-900">Continuous Improvement:</h4>
                        <ul className="text-sm text-indigo-800 ml-4 space-y-1">
                          <li>• Regular policy reviews and updates</li>
                          <li>• Stakeholder feedback incorporation</li>
                          <li>• Best practice adoption and innovation</li>
                          <li>• Training and capacity building programs</li>
                        </ul>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Effective Date: January 2024 • Version 3.0 • Review Date: January 2025
                  </div>
                  <div className="flex space-x-3">
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </button>
                    <button
                      onClick={() => setShowPolicies(false)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tender Details Modal */}
      {showTenderDetails && selectedTender && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-start justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowTenderDetails(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedTender.title}</h2>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        {selectedTender.id}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                        selectedTender.status === "Open" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {selectedTender.status}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {selectedTender.category}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowTenderDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-6">
                  {/* Overview */}
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Overview</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 mb-4">{selectedTender.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Contract Value</p>
                          <p className="text-lg font-bold text-green-600">{selectedTender.value}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Tender Fee</p>
                          <p className="text-lg font-bold text-blue-600">{selectedTender.tenderFee}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="text-lg font-medium text-gray-900">{selectedTender.duration}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Location</p>
                          <p className="text-lg font-medium text-gray-900">{selectedTender.location}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Important Dates */}
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Important Dates</h3>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-yellow-600" />
                          <div>
                            <p className="text-sm text-yellow-800 font-medium">Published</p>
                            <p className="text-yellow-900">{new Date(selectedTender.publishDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Clock className="h-5 w-5 text-red-600" />
                          <div>
                            <p className="text-sm text-red-800 font-medium">Closing Date</p>
                            <p className="text-red-900 font-bold">{new Date(selectedTender.closingDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Building2 className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm text-blue-800 font-medium">Procuring Entity</p>
                            <p className="text-blue-900">{selectedTender.procuringEntity}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Eligibility Criteria */}
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Eligibility Criteria</h3>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-blue-900 font-medium mb-3">{selectedTender.eligibility}</p>
                      <h4 className="font-medium text-blue-900 mb-2">Required Documents:</h4>
                      <ul className="space-y-1">
                        {selectedTender.requirements.map((req: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2 text-sm text-blue-800">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>

                  {/* Technical Specifications */}
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Technical Specifications</h3>
                    <div className="bg-green-50 rounded-lg p-4">
                      <ul className="space-y-2">
                        {selectedTender.technicalSpecs.map((spec: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2 text-sm text-green-800">
                            <FileText className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{spec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>

                  {/* Procurement Process */}
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">How to Apply</h3>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                          <div>
                            <p className="font-medium text-purple-900">Register Your Company</p>
                            <p className="text-sm text-purple-800">Complete online registration and get approved</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                          <div>
                            <p className="font-medium text-purple-900">Purchase Tender Documents</p>
                            <p className="text-sm text-purple-800">Pay {selectedTender.tenderFee} tender fee and download documents</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                          <div>
                            <p className="font-medium text-purple-900">Prepare Your Bid</p>
                            <p className="text-sm text-purple-800">Submit technical and financial proposals before deadline</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                          <div>
                            <p className="font-medium text-purple-900">Await Evaluation</p>
                            <p className="text-sm text-purple-800">Evaluation results will be communicated within 30 days</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Views: {selectedTender.views} • Published: {new Date(selectedTender.publishDate).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-3">
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      <Download className="h-4 w-4 mr-2" />
                      Download Documents
                    </button>
                    <Link
                      to="/register"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Register to Bid
                    </Link>
                    <button
                      onClick={() => setShowTenderDetails(false)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
