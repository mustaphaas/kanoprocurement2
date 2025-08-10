import React, { useState } from 'react';
import { type CompanyStatus } from '@/lib/dashboardConfig';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface StatusDemoProps {
  currentStatus: CompanyStatus;
  onStatusChange: (status: CompanyStatus) => void;
}

export const StatusDemo: React.FC<StatusDemoProps> = ({
  currentStatus,
  onStatusChange,
}) => {
  const statuses: { status: CompanyStatus; description: string; color: string }[] = [
    {
      status: 'Pending',
      description: 'New registration under review',
      color: 'bg-blue-100 text-blue-800',
    },
    {
      status: 'Approved',
      description: 'Full access to all features',
      color: 'bg-green-100 text-green-800',
    },
    {
      status: 'Suspended',
      description: 'Restricted due to compliance issues',
      color: 'bg-orange-100 text-orange-800',
    },
    {
      status: 'Blacklisted',
      description: 'Banned from participation',
      color: 'bg-red-100 text-red-800',
    },
  ];

  return (
    <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border p-4 max-w-sm">
      <h3 className="font-semibold text-gray-900 mb-3">Demo: Test User Status</h3>
      <p className="text-sm text-gray-600 mb-4">
        Switch between different user statuses to see dynamic dashboard changes:
      </p>
      
      <div className="space-y-2">
        {statuses.map(({ status, description, color }) => (
          <div key={status} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Badge className={color}>{status}</Badge>
                {currentStatus === status && (
                  <Badge variant="outline" className="text-xs">Current</Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            </div>
            <Button
              size="sm"
              variant={currentStatus === status ? "default" : "outline"}
              onClick={() => onStatusChange(status)}
              disabled={currentStatus === status}
              className="ml-2"
            >
              {currentStatus === status ? 'Active' : 'Switch'}
            </Button>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600">
        <strong>Notice:</strong> This demo panel shows how the dashboard dynamically adapts based on user status. In production, status would be determined by actual registration and approval processes.
      </div>
    </div>
  );
};

export default StatusDemo;
