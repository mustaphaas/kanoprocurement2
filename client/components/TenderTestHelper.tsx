import React, { useState } from 'react';
import { formatCurrency } from '@/lib/utils';

interface TenderTestHelperProps {
  onTenderCreated: () => void;
}

export const TenderTestHelper: React.FC<TenderTestHelperProps> = ({ onTenderCreated }) => {
  const [isCreating, setIsCreating] = useState(false);

  const createTestTender = () => {
    setIsCreating(true);
    
    // Create a test tender similar to how MinistryDashboard does it
    const tenderId = `TEST-${Date.now()}`;
    const testTender = {
      id: tenderId,
      title: "Test Tender - Medical Equipment Supply",
      category: "Healthcare",
      value: formatCurrency(5000000), // ₦5M
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      location: "Kano State",
      views: 0,
      status: "Open",
      description: "Supply of medical equipment for primary healthcare centers across Kano State",
      publishDate: new Date().toISOString().split('T')[0],
      closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tenderFee: formatCurrency(25000),
      procuringEntity: "Ministry of Health, Kano State",
      duration: "6 months",
      eligibility: "Qualified medical equipment suppliers with relevant experience",
      requirements: [
        "Valid CAC certificate",
        "Tax clearance for last 3 years",
        "Medical equipment supplier license",
        "Evidence of similar supply contracts",
        "Financial capacity documentation",
      ],
      technicalSpecs: [
        "Equipment must meet WHO standards",
        "3-year warranty required",
        "Installation and training included",
        "Maintenance support for 5 years",
      ],
      createdAt: Date.now(),
    };

    // Store in recentTenders (what CompanyDashboard looks for)
    const existingRecentTenders = localStorage.getItem("recentTenders") || "[]";
    const recentTendersList = JSON.parse(existingRecentTenders);
    recentTendersList.unshift(testTender);
    
    // Keep only the last 10 recent tenders
    const latestRecentTenders = recentTendersList.slice(0, 10);
    localStorage.setItem("recentTenders", JSON.stringify(latestRecentTenders));

    console.log("Test tender created:", testTender);
    console.log("Stored in localStorage with key 'recentTenders'");
    
    setIsCreating(false);
    onTenderCreated();
    
    alert(`Test tender "${testTender.title}" created successfully! Active company users should now see it in their dashboard.`);
  };

  const clearAllTenders = () => {
    localStorage.removeItem("recentTenders");
    localStorage.removeItem("featuredTenders");
    localStorage.removeItem("ministryTenders");
    onTenderCreated();
    alert("All tenders cleared from localStorage");
  };

  const viewStoredTenders = () => {
    const recentTenders = JSON.parse(localStorage.getItem("recentTenders") || "[]");
    console.log("Current tenders in localStorage:", recentTenders);
    alert(`Found ${recentTenders.length} tenders in localStorage. Check console for details.`);
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border p-4 max-w-sm">
      <h3 className="font-semibold text-gray-900 mb-3">Tender Testing Helper</h3>
      <p className="text-sm text-gray-600 mb-4">
        Test tender creation and visibility for active users
      </p>
      
      <div className="space-y-2">
        <button
          onClick={createTestTender}
          disabled={isCreating}
          className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {isCreating ? "Creating..." : "Create Test Tender"}
        </button>
        
        <button
          onClick={viewStoredTenders}
          className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          View Stored Tenders
        </button>
        
        <button
          onClick={clearAllTenders}
          className="w-full px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Clear All Tenders
        </button>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded text-xs text-gray-600">
        <strong>✅ Scalable System:</strong>
        <div className="mt-1 space-y-1">
          <div>• New user registrations → Start as "Pending"</div>
          <div>• Admin can manage any registered user</div>
          <div>• System works for unlimited users</div>
          <div>• Dynamic status changes affect all users</div>
        </div>
      </div>

      <div className="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-600">
        <strong>Test Instructions:</strong>
        <ol className="mt-1 space-y-1">
          <li>1. Create a test tender using the button above</li>
          <li>2. Register new users or use test accounts</li>
          <li>3. Admin can change any user's status</li>
          <li>4. Verify tender visibility per user status</li>
        </ol>
      </div>
    </div>
  );
};

export default TenderTestHelper;
