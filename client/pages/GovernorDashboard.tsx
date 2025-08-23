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
  TrendingDown,
  Brain,
  Lightbulb,
  Cpu,
  Sparkles,
  BarChart2,
  LineChart as LineChartIcon,
  Calculator,
  Percent,
  Timer,
  AlertCircle,
  CheckSquare,
  Bookmark,
  Flag,
  MapIcon,
  Ruler,
  Package,
  Truck,
  Factory,
  School,
  Hospital,
  Home,
  Wrench,
  Leaf
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
  ComposedChart,
  Treemap,
  ScatterChart,
  Scatter
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

// AI Insights Data
const aiInsights = [
  {
    title: 'Procurement Efficiency Prediction',
    insight: 'Based on current trends, procurement efficiency is projected to reach 92% by Q4 2024',
    confidence: 87,
    impact: 'High',
    icon: Brain,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    recommendation: 'Optimize tender evaluation process in Works & Infrastructure ministry'
  },
  {
    title: 'Budget Optimization Opportunity',
    insight: 'AI analysis suggests potential savings of ₦1.2B through contract consolidation',
    confidence: 93,
    impact: 'Very High',
    icon: Calculator,
    color: 'text-green-600',
    bg: 'bg-green-50',
    recommendation: 'Implement bulk purchasing strategy for common items across MDAs'
  },
  {
    title: 'Risk Alert: Delayed Projects',
    insight: 'Pattern analysis indicates 15% probability of delays in infrastructure projects',
    confidence: 78,
    impact: 'Medium',
    icon: AlertCircle,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    recommendation: 'Deploy additional project management resources to high-risk projects'
  },
  {
    title: 'Vendor Performance Insights',
    insight: 'Top 10% of vendors deliver 23% faster than average, creating optimization potential',
    confidence: 91,
    impact: 'High',
    icon: Sparkles,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    recommendation: 'Establish preferred vendor program with performance incentives'
  }
];

const mdaSpendingData = [
  { name: 'Works & Infrastructure', value: 3500, percentage: 35, color: '#10B981', budget: 4000, spent: 3500, efficiency: 88 },
  { name: 'Health', value: 2200, percentage: 22, color: '#3B82F6', budget: 2800, spent: 2200, efficiency: 92 },
  { name: 'Education', value: 1800, percentage: 18, color: '#8B5CF6', budget: 2200, spent: 1800, efficiency: 85 },
  { name: 'Agriculture', value: 1200, percentage: 12, color: '#F59E0B', budget: 1500, spent: 1200, efficiency: 90 },
  { name: 'Others', value: 1300, percentage: 13, color: '#EF4444', budget: 1600, spent: 1300, efficiency: 87 }
];

const procurementTrendData = [
  { month: 'Jan', tenders: 45, contracts: 38, value: 1200, efficiency: 84, satisfaction: 4.2, savings: 120 },
  { month: 'Feb', tenders: 52, contracts: 41, value: 1350, efficiency: 79, satisfaction: 4.1, savings: 95 },
  { month: 'Mar', tenders: 48, contracts: 44, value: 1180, efficiency: 92, satisfaction: 4.5, savings: 180 },
  { month: 'Apr', tenders: 61, contracts: 52, value: 1580, efficiency: 85, satisfaction: 4.3, savings: 156 },
  { month: 'May', tenders: 58, contracts: 49, value: 1420, efficiency: 84, satisfaction: 4.4, savings: 142 },
  { month: 'Jun', tenders: 67, contracts: 58, value: 1750, efficiency: 87, satisfaction: 4.6, savings: 205 }
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

// Enhanced project data with detailed analytics
const topProjectsData = [
  { 
    name: 'Kano-Kaduna Express Road', 
    value: 850, 
    status: 'On Track', 
    completion: 65, 
    risk: 'Low', 
    timeline: 'Q4 2024',
    category: 'Infrastructure',
    contractors: 3,
    milestones: { completed: 8, total: 12 },
    budget_utilization: 62,
    quality_score: 4.2,
    local_impact: 'High',
    employment_created: 1240,
    icon: Truck,
    trend_data: [60, 62, 65, 65]
  },
  { 
    name: 'State Hospital Complex Upgrade', 
    value: 620, 
    status: 'At Risk', 
    completion: 45, 
    risk: 'High', 
    timeline: 'Q1 2025',
    category: 'Healthcare',
    contractors: 2,
    milestones: { completed: 5, total: 14 },
    budget_utilization: 52,
    quality_score: 3.8,
    local_impact: 'Very High',
    employment_created: 890,
    icon: Hospital,
    trend_data: [40, 42, 44, 45]
  },
  { 
    name: 'Schools Infrastructure Program', 
    value: 480, 
    status: 'Ahead of Schedule', 
    completion: 78, 
    risk: 'Low', 
    timeline: 'Q3 2024',
    category: 'Education',
    contractors: 5,
    milestones: { completed: 11, total: 13 },
    budget_utilization: 74,
    quality_score: 4.5,
    local_impact: 'Very High',
    employment_created: 650,
    icon: School,
    trend_data: [70, 74, 76, 78]
  },
  { 
    name: 'Agricultural Mechanization', 
    value: 320, 
    status: 'Completed', 
    completion: 100, 
    risk: 'None', 
    timeline: 'Completed',
    category: 'Agriculture',
    contractors: 1,
    milestones: { completed: 8, total: 8 },
    budget_utilization: 98,
    quality_score: 4.7,
    local_impact: 'High',
    employment_created: 420,
    icon: Leaf,
    trend_data: [95, 97, 99, 100]
  },
  { 
    name: 'Smart City IT Infrastructure', 
    value: 250, 
    status: 'On Track', 
    completion: 32, 
    risk: 'Medium', 
    timeline: 'Q2 2025',
    category: 'Technology',
    contractors: 2,
    milestones: { completed: 3, total: 10 },
    budget_utilization: 28,
    quality_score: 4.1,
    local_impact: 'Medium',
    employment_created: 180,
    icon: Monitor,
    trend_data: [25, 28, 30, 32]
  }
];

const alertsData = [
  { type: 'Delayed Tenders', count: 12, severity: 'high', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', priority: 'Critical' },
  { type: 'Contract Variations', count: 8, severity: 'medium', icon: Activity, color: 'text-yellow-600', bg: 'bg-yellow-50', priority: 'Medium' },
  { type: 'Pending NOC Approvals', count: 15, severity: 'high', icon: Shield, color: 'text-red-600', bg: 'bg-red-50', priority: 'High' },
  { type: 'Budget Overruns', count: 5, severity: 'low', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', priority: 'Low' }
];

// Additional analytics data
const contractAnalytics = [
  { period: 'Q1 2024', awarded: 38, value: 3200, avg_duration: 26, satisfaction: 4.1 },
  { period: 'Q2 2024', awarded: 45, value: 4100, avg_duration: 24, satisfaction: 4.3 },
  { period: 'Q3 2024', awarded: 52, value: 4800, avg_duration: 22, satisfaction: 4.5 },
  { period: 'Q4 2024', awarded: 58, value: 5200, avg_duration: 21, satisfaction: 4.6 }
];

const vendorPerformance = [
  { category: 'Infrastructure', avgRating: 4.2, onTimeDelivery: 87, costEfficiency: 91 },
  { category: 'Healthcare', avgRating: 4.5, onTimeDelivery: 92, costEfficiency: 88 },
  { category: 'Education', avgRating: 4.3, onTimeDelivery: 89, costEfficiency: 93 },
  { category: 'Agriculture', avgRating: 4.6, onTimeDelivery: 94, costEfficiency: 95 },
  { category: 'Technology', avgRating: 4.1, onTimeDelivery: 83, costEfficiency: 86 }
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

const AIInsightCard = ({ insight }: { insight: any }) => (
  <div className={`${insight.bg} border border-opacity-20 rounded-xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group`}>
    <div className="flex items-start space-x-3 mb-3">
      <div className={`p-2 rounded-lg ${insight.color} bg-opacity-10 flex-shrink-0`}>
        <insight.icon className={`h-5 w-5 ${insight.color}`} />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
        <p className="text-sm text-gray-700 mb-2">{insight.insight}</p>
      </div>
    </div>
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <span className="text-gray-500">Confidence:</span>
          <span className="font-medium">{insight.confidence}%</span>
        </div>
        <Badge variant="outline" className={`${insight.color} border-current`}>
          {insight.impact} Impact
        </Badge>
      </div>
    </div>
    <div className="mt-3 p-2 bg-white rounded-lg border border-gray-100">
      <p className="text-xs text-gray-600">
        <Lightbulb className="h-3 w-3 inline mr-1" />
        <strong>Recommendation:</strong> {insight.recommendation}
      </p>
    </div>
  </div>
);

const EnhancedProjectCard = ({ project }: { project: any }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'Ahead of Schedule': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'On Track': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'At Risk': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Delayed': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'None': return 'text-gray-500';
      case 'Low': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'High': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-white shadow-sm">
              <project.icon className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                {project.name}
              </h4>
              <p className="text-sm text-gray-600">{project.category} • ₦{project.value}M</p>
            </div>
          </div>
          <Badge className={`${getStatusColor(project.status)} border`}>
            {project.status}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-4">
        {/* Progress and Timeline */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Overall Progress</span>
            <span className="font-bold text-lg">{project.completion}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-green-600 h-3 rounded-full transition-all duration-1000 relative"
              style={{ width: `${project.completion}%` }}
            >
              <div className="absolute right-0 top-0 h-full w-2 bg-white rounded-full opacity-60"></div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Milestones</p>
            <p className="font-bold text-lg">{project.milestones.completed}/{project.milestones.total}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Budget Used</p>
            <p className="font-bold text-lg">{project.budget_utilization}%</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Quality Score</p>
            <p className="font-bold text-lg flex items-center justify-center">
              {project.quality_score}/5 <Star className="h-3 w-3 ml-1 text-yellow-500" />
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Jobs Created</p>
            <p className="font-bold text-lg">{project.employment_created}</p>
          </div>
        </div>

        {/* Risk and Impact */}
        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-500">Risk Level</p>
            <p className={`font-medium ${getRiskColor(project.risk)}`}>{project.risk}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Local Impact</p>
            <p className="font-medium text-gray-900">{project.local_impact}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Timeline</p>
            <p className="font-medium text-gray-900">{project.timeline}</p>
          </div>
        </div>

        {/* Mini Progress Trend */}
        <div className="pt-2 border-t">
          <p className="text-xs text-gray-500 mb-2">Progress Trend (Last 4 Months)</p>
          <div className="flex justify-between items-end h-8">
            {project.trend_data.map((value: number, index: number) => (
              <div 
                key={index}
                className="bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-sm w-6"
                style={{ height: `${(value / 100) * 32}px` }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

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
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600">
        <div className="px-6 py-16 lg:py-20">
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
                  AI-powered strategic oversight of Kano State's procurement ecosystem
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

          {/* AI Insights Section */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl">
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 border-b">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-100 to-purple-100">
                    <Brain className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">AI Strategic Insights</h3>
                    <p className="text-gray-600 text-sm">Intelligent analysis and recommendations</p>
                  </div>
                  <div className="flex items-center space-x-1 ml-auto">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-sm text-blue-600 font-medium">Live AI</span>
                  </div>
                </div>
              </div>
              <CardContent className="p-6 space-y-4 max-h-96 overflow-y-auto">
                {aiInsights.map((insight, index) => (
                  <AIInsightCard key={index} insight={insight} />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Spending & Vendor Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Spending Chart */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Budget vs Spending vs Efficiency</h3>
                    <p className="text-gray-600">Comprehensive ministry performance analysis</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-emerald-600" />
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      Real-time
                    </Badge>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={mdaSpendingData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="budget" fill="#e5e7eb" name="Budget (₦M)" radius={[2, 2, 0, 0]} />
                    <Bar yAxisId="left" dataKey="spent" fill="#10B981" name="Spent (₦M)" radius={[2, 2, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#8B5CF6" strokeWidth={3} name="Efficiency %" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Vendor Performance Analytics */}
          <div>
            <Card className="border-0 shadow-xl">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 border-b">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-orange-100">
                    <Award className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Vendor Performance</h3>
                    <p className="text-gray-600 text-sm">Category-wise excellence metrics</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                {vendorPerformance.map((vendor, index) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-gray-900">{vendor.category}</h4>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-bold">{vendor.avgRating}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">On-time Delivery</span>
                        <span className="font-medium">{vendor.onTimeDelivery}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                          style={{ width: `${vendor.onTimeDelivery}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Cost Efficiency</span>
                        <span className="font-medium">{vendor.costEfficiency}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                          style={{ width: `${vendor.costEfficiency}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Advanced Procurement Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contract Analytics */}
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Contract Award Analytics</h3>
                  <p className="text-gray-600">Quarterly performance and satisfaction trends</p>
                </div>
                <div className="p-2 rounded-lg bg-indigo-100">
                  <BarChart2 className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={contractAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="period" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="awarded" fill="#3B82F6" name="Contracts Awarded" />
                  <Line yAxisId="right" type="monotone" dataKey="satisfaction" stroke="#10B981" strokeWidth={3} name="Satisfaction" />
                  <Line yAxisId="left" type="monotone" dataKey="avg_duration" stroke="#F59E0B" strokeWidth={3} name="Avg Duration (days)" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Procurement Savings Analytics */}
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Procurement Savings</h3>
                  <p className="text-gray-600">Cost optimization and efficiency gains</p>
                </div>
                <div className="p-2 rounded-lg bg-green-100">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={procurementTrendData}>
                  <defs>
                    <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`₦${value}M`, 'Savings']}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="savings" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    fill="url(#savingsGradient)"
                    name="Monthly Savings"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Major Projects Section */}
        <Card className="border-0 shadow-xl">
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-emerald-100">
                  <Briefcase className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Major Infrastructure Projects</h3>
                  <p className="text-gray-600">Comprehensive project analytics and performance tracking</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  {topProjectsData.length} Active Projects
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  ₦{topProjectsData.reduce((sum, p) => sum + p.value, 0)}M Total Value
                </Badge>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {topProjectsData.map((project, index) => (
                <EnhancedProjectCard key={index} project={project} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Geographic Distribution Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Geographic Information Card */}
          <Card className="border-0 shadow-xl">
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-teal-100">
                  <Globe className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Geographic Distribution</h3>
                  <p className="text-gray-600 text-sm">Project activity by zone</p>
                </div>
              </div>
            </div>
            <CardContent className="p-6 space-y-4">
              {[
                { zone: 'Kano Municipal', projects: 28, value: 2400, status: 'High Activity' },
                { zone: 'Fagge', projects: 15, value: 1200, status: 'Medium Activity' },
                { zone: 'Dala', projects: 12, value: 980, status: 'Medium Activity' },
                { zone: 'Gwale', projects: 18, value: 1350, status: 'High Activity' },
                { zone: 'Tarauni', projects: 10, value: 750, status: 'Low Activity' },
                { zone: 'Nassarawa', projects: 22, value: 1800, status: 'High Activity' }
              ].map((zone, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all duration-300 group">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg bg-white shadow-sm">
                      <MapPin className="h-4 w-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">{zone.zone}</p>
                      <p className="text-sm text-gray-600">{zone.projects} active projects</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-teal-600">₦{zone.value}M</p>
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

          {/* Enhanced Geographic with Real-time Analytics */}
          <Card className="border-0 shadow-xl">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Regional Analytics</h3>
                    <p className="text-gray-600 text-sm">Performance and impact metrics</p>
                  </div>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              {/* Quick Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { value: 105, label: 'Total Projects', icon: Package, color: 'text-blue-500' },
                  { value: 89, label: 'Completion Rate', icon: CheckSquare, color: 'text-green-500' },
                  { value: 44, label: 'Zones Covered', icon: MapIcon, color: 'text-purple-500' },
                  { value: 3680, label: 'Jobs Created', icon: Users, color: 'text-orange-500' }
                ].map((metric, index) => (
                  <MetricGauge
                    key={index}
                    label={metric.label}
                    value={metric.value}
                    color={metric.color}
                  />
                ))}
              </div>

              {/* Top Performing Zones */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900 mb-3">Top Performing Zones</h4>
                {[
                  { zone: 'Kano Municipal', completion: 78, growth: '+15%' },
                  { zone: 'Nassarawa', completion: 80, growth: '+18%' },
                  { zone: 'Gwale', completion: 75, growth: '+22%' }
                ].map((zone, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-white to-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{zone.zone}</p>
                      <p className="text-sm text-gray-600">Growth: {zone.growth}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-600">{zone.completion}%</p>
                      <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full"
                          style={{ width: `${zone.completion}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Geographic Impact Analysis */}
        <Card className="border-0 shadow-xl">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-indigo-100">
                  <MapPin className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Comprehensive Geographic Impact</h3>
                  <p className="text-gray-600 text-sm">Regional development and economic transformation</p>
                </div>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {[
                { zone: 'Kano Municipal', projects: 28, value: 2400, activity: 'High', growth: '+15%', jobs: 1240, completion: 78, population: '3.2M' },
                { zone: 'Fagge', projects: 15, value: 1200, activity: 'Medium', growth: '+8%', jobs: 680, completion: 82, population: '1.8M' },
                { zone: 'Gwale', projects: 18, value: 1350, activity: 'High', growth: '+22%', jobs: 890, completion: 75, population: '2.1M' },
                { zone: 'Nassarawa', projects: 22, value: 1800, activity: 'High', growth: '+18%', jobs: 870, completion: 80, population: '2.4M' }
              ].map((zone, index) => (
                <div key={index} className="p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-indigo-100">
                      <MapPin className="h-4 w-4 text-indigo-600" />
                    </div>
                    <Badge variant="outline" className={
                      zone.activity === 'High' ? 'text-green-600 border-green-200 bg-green-50' :
                      'text-yellow-600 border-yellow-200 bg-yellow-50'
                    }>
                      {zone.activity}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">{zone.zone}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Population:</span>
                      <span className="font-medium">{zone.population}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Projects:</span>
                      <span className="font-medium">{zone.projects}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Investment:</span>
                      <span className="font-medium">₦{zone.value}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Jobs:</span>
                      <span className="font-medium">{zone.jobs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Growth:</span>
                      <span className="font-medium text-green-600">{zone.growth}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Completion:</span>
                      <span className="font-medium">{zone.completion}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${zone.completion}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Executive Summary Footer */}
        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="relative overflow-hidden">
            {/* Animated background with mesh gradient - same as header */}
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
              <div className="absolute top-4 left-20 w-8 h-8 bg-white/10 rounded-lg rotate-45 animate-pulse" />
              <div className="absolute top-8 right-32 w-6 h-6 bg-emerald-400/20 rounded-full animate-bounce" />
              <div className="absolute bottom-8 left-1/4 w-4 h-4 bg-teal-400/30 rounded-sm rotate-12 animate-spin" style={{ animationDuration: '3s' }} />
              <div className="absolute top-12 right-1/4 w-10 h-10 border-2 border-white/20 rounded-full" />
            </div>

            <div className="relative text-white p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                  { icon: CheckCircle, value: '94.2%', label: 'Success Rate', trend: '+2.1%', description: 'Project completion success' },
                  { icon: Clock, value: '18 days', label: 'Avg Processing', trend: '-3 days', description: 'Tender to award cycle' },
                  { icon: Shield, value: '89%', label: 'Compliance Score', trend: '+5%', description: 'Regulatory adherence' },
                  { icon: Star, value: '4.8/5', label: 'Vendor Rating', trend: '+0.3', description: 'Vendor satisfaction' }
                ].map((stat, index) => (
                  <div key={index} className="text-center group cursor-pointer">
                    <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-xl mx-auto mb-4 group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                      <stat.icon className="h-8 w-8" />
                    </div>
                    <p className="text-4xl font-bold mb-2">{stat.value}</p>
                    <p className="text-emerald-100 text-lg font-medium">{stat.label}</p>
                    <p className="text-emerald-200 text-sm mt-1">{stat.trend} this month</p>
                    <p className="text-emerald-300 text-xs mt-1">{stat.description}</p>
                  </div>
                ))}
              </div>
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
