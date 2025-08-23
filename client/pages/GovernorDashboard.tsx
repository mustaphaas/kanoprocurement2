import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  Building2, 
  Clock, 
  AlertTriangle,
  MapPin,
  Award,
  Shield,
  Target,
  Users,
  Activity,
  Zap,
  Eye,
  BarChart3,
  Globe,
  Star,
  Briefcase,
  FileText,
  CheckCircle
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
  Legend,
  AreaChart,
  Area
} from 'recharts';

// Enhanced color palette with gradients
const COLORS = {
  primary: ['#1B5E20', '#2E7D33', '#4CAF50'],
  accent: ['#FFD700', '#FFA000', '#FF8F00'],
  warning: ['#FF6B35', '#FF5722', '#E64A19'],
  success: ['#4CAF50', '#66BB6A', '#81C784'],
  info: ['#2196F3', '#42A5F5', '#64B5F6'],
  purple: ['#673AB7', '#7E57C2', '#9575CD'],
  emerald: ['#10B981', '#34D399', '#6EE7B7'],
  rose: ['#F43F5E', '#FB7185', '#FDA4AF']
};

// Enhanced mock data
const kpiData = [
  {
    title: 'Active Tenders',
    value: '156',
    subtitle: 'State-wide projects',
    trend: '+12% this month',
    icon: FileText,
    gradient: 'from-emerald-500 to-teal-600',
    bgGradient: 'from-emerald-50 to-teal-50',
    shadowColor: 'shadow-emerald-500/20'
  },
  {
    title: 'Contract Value',
    value: '₦8.2B',
    subtitle: 'Total awarded',
    trend: '+18% this quarter',
    icon: DollarSign,
    gradient: 'from-yellow-500 to-orange-600',
    bgGradient: 'from-yellow-50 to-orange-50',
    shadowColor: 'shadow-yellow-500/20'
  },
  {
    title: 'MDAs Engaged',
    value: '43',
    subtitle: 'Active ministries',
    trend: '4 new this month',
    icon: Building2,
    gradient: 'from-blue-500 to-indigo-600',
    bgGradient: 'from-blue-50 to-indigo-50',
    shadowColor: 'shadow-blue-500/20'
  },
  {
    title: 'Cycle Time',
    value: '24 days',
    subtitle: 'Average processing',
    trend: '-3 days improved',
    icon: Clock,
    gradient: 'from-purple-500 to-pink-600',
    bgGradient: 'from-purple-50 to-pink-50',
    shadowColor: 'shadow-purple-500/20'
  }
];

const mdaSpendingData = [
  { name: 'Works & Infrastructure', value: 3500, percentage: 35, color: '#10B981' },
  { name: 'Health', value: 2200, percentage: 22, color: '#3B82F6' },
  { name: 'Education', value: 1800, percentage: 18, color: '#8B5CF6' },
  { name: 'Agriculture', value: 1200, percentage: 12, color: '#F59E0B' },
  { name: 'Others', value: 1300, percentage: 13, color: '#EF4444' }
];

const procurementTrendData = [
  { month: 'Jan', tenders: 45, contracts: 38, value: 1200, efficiency: 84 },
  { month: 'Feb', tenders: 52, contracts: 41, value: 1350, efficiency: 79 },
  { month: 'Mar', tenders: 48, contracts: 44, value: 1180, efficiency: 92 },
  { month: 'Apr', tenders: 61, contracts: 52, value: 1580, efficiency: 85 },
  { month: 'May', tenders: 58, contracts: 49, value: 1420, efficiency: 84 },
  { month: 'Jun', tenders: 67, contracts: 58, value: 1750, efficiency: 87 }
];

const topProjectsData = [
  { name: 'Kano-Kaduna Express Road', value: 850, status: 'On Track', completion: 65 },
  { name: 'State Hospital Upgrade', value: 620, status: 'Delayed', completion: 45 },
  { name: 'School Infrastructure', value: 480, status: 'On Track', completion: 78 },
  { name: 'Agricultural Equipment', value: 320, status: 'Completed', completion: 100 },
  { name: 'IT Infrastructure', value: 250, status: 'On Track', completion: 32 }
];

const geographicData = [
  { zone: 'Kano Municipal', projects: 28, value: 2400, status: 'High Activity' },
  { zone: 'Fagge', projects: 15, value: 1200, status: 'Medium Activity' },
  { zone: 'Dala', projects: 12, value: 980, status: 'Medium Activity' },
  { zone: 'Gwale', projects: 18, value: 1350, status: 'High Activity' },
  { zone: 'Tarauni', projects: 10, value: 750, status: 'Low Activity' },
  { zone: 'Nassarawa', projects: 22, value: 1800, status: 'High Activity' }
];

const alertsData = [
  { type: 'Delayed Tenders', count: 12, severity: 'high', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  { type: 'Contract Variations', count: 8, severity: 'medium', icon: Activity, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { type: 'Pending NOC Approvals', count: 15, severity: 'high', icon: Shield, color: 'text-red-600', bg: 'bg-red-50' },
  { type: 'Budget Overruns', count: 5, severity: 'low', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' }
];

const KPICard = ({ data }: { data: any }) => (
  <div className={`relative group cursor-pointer transform hover:scale-105 transition-all duration-500`}>
    <div className={`absolute inset-0 bg-gradient-to-br ${data.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500`} />
    <Card className={`relative border-0 ${data.shadowColor} shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${data.bgGradient} opacity-50`} />
      <CardContent className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${data.gradient} shadow-lg`}>
            <data.icon className="h-6 w-6 text-white" />
          </div>
          <div className="flex items-center text-green-600 text-sm font-medium">
            <TrendingUp className="h-4 w-4 mr-1" />
            {data.trend}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">{data.title}</h3>
          <p className="text-3xl font-bold text-gray-900 mb-1">{data.value}</p>
          <p className="text-sm text-gray-500">{data.subtitle}</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

const AlertCard = ({ alert }: { alert: any }) => (
  <div className={`${alert.bg} border border-opacity-20 rounded-xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${alert.color} bg-opacity-10`}>
          <alert.icon className={`h-5 w-5 ${alert.color}`} />
        </div>
        <div>
          <p className="font-semibold text-gray-900">{alert.type}</p>
          <p className="text-sm text-gray-600">{alert.count} items requiring attention</p>
        </div>
      </div>
      <Badge variant="outline" className={`${alert.color} border-current`}>
        {alert.severity.toUpperCase()}
      </Badge>
    </div>
  </div>
);

const ProjectCard = ({ project }: { project: any }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-50';
      case 'On Track': return 'text-blue-600 bg-blue-50';
      case 'Delayed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
          {project.name}
        </h4>
        <Badge className={getStatusColor(project.status)}>
          {project.status}
        </Badge>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Value:</span>
          <span className="font-medium">₦{project.value}M</span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress:</span>
            <span className="font-medium">{project.completion}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${project.completion}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function GovernorDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30">
      {/* Hero Header with Glass Morphism */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 via-green-800 to-teal-800" />
        <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"} />
        
        <div className="relative px-6 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-white">
                      Governor's Command Center
                    </h1>
                    <p className="text-emerald-100 text-lg lg:text-xl">
                      Real-time oversight of Kano State eProcurement ecosystem
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="hidden lg:flex items-center space-x-6">
                <div className="text-right text-white">
                  <p className="text-sm text-emerald-100">System Status</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    <span className="font-medium">Live & Operational</span>
                  </div>
                </div>
                <div className="text-right text-white">
                  <p className="text-sm text-emerald-100">Last Updated</p>
                  <p className="font-medium">{new Date().toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Activity, label: 'System Health', value: '99.9%', color: 'text-green-400' },
                { icon: Users, label: 'Active Users', value: '2,847', color: 'text-blue-400' },
                { icon: Globe, label: 'Locations', value: '44 LGAs', color: 'text-purple-400' },
                { icon: Zap, label: 'Processing', value: 'Real-time', color: 'text-yellow-400' }
              ].map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    <div>
                      <p className="text-white font-bold">{stat.value}</p>
                      <p className="text-emerald-100 text-sm">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiData.map((kpi, index) => (
            <KPICard key={index} data={kpi} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Spending Overview - Large Chart */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Ministry Spending Distribution</h3>
                    <p className="text-gray-600">Budget allocation across ministries</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-emerald-600" />
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      Updated Now
                    </Badge>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={mdaSpendingData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={140}
                      dataKey="value"
                      label={({ name, percentage }) => `${percentage}%`}
                      labelLine={false}
                    >
                      {mdaSpendingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`₦${value}M`, 'Amount']}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Alerts */}
          <div>
            <Card className="border-0 shadow-xl">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 border-b">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-red-100">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Active Alerts</h3>
                    <p className="text-gray-600 text-sm">Requires immediate attention</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                {alertsData.map((alert, index) => (
                  <AlertCard key={index} alert={alert} />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Procurement Trends */}
        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Procurement Activity Trends</h3>
                <p className="text-gray-600">Monthly performance and efficiency metrics</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                  <span className="text-sm text-gray-600">Tenders</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-sm text-gray-600">Contracts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full" />
                  <span className="text-sm text-gray-600">Efficiency</span>
                </div>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={procurementTrendData}>
                <defs>
                  <linearGradient id="tenderGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="contractGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="tenders" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  fill="url(#tenderGradient)"
                  name="Tenders Published"
                />
                <Area 
                  type="monotone" 
                  dataKey="contracts" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  fill="url(#contractGradient)"
                  name="Contracts Awarded"
                />
                <Line 
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  name="Efficiency %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bottom Grid - Projects and Geographic */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Projects */}
          <Card className="border-0 shadow-xl">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <Award className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Major Projects</h3>
                  <p className="text-gray-600 text-sm">Top 5 projects by contract value</p>
                </div>
              </div>
            </div>
            <CardContent className="p-6 space-y-4">
              {topProjectsData.map((project, index) => (
                <ProjectCard key={index} project={project} />
              ))}
            </CardContent>
          </Card>

          {/* Geographic Distribution */}
          <Card className="border-0 shadow-xl">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <MapPin className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Geographic Distribution</h3>
                  <p className="text-gray-600 text-sm">Project activity by zone</p>
                </div>
              </div>
            </div>
            <CardContent className="p-6 space-y-4">
              {geographicData.map((zone, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all duration-300 group">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg bg-white shadow-sm">
                      <MapPin className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">{zone.zone}</p>
                      <p className="text-sm text-gray-600">{zone.projects} active projects</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-600">₦{zone.value}M</p>
                    <Badge variant="outline" className={
                      zone.status === 'High Activity' ? 'text-green-600 border-green-200 bg-green-50' :
                      zone.status === 'Medium Activity' ? 'text-yellow-600 border-yellow-200 bg-yellow-50' :
                      'text-gray-600 border-gray-200 bg-gray-50'
                    }>
                      {zone.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Performance Summary Footer */}
        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mx-auto mb-3">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <p className="text-3xl font-bold mb-1">94.2%</p>
                <p className="text-emerald-100">Success Rate</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mx-auto mb-3">
                  <Clock className="h-6 w-6" />
                </div>
                <p className="text-3xl font-bold mb-1">18 days</p>
                <p className="text-emerald-100">Avg Processing</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mx-auto mb-3">
                  <Shield className="h-6 w-6" />
                </div>
                <p className="text-3xl font-bold mb-1">89%</p>
                <p className="text-emerald-100">Compliance Score</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mx-auto mb-3">
                  <Star className="h-6 w-6" />
                </div>
                <p className="text-3xl font-bold mb-1">4.8/5</p>
                <p className="text-emerald-100">Vendor Rating</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
