import React, { useState, useEffect } from "react";
import { RefreshCw, CheckCircle, XCircle, Users, Eye } from "lucide-react";

export const TenderVisibilityStatus: React.FC = () => {
  const [tenderCount, setTenderCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const refreshStatus = () => {
    const recentTenders = JSON.parse(
      localStorage.getItem("recentTenders") || "[]",
    );
    const publishedTenders = recentTenders.filter(
      (t: any) => t.status === "Open",
    );
    setTenderCount(publishedTenders.length);
    setLastUpdated(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, 30000); // Refresh every 30 seconds like CompanyDashboard
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg border p-4 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">
          Tender Visibility Status
        </h3>
        <button
          onClick={refreshStatus}
          className="p-1 text-gray-500 hover:text-gray-700"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Active Tenders:</span>
          <span className="font-semibold text-green-600">{tenderCount}</span>
        </div>

        <div className="text-xs text-gray-500">Last updated: {lastUpdated}</div>

        <div className="border-t pt-3">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Company Approval (SuperUser Tab):
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                Approved
              </span>
              <span className="text-green-600">
                Full access to all {tenderCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <Eye className="h-3 w-3 text-blue-500 mr-1" />
                Pending Approval
              </span>
              <span className="text-blue-600">Awaiting review</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Pending users go through approval workflow
          </div>
        </div>

        <div className="border-t pt-3">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Company Status (Issues):
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <span className="h-3 w-3 bg-orange-500 rounded-full mr-1"></span>
                Suspended
              </span>
              <span className="text-orange-600">Compliance issues</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <XCircle className="h-3 w-3 text-red-500 mr-1" />
                Blacklisted
              </span>
              <span className="text-red-600">Banned from system</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Status issues requiring admin intervention
          </div>
        </div>

        <div className="border-t pt-3">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Test Company Logins:
          </h4>
          <div className="space-y-1 text-xs">
            <div className="font-medium text-gray-700">Company Approval:</div>
            <div>✅ approved@company.com / password123</div>
            <div>✅ testcompany@example.com / test123</div>
            <div>✅ demo@company.com / demo123</div>
            <div>⏳ pending@company.com / password123</div>
            <div className="font-medium text-gray-700 mt-2">
              Company Status:
            </div>
            <div>⚠️ suspended@company.com / password123</div>
            <div>❌ blacklisted@company.com / password123</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenderVisibilityStatus;
