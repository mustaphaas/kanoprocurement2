import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Wifi,
  Database,
  Network,
  Calendar,
  Bell,
  Settings,
  Monitor,
  Smartphone,
  Laptop,
  Crown,
  Layers,
  PieChart,
  TrendingDown
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
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
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
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
    value: 156,
    subtitle: 'State-wide projects',
    trend: '+12%',
    trendDirection: 'up',
    icon: FileText,
    gradient: 'from-emerald-500 to-teal-600',
    bgGradient: 'from-emerald-50 to-teal-50',
    shadowColor: 'shadow-emerald-500/20',
    change: 18
  },
  {
    title: 'Contract Value',
    value: '8.2B',
    subtitle: 'Naira awarded',
    trend: '+18%',
    trendDirection: 'up',
    icon: DollarSign,
    gradient: 'from-yellow-500 to-orange-600',
    bgGradient: 'from-yellow-50 to-orange-50',
    shadowColor: 'shadow-yellow-500/20',
    change: 1.2
  },
  {
    title: 'MDAs Engaged',
    value: 43,
    subtitle: 'Active ministries',
    trend: '+9%',
    trendDirection: 'up',
    icon: Building2,
    gradient: 'from-blue-500 to-indigo-600',
    bgGradient: 'from-blue-50 to-indigo-50',
    shadowColor: 'shadow-blue-500/20',
    change: 4
  },
  {
    title: 'Cycle Time',
    value: 24,
    subtitle: 'Days average',
    trend: '-12%',
    trendDirection: 'down',
    icon: Clock,
    gradient: 'from-purple-500 to-pink-600',
    bgGradient: 'from-purple-50 to-pink-50',
    shadowColor: 'shadow-purple-500/20',
    change: -3
  }
];

// Real-time data simulation
const realTimeMetrics = [
  { label: 'CPU Usage', value: 67, color: 'bg-blue-500' },
  { label: 'Memory', value: 78, color: 'bg-green-500' },
  { label: 'Network', value: 45, color: 'bg-purple-500' },
  { label: 'Storage', value: 89, color: 'bg-orange-500' }
];

const systemHealth = [
  { component: 'Database', status: 'Optimal', uptime: '99.98%', color: 'text-green-600', bg: 'bg-green-50' },
  { component: 'API Gateway', status: 'Optimal', uptime: '99.95%', color: 'text-green-600', bg: 'bg-green-50' },
  { component: 'File Storage', status: 'Warning', uptime: '99.12%', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { component: 'Email Service', status: 'Optimal', uptime: '99.89%', color: 'text-green-600', bg: 'bg-green-50' }
];

const mdaSpendingData = [
  { name: 'Works & Infrastructure', value: 3500, percentage: 35, color: '#10B981', budget: 4000, spent: 3500 },
  { name: 'Health', value: 2200, percentage: 22, color: '#3B82F6', budget: 2800, spent: 2200 },
  { name: 'Education', value: 1800, percentage: 18, color: '#8B5CF6', budget: 2200, spent: 1800 },
  { name: 'Agriculture', value: 1200, percentage: 12, color: '#F59E0B', budget: 1500, spent: 1200 },
  { name: 'Others', value: 1300, percentage: 13, color: '#EF4444', budget: 1600, spent: 1300 }
];

const procurementTrendData = [
  { month: 'Jan', tenders: 45, contracts: 38, value: 1200, efficiency: 84, satisfaction: 4.2 },
  { month: 'Feb', tenders: 52, contracts: 41, value: 1350, efficiency: 79, satisfaction: 4.1 },
  { month: 'Mar', tenders: 48, contracts: 44, value: 1180, efficiency: 92, satisfaction: 4.5 },
  { month: 'Apr', tenders: 61, contracts: 52, value: 1580, efficiency: 85, satisfaction: 4.3 },
  { month: 'May', tenders: 58, contracts: 49, value: 1420, efficiency: 84, satisfaction: 4.4 },
  { month: 'Jun', tenders: 67, contracts: 58, value: 1750, efficiency: 87, satisfaction: 4.6 }
];

// Performance radar data
const performanceData = [
  { metric: 'Efficiency', current: 87, target: 90, fullMark: 100 },
  { metric: 'Transparency', current: 92, target: 95, fullMark: 100 },
  { metric: 'Speed', current: 78, target: 85, fullMark: 100 },
  { metric: 'Compliance', current: 89, target: 95, fullMark: 100 },
  { metric: 'Quality', current: 85, target: 90, fullMark: 100 },
  { metric: 'Innovation', current: 73, target: 80, fullMark: 100 }
];

const topProjectsData = [
  { name: 'Kano-Kaduna Express Road', value: 850, status: 'On Track', completion: 65, risk: 'Low', timeline: 'Q4 2024' },
  { name: 'State Hospital Upgrade', value: 620, status: 'Delayed', completion: 45, risk: 'High', timeline: 'Q1 2025' },
  { name: 'School Infrastructure', value: 480, status: 'On Track', completion: 78, risk: 'Medium', timeline: 'Q3 2024' },
  { name: 'Agricultural Equipment', value: 320, status: 'Completed', completion: 100, risk: 'None', timeline: 'Completed' },
  { name: 'IT Infrastructure', value: 250, status: 'On Track', completion: 32, risk: 'Low', timeline: 'Q2 2025' }
];

const alertsData = [
  { type: 'Delayed Tenders', count: 12, severity: 'high', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', priority: 'Critical' },
  { type: 'Contract Variations', count: 8, severity: 'medium', icon: Activity, color: 'text-yellow-600', bg: 'bg-yellow-50', priority: 'Medium' },
  { type: 'Pending NOC Approvals', count: 15, severity: 'high', icon: Shield, color: 'text-red-600', bg: 'bg-red-50', priority: 'High' },
  { type: 'Budget Overruns', count: 5, severity: 'low', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', priority: 'Low' }
];

// Animated counter component
const AnimatedCounter = ({ value, duration = 2000 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value.toString());
    if (start === end) return;

    const totalSteps = duration / 16;
    const increment = end / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count}</span>;
};

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
          <div className={`flex items-center text-sm font-medium ${data.trendDirection === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {data.trendDirection === 'up' ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
            {data.trend}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">{data.title}</h3>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {typeof data.value === 'number' ? <AnimatedCounter value={data.value} /> : data.value}
          </p>
          <p className="text-sm text-gray-500">{data.subtitle}</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

const MetricGauge = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="text-center">
    <div className="relative w-20 h-20 mx-auto mb-2">
      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
        <path
          d="M18 2.0845 A 15.9155 15.9155 0 0 1 33.9155 18 A 15.9155 15.9155 0 0 1 18 33.9155 A 15.9155 15.9155 0 0 1 2.0845 18 A 15.9155 15.9155 0 0 1 18 2.0845"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="2"
        />
        <path
          d="M18 2.0845 A 15.9155 15.9155 0 0 1 33.9155 18 A 15.9155 15.9155 0 0 1 18 33.9155 A 15.9155 15.9155 0 0 1 2.0845 18 A 15.9155 15.9155 0 0 1 18 2.0845"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray={`${value}, 100`}
          className={color}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-gray-900">{value}%</span>
      </div>
    </div>
    <p className="text-xs text-gray-600">{label}</p>
  </div>
);

export default function GovernorDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30">
      {/* Ultra-Modern Executive Header */}
      <div className="relative overflow-hidden">
        {/* Animated background with mesh gradient */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-emerald-900 to-teal-900" />
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-transparent to-teal-500/20" />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
            <div className="absolute top-0 right-0 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
            <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
          </div>
        </div>

        {/* Floating geometric shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-8 h-8 bg-white/10 rounded-lg rotate-45 animate-pulse" />
          <div className="absolute top-40 right-32 w-6 h-6 bg-emerald-400/20 rounded-full animate-bounce" />
          <div className="absolute bottom-40 left-1/4 w-4 h-4 bg-teal-400/30 rounded-sm rotate-12 animate-spin" style={{ animationDuration: '3s' }} />
          <div className="absolute top-60 right-1/4 w-10 h-10 border-2 border-white/20 rounded-full" />
        </div>

        <div className="relative px-6 py-16 lg:py-20">
          <div className="max-w-7xl mx-auto">
            {/* Top Bar with Governor Info */}
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-2xl">
                    <Crown className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="text-white">
                  <h1 className="text-2xl font-bold">Governor Abba Kabir Yusuf</h1>
                  <p className="text-emerald-200">Executive State Overview</p>
                  <div className="flex items-center mt-1 space-x-4">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-sm text-emerald-200">Live Session</span>
                    </div>
                    <div className="text-sm text-emerald-200">
                      {currentTime.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden lg:flex items-center space-x-8">
                {/* Quick Action Buttons */}
                <div className="flex space-x-3">
                  <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <Bell className="h-4 w-4 mr-2" />
                    Alerts
                  </Button>
                  <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
            </div>

            {/* Executive Summary Banner */}
            <div className="mb-12">
              <div className="text-center mb-8">
                <h2 className="text-5xl lg:text-6xl font-bold text-white mb-4">
                  Command Center
                </h2>
                <p className="text-xl text-emerald-100 max-w-3xl mx-auto">
                  Real-time intelligence and strategic oversight of Kano State's procurement ecosystem
                </p>
              </div>

              {/* Live Metrics Banner */}
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <Activity className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="text-white font-bold">99.9%</p>
                      <p className="text-emerald-200 text-sm">Uptime</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-white font-bold">2,847</p>
                      <p className="text-emerald-200 text-sm">Active Users</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <Monitor className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="text-white font-bold">156</p>
                      <p className="text-emerald-200 text-sm">Live Tenders</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <Database className="h-5 w-5 text-yellow-400" />
                    <div>
                      <p className="text-white font-bold">₦8.2B</p>
                      <p className="text-emerald-200 text-sm">Total Value</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-emerald-400" />
                    <div>
                      <p className="text-white font-bold">44</p>
                      <p className="text-emerald-200 text-sm">LGAs</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <Zap className="h-5 w-5 text-orange-400" />
                    <div>
                      <p className="text-white font-bold">87%</p>
                      <p className="text-emerald-200 text-sm">Efficiency</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Health Indicators */}
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-4">
                {realTimeMetrics.map((metric, index) => (
                  <div key={index} className="bg-black/20 backdrop-blur-md rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-sm font-medium">{metric.label}</span>
                      <span className="text-emerald-200 text-sm">{metric.value}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className={`${metric.color} h-2 rounded-full transition-all duration-1000`}
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Enhanced KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiData.map((kpi, index) => (
            <KPICard key={index} data={kpi} />
          ))}
        </div>

        {/* Advanced Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Performance Radar */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Performance Analytics</h3>
                    <p className="text-gray-600">Multi-dimensional performance assessment</p>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Target className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={performanceData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                    <Radar
                      name="Current"
                      dataKey="current"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Target"
                      dataKey="target"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.1}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* System Health */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">System Health</h3>
                    <p className="text-gray-600 text-sm">Real-time system monitoring</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                {systemHealth.map((system, index) => (
                  <div key={index} className={`${system.bg} border border-opacity-20 rounded-xl p-4`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${system.status === 'Optimal' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        <div>
                          <p className="font-semibold text-gray-900">{system.component}</p>
                          <p className="text-sm text-gray-600">Uptime: {system.uptime}</p>
                        </div>
                      </div>
                      <Badge className={system.status === 'Optimal' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}>
                        {system.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Spending & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Spending Chart */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Budget vs Spending Analysis</h3>
                    <p className="text-gray-600">Ministry-wise budget utilization</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-emerald-600" />
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      Live Data
                    </Badge>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={mdaSpendingData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="budget" fill="#e5e7eb" name="Budget Allocated" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="spent" fill="#10B981" name="Amount Spent" radius={[2, 2, 0, 0]} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Alerts */}
          <div>
            <Card className="border-0 shadow-xl">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-red-100">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Critical Alerts</h3>
                      <p className="text-gray-600 text-sm">Priority actions required</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm text-red-600 font-medium">Live</span>
                  </div>
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                {alertsData.map((alert, index) => (
                  <div key={index} className={`${alert.bg} border border-opacity-20 rounded-xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${alert.color} bg-opacity-10`}>
                          <alert.icon className={`h-5 w-5 ${alert.color}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{alert.type}</p>
                          <p className="text-sm text-gray-600">{alert.count} items • {alert.priority} priority</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`${alert.color} border-current group-hover:scale-105 transition-transform`}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Procurement Trends */}
        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Advanced Procurement Analytics</h3>
                <p className="text-gray-600">Multi-metric performance tracking with predictive insights</p>
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
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full" />
                  <span className="text-sm text-gray-600">Satisfaction</span>
                </div>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={procurementTrendData}>
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
                <YAxis yAxisId="left" stroke="#6b7280" />
                <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="tenders" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  fill="url(#tenderGradient)"
                  name="Tenders Published"
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="contracts" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  fill="url(#contractGradient)"
                  name="Contracts Awarded"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  name="Efficiency %"
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="satisfaction" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  name="Satisfaction (1-5)"
                  dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Enhanced Projects and Geographic Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Major Projects */}
          <Card className="border-0 shadow-xl">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <Award className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Major Infrastructure Projects</h3>
                    <p className="text-gray-600 text-sm">Strategic state development initiatives</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  5 Active
                </Badge>
              </div>
            </div>
            <CardContent className="p-6 space-y-4">
              {topProjectsData.map((project, index) => (
                <div key={index} className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                      {project.name}
                    </h4>
                    <div className="flex space-x-2">
                      <Badge className={
                        project.status === 'Completed' ? 'bg-green-50 text-green-700' :
                        project.status === 'On Track' ? 'bg-blue-50 text-blue-700' :
                        'bg-red-50 text-red-700'
                      }>
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Value:</span>
                      <span className="font-medium ml-2">₦{project.value}M</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Timeline:</span>
                      <span className="font-medium ml-2">{project.timeline}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Risk Level:</span>
                      <span className={`font-medium ml-2 ${
                        project.risk === 'Low' ? 'text-green-600' :
                        project.risk === 'Medium' ? 'text-yellow-600' :
                        project.risk === 'High' ? 'text-red-600' : 'text-gray-600'
                      }`}>{project.risk}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Progress:</span>
                      <span className="font-medium ml-2">{project.completion}%</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${project.completion}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Enhanced Geographic with Metrics */}
          <Card className="border-0 shadow-xl">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <MapPin className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Geographic Distribution</h3>
                    <p className="text-gray-600 text-sm">Regional project activity and performance</p>
                  </div>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              {/* Quick Metrics */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { value: 105, label: 'Total Projects' },
                  { value: 89, label: 'Completion Rate' },
                  { value: 44, label: 'Zones Covered' },
                  { value: 12, label: 'High Activity' }
                ].map((metric, index) => (
                  <MetricGauge 
                    key={index}
                    label={metric.label}
                    value={metric.value}
                    color={index === 0 ? 'text-blue-500' : index === 1 ? 'text-green-500' : index === 2 ? 'text-purple-500' : 'text-orange-500'}
                  />
                ))}
              </div>

              {/* Zone Details */}
              <div className="space-y-3">
                {[
                  { zone: 'Kano Municipal', projects: 28, value: 2400, activity: 'High', growth: '+15%' },
                  { zone: 'Fagge', projects: 15, value: 1200, activity: 'Medium', growth: '+8%' },
                  { zone: 'Gwale', projects: 18, value: 1350, activity: 'High', growth: '+22%' },
                  { zone: 'Nassarawa', projects: 22, value: 1800, activity: 'High', growth: '+18%' }
                ].map((zone, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-white shadow-sm">
                        <MapPin className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">{zone.zone}</p>
                        <p className="text-sm text-gray-600">{zone.projects} projects • Growth {zone.growth}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-600">₦{zone.value}M</p>
                      <Badge variant="outline" className={
                        zone.activity === 'High' ? 'text-green-600 border-green-200 bg-green-50' :
                        'text-yellow-600 border-yellow-200 bg-yellow-50'
                      }>
                        {zone.activity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Executive Summary Footer */}
        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { icon: CheckCircle, value: '94.2%', label: 'Success Rate', trend: '+2.1%' },
                { icon: Clock, value: '18 days', label: 'Avg Processing', trend: '-3 days' },
                { icon: Shield, value: '89%', label: 'Compliance Score', trend: '+5%' },
                { icon: Star, value: '4.8/5', label: 'Vendor Rating', trend: '+0.3' }
              ].map((stat, index) => (
                <div key={index} className="text-center group cursor-pointer">
                  <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-xl mx-auto mb-4 group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                    <stat.icon className="h-8 w-8" />
                  </div>
                  <p className="text-4xl font-bold mb-2">{stat.value}</p>
                  <p className="text-emerald-100 text-lg">{stat.label}</p>
                  <p className="text-emerald-200 text-sm mt-1">{stat.trend} this month</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
