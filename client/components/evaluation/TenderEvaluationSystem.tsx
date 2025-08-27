import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  Eye,
  EyeOff,
  Users,
  CheckCircle,
  XCircle,
  Edit3,
  Save,
} from "lucide-react";
import { EvaluationTemplate, TenderAssignment } from "@shared/api";

interface TenderEvaluationSystemProps {
  assignedTenders: TenderAssignment[];
  isLoadingTenders: boolean;
  evaluationTemplate: EvaluationTemplate | null;
  onTenderSelect: (tenderId: string) => void;
  onScoreSubmit: (scores: Record<string, number>) => void;
}

const TenderEvaluationSystem: React.FC<TenderEvaluationSystemProps> = ({
  assignedTenders,
  isLoadingTenders,
  evaluationTemplate,
  onTenderSelect,
  onScoreSubmit,
}) => {
  // Demo mode - toggle between roles
  const [currentUser, setCurrentUser] = useState({
    id: "eval002",
    name: "Mallam Ibrahim Sule",
    role: "evaluator", // 'evaluator' or 'chairman'
    committeeId: "comm001",
  });

  // Toggle user role for demonstration
  const toggleUserRole = () => {
    setCurrentUser((prev) => ({
      ...prev,
      role: prev.role === "evaluator" ? "chairman" : "evaluator",
      name:
        prev.role === "evaluator" ? "Dr. Aminu Kano" : "Mallam Ibrahim Sule",
      id: prev.role === "evaluator" ? "eval001" : "eval002",
    }));
    setShowAggregateScores(false);
  };

  const [selectedTender, setSelectedTender] = useState("");
  const [bidders, setBidders] = useState([]);

  // Function to get all bids for a specific tender from localStorage
  const getBidsForTender = (tenderId: string): any[] => {
    try {
      const storedBids = localStorage.getItem("tenderBids");
      if (!storedBids) return [];

      const bids = JSON.parse(storedBids);
      return bids.filter((bid: any) => bid.tenderId === tenderId);
    } catch (error) {
      console.error("Error reading bids:", error);
      return [];
    }
  };

  // Function to get all bidders from localStorage
  const loadBidders = () => {
    try {
      const storedBids = localStorage.getItem("tenderBids");
      if (!storedBids) {
        setBidders([]);
        return;
      }

      const bids = JSON.parse(storedBids);
      // Transform bids to bidder format expected by the component
      const transformedBidders = bids.map((bid: any) => ({
        id: bid.id,
        company: bid.companyName || bid.company,
        tenderId: bid.tenderId,
      }));
      setBidders(transformedBidders);
    } catch (error) {
      console.error("Error loading bidders:", error);
      setBidders([]);
    }
  };

  // Load bidders when component mounts
  useEffect(() => {
    loadBidders();
  }, []);

  const [scores, setScores] = useState({});
  const [selectedBidder, setSelectedBidder] = useState("");
  const [showAggregateScores, setShowAggregateScores] = useState(false);
  const [isEditing, setIsEditing] = useState({});
  const [approvalStatus, setApprovalStatus] = useState({});

  // Mock aggregate scores for chairman view
  const [aggregateScores] = useState({
    bid001: {
      evaluators: ["eval001", "eval002", "eval003"],
      scores: {
        criteria001: { scores: [85, 78, 82], average: 81.7, approved: false },
        criteria002: { scores: [90, 85, 88], average: 87.7, approved: true },
        criteria003: { scores: [75, 80, 77], average: 77.3, approved: true },
        criteria004: { scores: [88, 82, 85], average: 85.0, approved: false },
        criteria005: { scores: [92, 89, 91], average: 90.7, approved: true },
      },
      totalScore: 84.5,
      finalApproved: false,
    },
  });

  const filteredBidders = bidders.filter(
    (bidder) => bidder.tenderId === selectedTender,
  );

  // Debug logging
  useEffect(() => {
    const debugInfo = {
      selectedTender,
      assignedTenders,
      bidders,
      filteredBidders,
    };
    console.log("Debug info:", debugInfo);
  }, [selectedTender, assignedTenders, bidders, filteredBidders]);

  const handleScoreChange = (criteriaId, score) => {
    setScores((prev) => ({
      ...prev,
      [selectedBidder]: {
        ...prev[selectedBidder],
        [criteriaId]: Math.min(Math.max(0, parseInt(score) || 0), 100),
      },
    }));
  };

  const calculateWeightedScore = (bidderScores) => {
    if (!bidderScores || !evaluationTemplate) return 0;
    return evaluationTemplate.criteria.reduce((total, criteria) => {
      const score = bidderScores[criteria.id] || 0;
      const weight = criteria.weight || 0;
      return total + (score * weight) / 100;
    }, 0);
  };

  const handleApprovalToggle = (bidderId, criteriaId) => {
    if (currentUser.role !== "chairman") return;

    setApprovalStatus((prev) => ({
      ...prev,
      [bidderId]: {
        ...prev[bidderId],
        [criteriaId]: !prev[bidderId]?.[criteriaId],
      },
    }));
  };

  const handleEditToggle = (bidderId, criteriaId) => {
    if (currentUser.role !== "chairman") return;

    setIsEditing((prev) => ({
      ...prev,
      [`${bidderId}-${criteriaId}`]: !prev[`${bidderId}-${criteriaId}`],
    }));
  };

  const handleTenderSelection = (tenderId: string) => {
    setSelectedTender(tenderId);
    setSelectedBidder("");
    onTenderSelect(tenderId);
  };

  const handleSubmitEvaluation = () => {
    if (selectedBidder && scores[selectedBidder]) {
      onScoreSubmit(scores[selectedBidder]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Tender Evaluation System
            </h1>
            <div className="flex items-center space-x-4">
              {/* Role Toggle for Demo */}
              <button
                onClick={toggleUserRole}
                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs hover:bg-purple-200 transition-colors"
              >
                Switch to{" "}
                {currentUser.role === "evaluator" ? "Chairman" : "Evaluator"}{" "}
                View
              </button>
              <div className="text-sm text-gray-600">
                <span className="font-medium">{currentUser.name}</span>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {currentUser.role === "chairman"
                    ? "Committee Chairman"
                    : "Evaluator"}
                </span>
              </div>
            </div>
          </div>

          {/* Tender Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Assigned Tender
              </label>
              <div className="relative">
                <select
                  value={selectedTender}
                  onChange={(e) => handleTenderSelection(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="">Select a tender...</option>
                  {isLoadingTenders ? (
                    <option disabled>Loading assigned tenders...</option>
                  ) : assignedTenders.length === 0 ? (
                    <option disabled>No tenders assigned for evaluation</option>
                  ) : (
                    assignedTenders.map((tender) => (
                      <option key={tender.id} value={tender.id}>
                        {tender.tenderId} - {tender.status}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {selectedTender && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Bidder to Evaluate
                </label>
                <div className="relative">
                  <select
                    value={selectedBidder}
                    onChange={(e) => setSelectedBidder(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="">Select a bidder...</option>
                    {filteredBidders.map((bidder) => (
                      <option key={bidder.id} value={bidder.id}>
                        {bidder.company}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
            )}
          </div>

          {/* Chairman Controls */}
          {currentUser.role === "chairman" && selectedTender && (
            <div className="mt-4 flex items-center space-x-4">
              <button
                onClick={() => setShowAggregateScores(!showAggregateScores)}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {showAggregateScores ? (
                  <EyeOff className="h-4 w-4 mr-2" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                {showAggregateScores ? "Hide" : "View"} Aggregate Scores
              </button>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-1" />
                Chairman View Active
              </div>
            </div>
          )}
        </div>

        {/* Evaluation Form */}
        {selectedBidder && !showAggregateScores && evaluationTemplate && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Evaluate:{" "}
                {filteredBidders.find((b) => b.id === selectedBidder)?.company}
              </h2>
              <div className="text-sm text-gray-500">
                Individual Evaluation - Results are confidential
              </div>
            </div>

            <div className="space-y-6">
              {evaluationTemplate.criteria.map((criteria) => (
                <div
                  key={criteria.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {criteria.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Weight: {criteria.weight || 0}% | Max Score:{" "}
                        {criteria.maxScore}
                      </p>
                    </div>
                    <div className="text-right">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={scores[selectedBidder]?.[criteria.id] || ""}
                        onChange={(e) =>
                          handleScoreChange(criteria.id, e.target.value)
                        }
                        className="w-20 p-2 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500"
                        placeholder="0-100"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Weighted:{" "}
                        {(
                          ((scores[selectedBidder]?.[criteria.id] || 0) *
                            (criteria.weight || 0)) /
                          100
                        ).toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">
                    Total Weighted Score:
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    {calculateWeightedScore(scores[selectedBidder]).toFixed(2)}
                    /100
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                  Save Draft
                </button>
                <button
                  onClick={handleSubmitEvaluation}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Submit Evaluation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Aggregate Scores (Chairman Only) */}
        {showAggregateScores &&
          currentUser.role === "chairman" &&
          selectedTender &&
          evaluationTemplate && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Aggregate Evaluation Results - Chairman Review
              </h2>

              {Object.entries(aggregateScores).map(([bidderId, data]) => {
                const bidder = bidders.find((b) => b.id === bidderId);
                if (!bidder || bidder.tenderId !== selectedTender) return null;

                return (
                  <div
                    key={bidderId}
                    className="mb-8 border border-gray-200 rounded-lg p-6"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {bidder.company}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-blue-600">
                          {data.totalScore.toFixed(2)}/100
                        </span>
                        {data.finalApproved ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-500" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {evaluationTemplate.criteria.map((criteria) => {
                        const criteriaData =
                          data.scores[
                            `criteria${criteria.id.toString().padStart(3, "0")}`
                          ];
                        const isEditingThis =
                          isEditing[`${bidderId}-${criteria.id}`];

                        if (!criteriaData) return null;

                        return (
                          <div
                            key={criteria.id}
                            className="grid grid-cols-12 gap-4 items-center py-2 border-b border-gray-100"
                          >
                            <div className="col-span-4">
                              <span className="font-medium text-gray-900">
                                {criteria.name}
                              </span>
                              <div className="text-xs text-gray-500">
                                Weight: {criteria.weight || 0}%
                              </div>
                            </div>

                            <div className="col-span-3 text-sm">
                              Individual Scores:{" "}
                              {criteriaData.scores.join(", ")}
                            </div>

                            <div className="col-span-2 text-center">
                              {isEditingThis ? (
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  className="w-16 p-1 border border-gray-300 rounded text-center"
                                  defaultValue={criteriaData.average.toFixed(1)}
                                />
                              ) : (
                                <span className="font-semibold">
                                  {criteriaData.average.toFixed(1)}
                                </span>
                              )}
                            </div>

                            <div className="col-span-2 text-center">
                              <span className="font-medium">
                                {(
                                  (criteriaData.average *
                                    (criteria.weight || 0)) /
                                  100
                                ).toFixed(1)}
                              </span>
                            </div>

                            <div className="col-span-1 flex items-center justify-center space-x-1">
                              <button
                                onClick={() =>
                                  handleEditToggle(bidderId, criteria.id)
                                }
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                {isEditingThis ? (
                                  <Save className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Edit3 className="h-4 w-4 text-gray-600" />
                                )}
                              </button>
                              <button
                                onClick={() =>
                                  handleApprovalToggle(bidderId, criteria.id)
                                }
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                {criteriaData.approved ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex justify-end space-x-4">
                      <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors">
                        Request Revision
                      </button>
                      <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                        Approve Final Score
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        {/* Instructions Panel */}
        <div className="bg-blue-50 rounded-lg p-4 mt-6">
          <h3 className="font-medium text-blue-900 mb-2">
            Evaluation Guidelines
          </h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Select an assigned tender and bidder to begin evaluation</p>
            <p>
              • Score each criteria from 0-100 based on the evaluation template
            </p>
            <p>
              • Individual evaluator scores remain confidential until chairman
              review
            </p>
            {currentUser.role === "chairman" && (
              <>
                <p>
                  • As chairman, you can view aggregate scores and make final
                  approvals
                </p>
                <p>
                  • Edit individual criteria scores and approve/reject final
                  evaluations
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenderEvaluationSystem;
