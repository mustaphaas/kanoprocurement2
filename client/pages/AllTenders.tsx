import React from "react";
import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { tenderStatusChecker, TenderStatus } from "@/lib/tenderSettings";
import {
  getMinistryTenders,
  type Tender as UnifiedTender,
} from "@/lib/tenderData";
import { getCurrentMinistryContext, getMinistryStorageKey } from "@/lib/ministryStorageHelper";
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
  UserPlus,
} from "lucide-react";

// Using unified Tender type from tenderData

export default function AllTenders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTender, setSelectedTender] = useState<UnifiedTender | null>(
    null,
  );
  const [showTenderDetails, setShowTenderDetails] = useState(false);

  // Use ministry-specific tender data source
  const getDefaultTenders = (): UnifiedTender[] => getMinistryTenders();

  const [allTenders, setAllTenders] =
    useState<UnifiedTender[]>(getDefaultTenders());

  // Apply automatic status transitions to a tender
  const applyStatusTransitions = (tender: UnifiedTender): UnifiedTender => {
    const automaticStatus = tenderStatusChecker.determineAutomaticStatus(
      tender.status,
      tender.closingDate || tender.deadline,
      tender.publishDate,
    );

    return {
      ...tender,
      status: automaticStatus,
    };
  };

  // Load tenders from ministry-specific localStorage
  useEffect(() => {
    const loadAllTenders = () => {
      const { ministryCode } = getCurrentMinistryContext();
      const ministryStorageKey = getMinistryStorageKey("recentTenders");

      const storedTenders = localStorage.getItem(ministryStorageKey);
      if (storedTenders) {
        const parsedTenders = JSON.parse(storedTenders);
        if (parsedTenders.length > 0) {
          // Apply currency formatting and automatic status transitions
          const formattedParsedTenders = parsedTenders.map(
            (tender: UnifiedTender) => {
              const formatted = {
                ...tender,
                value: formatCurrency(tender.value),
              };
              return applyStatusTransitions(formatted);
            },
          );

          setAllTenders(formattedParsedTenders);
        } else {
          // If no stored tenders, use ministry-specific default tenders
          setAllTenders(getDefaultTenders().map(applyStatusTransitions));
        }
      } else {
        // If no stored tenders, use ministry-specific default tenders
        setAllTenders(getDefaultTenders().map(applyStatusTransitions));
      }
    };

    loadAllTenders();

    // Set up interval to refresh tenders every 30 seconds
    const interval = setInterval(loadAllTenders, 30000);
    return () => clearInterval(interval);
  }, []);

  const categories = [
    "all",
    "Infrastructure",
    "Healthcare",
    "Education",
    "Technology",
    "Agriculture",
    "Security",
    "Environment",
  ];
  const statuses = ["all", "Active", "Closing Soon", "Closed"];

  // Filter tenders based on search and filters
  const filteredTenders = allTenders.filter((tender) => {
    const matchesSearch =
      tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || tender.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" || tender.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleViewTenderDetails = (tender: UnifiedTender) => {
    setSelectedTender(tender);
    setShowTenderDetails(true);
  };

  const getStatusColor = (status: TenderStatus) => {
    switch (status) {
      case "Draft":
        return "bg-gray-100 text-gray-800";
      case "Published":
      case "Active":
        return "bg-green-100 text-green-800";
      case "Closing Soon":
        return "bg-orange-100 text-orange-800";
      case "Closed":
        return "bg-red-100 text-red-800";
      case "Evaluated":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Infrastructure":
        return <Building2 className="h-4 w-4" />;
      case "Healthcare":
        return <UserPlus className="h-4 w-4" />;
      case "Education":
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">All Tenders</h1>
              <p className="text-gray-600 mt-1">
                Browse and search available procurement opportunities
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-6 flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search tenders by title, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status === "all" ? "All Statuses" : status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Showing {filteredTenders.length} of {allTenders.length} tenders
            </p>
          </div>
        </div>
      </div>

      {/* Tender Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredTenders.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No tenders found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTenders.map((tender) => (
              <div
                key={tender.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(tender.category)}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          tender.status,
                        )}`}
                      >
                        {tender.status === "Active" ? "Open" : tender.status}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">#{tender.id}</span>
                  </div>

                  {/* Title and Category */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {tender.title}
                  </h3>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                      {tender.category}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {tender.description}
                  </p>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Value:</span>
                      <span className="font-semibold text-gray-900">
                        {tender.value}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Deadline:</span>
                      <span className="text-gray-900">{tender.deadline}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Location:</span>
                      <span className="text-gray-900">{tender.location}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{tender.views} views</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleViewTenderDetails(tender)}
                    className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors duration-200 text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tender Details Modal */}
      {showTenderDetails && selectedTender && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  {getCategoryIcon(selectedTender.category)}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedTender.title}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Tender ID: #{selectedTender.id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTenderDetails(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Status and Category */}
              <div className="flex items-center space-x-4 mb-6">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    selectedTender.status,
                  )}`}
                >
                  {selectedTender.status === "Active"
                    ? "Open"
                    : selectedTender.status}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  {selectedTender.category}
                </span>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Description
                </h3>
                <p className="text-gray-700">{selectedTender.description}</p>
              </div>

              {/* Key Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Key Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">
                        <DollarSign className="inline h-4 w-4 mr-1" />
                        Estimated Value:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {selectedTender.value}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        Closing Date:
                      </span>
                      <span className="text-gray-900">
                        {selectedTender.closingDate}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">
                        <MapPin className="inline h-4 w-4 mr-1" />
                        Location:
                      </span>
                      <span className="text-gray-900">
                        {selectedTender.location}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">
                        <Building2 className="inline h-4 w-4 mr-1" />
                        Procuring Entity:
                      </span>
                      <span className="text-gray-900">
                        {selectedTender.procuringEntity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Duration:</span>
                      <span className="text-gray-900">
                        {selectedTender.duration}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Tender Fee:</span>
                      <span className="text-gray-900">
                        {selectedTender.tenderFee}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Eligibility
                  </h3>
                  <p className="text-gray-700">{selectedTender.eligibility}</p>
                </div>
              </div>

              {/* Requirements */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Requirements
                </h3>
                <ul className="space-y-2">
                  {selectedTender.requirements.map((req, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technical Specifications */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Technical Specifications
                </h3>
                <ul className="space-y-2">
                  {selectedTender.technicalSpecs.map((spec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t">
                <button
                  onClick={() => setShowTenderDetails(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Download Documents</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
