import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  DollarSign, 
  Building2, 
  Clock, 
  AlertTriangle,
  ChevronRight,
  MapPin,
  Award,
  Shield,
  Target
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

// Premium color palette - Deep green with gold accents
const COLORS = {
  primary: '#1B5E20',      // Deep green
  secondary: '#2E7D33',    // Medium green
  accent: '#FFD700',       // Gold
  accent2: '#FFA000',      // Amber
  warning: '#FF6B35',      // Orange red
  success: '#4CAF50',      // Green
  background: '#F8FDF9',   // Very light green
  surface: '#FFFFFF',      // White
  text: '#1B5E20',         // Deep green
  textSecondary: '#558B63' // Medium green
};

// Mock data for visualizations
const mdaSpendingData = [
  { name: 'Works & Infrastructure', value: 3500, percentage: 35 },
  { name: 'Health', value: 2200, percentage: 22 },
  { name: 'Education', value: 1800, percentage: 18 },
  { name: 'Agriculture', value: 1200, percentage: 12 },
  { name: 'Others', value: 1300, percentage: 13 }
];

const topProjectsData = [
  { name: 'Kano-Kaduna Express Road', value: 850 },
  { name: 'State Hospital Upgrade', value: 620 },
  { name: 'School Infrastructure Project', value: 480 },
  { name: 'Agricultural Equipment', value: 320 },
  { name: 'IT Infrastructure', value: 250 }
];

const procurementTrendData = [
  { month: 'Jan', tenders: 45, contracts: 38, value: 1200 },
  { month: 'Feb', tenders: 52, contracts: 41, value: 1350 },
  { month: 'Mar', tenders: 48, contracts: 44, value: 1180 },
  { month: 'Apr', tenders: 61, contracts: 52, value: 1580 },
  { month: 'May', tenders: 58, contracts: 49, value: 1420 },
  { month: 'Jun', tenders: 67, contracts: 58, value: 1750 }
];

const alertsData = [
  { type: 'Delayed Tenders', count: 12, severity: 'high' },
  { type: 'Contract Variations', count: 8, severity: 'medium' },
  { type: 'Pending NOC Approvals', count: 15, severity: 'high' },
  { type: 'Budget Overruns', count: 5, severity: 'low' }
];

const geographicData = [
  { zone: 'Kano Municipal', projects: 28, value: 2400 },
  { zone: 'Fagge', projects: 15, value: 1200 },
  { zone: 'Dala', projects: 12, value: 980 },
  { zone: 'Gwale', projects: 18, value: 1350 },
  { zone: 'Tarauni', projects: 10, value: 750 },
  { zone: 'Nassarawa', projects: 22, value: 1800 }
];

const KeyMetricsCard = ({ title, value, subtitle, icon: Icon, trend, color }: any) => (
  <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
    <div className={`absolute inset-0 bg-gradient-to-br from-${color}-50 to-${color}-100 opacity-60`} />
    <CardContent className="relative p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-full bg-gradient-to-br from-${color}-500 to-${color}-600 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center mt-4 pt-4 border-t border-gray-100">
          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
          <span className="text-sm text-green-600 font-medium">{trend}</span>
        </div>
      )}
    </CardContent>
  </Card>
);

const AlertCard = ({ alert }: any) => {
  const severityColors = {
    high: 'bg-red-50 border-red-200 text-red-800',
    medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    low: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  return (
    <div className={`p-4 rounded-lg border ${severityColors[alert.severity]} hover:shadow-md transition-shadow cursor-pointer`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5" />
          <div>
            <p className="font-medium">{alert.type}</p>
            <p className="text-sm opacity-75">{alert.count} items</p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4" />
      </div>
    </div>
  );
};

export default function GovernorDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Executive Header */}
      <div className="bg-gradient-to-r from-green-800 via-green-700 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Governor's Command Center</h1>
              <p className="text-green-100 text-lg">Real-time overview of Kano State eProcurement ecosystem</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-green-100">Last Updated</p>
                <p className="font-medium">{new Date().toLocaleString()}</p>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Premium Navigation Tabs */}
          <TabsList className="bg-white/80 backdrop-blur-sm border shadow-lg p-1 h-auto rounded-xl">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
            >
              <Target className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="financial" 
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Financial Insights
            </TabsTrigger>
            <TabsTrigger 
              value="performance" 
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
            >
              <Award className="w-4 h-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger 
              value="alerts" 
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
            >
              <Shield className="w-4 h-4 mr-2" />
              Risk & Alerts
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KeyMetricsCard
                title="Active Tenders"
                value="156"
                subtitle="State-wide"
                icon={Building2}
                trend="+12% this month"
                color="blue"
              />
              <KeyMetricsCard
                title="Contract Value"
                value="₦8.2B"
                subtitle="Total awarded"
                icon={DollarSign}
                trend="+18% this quarter"
                color="green"
              />
              <KeyMetricsCard
                title="MDAs Engaged"
                value="43"
                subtitle="Active ministries"
                icon={Building2}
                trend="4 new this month"
                color="purple"
              />
              <KeyMetricsCard
                title="Avg Cycle Time"
                value="24 days"
                subtitle="Tender to award"
                icon={Clock}
                trend="-3 days improved"
                color="orange"
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* MDA Spending Distribution */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-800">Spending by Ministry</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mdaSpendingData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        dataKey="value"
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                      >
                        {mdaSpendingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`₦${value}M`, 'Amount']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Projects */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-800">Top 5 Projects by Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topProjectsData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip formatter={(value) => [`₦${value}M`, 'Value']} />
                      <Bar dataKey="value" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Procurement Trend */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800">Procurement Activity Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={procurementTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="tenders" 
                      stroke={COLORS.primary} 
                      strokeWidth={3}
                      name="Tenders Published"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="contracts" 
                      stroke={COLORS.accent} 
                      strokeWidth={3}
                      name="Contracts Awarded"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Insights Tab */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-800">Financial Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={procurementTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₦${value}M`, 'Contract Value']} />
                      <Bar dataKey="value" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-800">Budget Utilization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mdaSpendingData.slice(0, 4).map((mda, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{mda.name}</span>
                        <span className="text-gray-600">{mda.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${mda.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-800">Geographic Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {geographicData.map((zone, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium">{zone.zone}</p>
                            <p className="text-sm text-gray-600">{zone.projects} projects</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">₦{zone.value}M</p>
                          <p className="text-xs text-gray-500">Total value</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-800">Efficiency Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">94.2%</div>
                    <div className="text-gray-600">Tender Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">18 days</div>
                    <div className="text-gray-600">Average Processing Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-600 mb-2">89%</div>
                    <div className="text-gray-600">Compliance Score</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Risk & Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-800">Active Alerts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {alertsData.map((alert, index) => (
                    <AlertCard key={index} alert={alert} />
                  ))}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-800">Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-yellow-600 mb-2">Medium</div>
                      <div className="text-gray-600">Overall Risk Level</div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Compliance Risk</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Low</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Financial Risk</span>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Medium</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Operational Risk</span>
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">High</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
