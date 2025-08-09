import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import {
  Building2,
  FileText,
  Search,
  Filter,
  Eye,
  MapPin,
  Calendar,
  DollarSign,
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  Download,
  UserPlus
} from "lucide-react";

interface Tender {
  id: string;
  title: string;
  description: string;
  value: string;
  deadline: string;
  location: string;
  views: number;
  status: string;
  category: string;
  publishDate: string;
  closingDate: string;
  tenderFee: string;
  procuringEntity: string;
  duration: string;
  eligibility: string;
  requirements: string[];
  technicalSpecs: string[];
}

export default function AllTenders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [showTenderDetails, setShowTenderDetails] = useState(false);

  // Comprehensive tender data
  const getDefaultTenders = (): Tender[] => [
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
      tenderFee: "₦25,000",
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
    },
    {
      id: "KS-2024-004",
      title: "ICT Infrastructure Development Project",
      category: "Technology",
      value: "₦4.1B",
      deadline: "2024-02-20",
      location: "Statewide",
      views: 278,
      status: "Closing Soon",
      description: "Fiber optic network expansion to connect all LGA headquarters and major government facilities across Kano State.",
      publishDate: "2024-01-10",
      closingDate: "2024-02-20",
      tenderFee: "₦30,000",
      procuringEntity: "Kano State ICT Agency",
      duration: "24 months",
      eligibility: "Category D ICT contractors with network infrastructure experience",
      requirements: [
        "Cisco or equivalent certifications",
        "Network infrastructure project portfolio",
        "Financial capacity of at least ₦1B",
        "International partnership agreements",
        "Local technical support capability"
      ],
      technicalSpecs: [
        "Fiber optic cables: Single-mode 96-core",
        "Network equipment: Enterprise-grade switches and routers",
        "Data centers: Tier III compliance",
        "Backup systems: UPS and diesel generators",
        "Security systems: Firewall and intrusion detection"
      ]
    },
    {
      id: "KS-2024-005",
      title: "Construction of Modern Water Treatment Plant",
      category: "Infrastructure",
      value: "₦5.7B",
      deadline: "2024-03-05",
      location: "Kano Municipal",
      views: 189,
      status: "Open",
      description: "Construction of modern water treatment facility serving 200,000 residents with advanced filtration and purification systems.",
      publishDate: "2024-01-30",
      closingDate: "2024-03-05",
      tenderFee: "₦35,000",
      procuringEntity: "Kano State Water Board",
      duration: "30 months",
      eligibility: "Category D contractors with water infrastructure experience",
      requirements: [
        "Water treatment plant construction experience",
        "Environmental compliance certification",
        "Professional engineering licenses",
        "Quality management system certification",
        "International technical partnerships"
      ],
      technicalSpecs: [
        "Treatment capacity: 50 million liters per day",
        "Filtration systems: Multi-stage with membrane technology",
        "Chemical dosing: Automated chlorination system",
        "Distribution network: High-pressure pumping stations",
        "Quality monitoring: Real-time water quality sensors"
      ]
    },
    {
      id: "KS-2024-006",
      title: "Agricultural Development Equipment Supply",
      category: "Agriculture",
      value: "₦1.2B",
      deadline: "2024-02-28",
      location: "Rural LGAs",
      views: 145,
      status: "Open",
      description: "Supply of modern agricultural equipment and machinery to support farming cooperatives across rural areas of Kano State.",
      publishDate: "2024-01-28",
      closingDate: "2024-02-28",
      tenderFee: "₦18,000",
      procuringEntity: "Kano State Agricultural Development Program",
      duration: "8 months",
      eligibility: "Agricultural equipment suppliers with local service centers",
      requirements: [
        "Agricultural equipment dealership license",
        "Manufacturer authorization certificates",
        "Local service and maintenance capability",
        "Spare parts inventory guarantee",
        "Farmer training program provision"
      ],
      technicalSpecs: [
        "Tractors: 100 units of 75HP capacity",
        "Harvesting equipment: Combined harvesters and threshers",
        "Irrigation systems: Solar-powered water pumps",
        "Processing equipment: Rice mills and grain dryers",
        "Training: Operator training for 500 farmers"
      ]
    },
    {
      id: "KS-2024-007",
      title: "Security Infrastructure Enhancement",
      category: "Security",
      value: "₦2.8B",
      deadline: "2024-03-10",
      location: "Statewide",
      views: 198,
      status: "Open",
      description: "Installation of modern security systems including CCTV surveillance, access control, and communication networks for government facilities.",
      publishDate: "2024-02-01",
      closingDate: "2024-03-10",
      tenderFee: "₦25,000",
      procuringEntity: "Kano State Security Commission",
      duration: "15 months",
      eligibility: "Security systems integrators with government project experience",
      requirements: [
        "Security clearance from relevant authorities",
        "Certified security systems training",
        "Government project portfolio",
        "24/7 maintenance support capability",
        "Data protection compliance certification"
      ],
      technicalSpecs: [
        "CCTV cameras: 500 high-definition IP cameras",
        "Control rooms: Central monitoring stations",
        "Access control: Biometric and card-based systems",
        "Communication: Encrypted radio network",
        "Data storage: Cloud-based with local backup"
      ]
    },
    {
      id: "KS-2024-008",
      title: "Waste Management System Implementation",
      category: "Environment",
      value: "₦3.5B",
      deadline: "2024-03-15",
      location: "Kano Metropolitan",
      views: 167,
      status: "Open",
      description: "Implementation of comprehensive waste management system including collection, sorting, recycling, and disposal facilities.",
      publishDate: "2024-02-05",
      closingDate: "2024-03-15",
      tenderFee: "₦28,000",
      procuringEntity: "Kano State Environmental Protection Agency",
      duration: "36 months",
      eligibility: "Environmental services companies with waste management expertise",
      requirements: [
        "Environmental management certification",
        "Waste management project experience",
        "Environmental impact assessment capability",
        "Community engagement experience",
        "International best practices compliance"
      ],
      technicalSpecs: [
        "Collection vehicles: 50 specialized waste trucks",
        "Sorting facilities: Automated waste separation systems",
        "Recycling plants: Plastic and organic waste processing",
        "Landfill sites: Engineered sanitary landfills",
        "Education: Community awareness programs"
      ]
    }
  ];

  const [allTenders, setAllTenders] = useState<Tender[]>(getDefaultTenders());

  // Load tenders from localStorage
  useEffect(() => {
    const loadAllTenders = () => {
      const storedTenders = localStorage.getItem("recentTenders");
      if (storedTenders) {
        const parsedTenders = JSON.parse(storedTenders);
        if (parsedTenders.length > 0) {
          // Combine stored tenders with default ones, removing duplicates
          const defaultTenders = getDefaultTenders();
          const allUniqueTenders = [...parsedTenders];

          // Add default tenders that don't exist in stored tenders
          defaultTenders.forEach(defaultTender => {
            if (!parsedTenders.find((t: Tender) => t.id === defaultTender.id)) {
              allUniqueTenders.push(defaultTender);
            }
          });

          setAllTenders(allUniqueTenders);
        }
      }
    };

    loadAllTenders();

    // Set up interval to refresh tenders every 30 seconds
    const interval = setInterval(loadAllTenders, 30000);
    return () => clearInterval(interval);
  }, []);

  const categories = ["all", "Infrastructure", "Healthcare", "Education", "Technology", "Agriculture", "Security", "Environment"];
  const statuses = ["all", "Open", "Closing Soon", "Closed"];

  // Filter tenders based on search and filters
  const filteredTenders = allTenders.filter(tender => {
    const matchesSearch = tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tender.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tender.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || tender.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || tender.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleViewTenderDetails = (tender: Tender) => {
    setSelectedTender(tender);
    setShowTenderDetails(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "bg-green-100 text-green-800";
      case "Closing Soon": return "bg-orange-100 text-orange-800";
      case "Closed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Infrastructure": return "bg-blue-100 text-blue-800";
      case "Healthcare": return "bg-red-100 text-red-800";
      case "Education": return "bg-purple-100 text-purple-800";
      case "Technology": return "bg-green-100 text-green-800";
      case "Agriculture": return "bg-yellow-100 text-yellow-800";
      case "Security": return "bg-gray-100 text-gray-800";
      case "Environment": return "bg-emerald-100 text-emerald-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Back Button */}
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2 text-green-700 hover:text-green-800">
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm font-medium">Back to Home</span>
              </Link>
              <div className="hidden sm:flex items-center space-x-3 border-l pl-4">
                <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-green-700">KanoProc</h1>
                  <p className="text-xs text-gray-600">All Tenders</p>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              <Link to="/register" className="hidden sm:flex items-center px-4 py-2 bg-green-700 text-white rounded-md text-sm font-medium hover:bg-green-800">
                <UserPlus className="h-4 w-4 mr-2" />
                Register to Bid
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Procurement Tenders</h1>
          <p className="text-lg text-gray-600">Browse all available procurement opportunities from Kano State Government</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tenders by title, description, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === "all" ? "All Statuses" : status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredTenders.length} of {allTenders.length} tenders
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Filter className="h-4 w-4" />
              <span>Filter by category and status</span>
            </div>
          </div>
        </div>

        {/* Tenders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTenders.map((tender) => (
            <div key={tender.id} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow border">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {tender.id}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tender.status)}`}>
                    {tender.status}
                  </span>
                </div>

                {/* Title and Category */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight line-clamp-2">
                  {tender.title}
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-3 ${getCategoryColor(tender.category)}`}>
                  {tender.category}
                </span>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {tender.description}
                </p>

                {/* Key Details */}
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-600">Value</p>
                    <p className="font-semibold text-lg text-green-600">{tender.value}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Deadline</p>
                    <p className="font-medium">{new Date(tender.deadline).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-4 mb-4">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{tender.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{tender.views} views</span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleViewTenderDetails(tender)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredTenders.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tenders found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedStatus("all");
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>

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
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusColor(selectedTender.status)}`}>
                        {selectedTender.status}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getCategoryColor(selectedTender.category)}`}>
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
                        {selectedTender.requirements.map((req, index) => (
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
                        {selectedTender.technicalSpecs.map((spec, index) => (
                          <li key={index} className="flex items-start space-x-2 text-sm text-green-800">
                            <FileText className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{spec}</span>
                          </li>
                        ))}
                      </ul>
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
