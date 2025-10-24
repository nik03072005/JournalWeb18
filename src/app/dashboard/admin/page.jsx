'use client';

import { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { 
  Users, 
  BookOpen, 
  FileText, 
  Database, 
  TrendingUp, 
  Settings, 
  Eye,
  Plus,
  Edit,
  Shield,
  BarChart3,
  PieChart,
  Activity,
  Globe,
  Library,
  ChevronRight,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [extSubscription, setExtSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  //run auto update for admin subscription
  useEffect(() => {
    fetchStats();
  fetchExternalSubscription();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/stats');
      console.log('Received stats data:', response.data.data);
      console.log('Indexing breakdown:', response.data.data?.indexingBreakdown);
      setStats(response.data.data);
    } catch (err) {
      setError('Failed to fetch statistics');
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // External subscription check (authoritative for start/end/remaining)
  const fetchExternalSubscription = async () => {
    try {
      if (typeof window === 'undefined') return;
      const domain = window.location.hostname;
      // const domain = 'coemorigaon.digitallib.in';
      const res = await axios.get('https://api.digitallib.in/api/subscriptions/check', {
        params: { domain }
      });
      if (res.data?.exists && res.data?.active) {
        setExtSubscription({
          startDate: res.data.startDate,
          endDate: res.data.endDate,
          status: res.data.status,
          websiteName: res.data.websiteName,
          domain: res.data.domain
        });
      }
    } catch (err) {
      console.warn('External subscription check failed', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          {error}
        </div>
      </div>
    );
  }

  // Chart configurations
  const contentTypeChart = {
    labels: Object.keys(stats?.localTypeBreakdown || {}),
    datasets: [{
      label: 'Number of Items',
      data: Object.values(stats?.localTypeBreakdown || {}),
      backgroundColor: [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
        '#14B8A6', '#F472B6', '#A855F7', '#22C55E', '#F97316'
      ],
      borderColor: [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
        '#14B8A6', '#F472B6', '#A855F7', '#22C55E', '#F97316'
      ],
      borderWidth: 2
    }]
  };

  // Debug: Log content type chart data
  console.log('Content type chart data (all types):', {
    types: Object.keys(stats?.localTypeBreakdown || {}),
    counts: Object.values(stats?.localTypeBreakdown || {}),
    fullBreakdown: stats?.localTypeBreakdown
  });

  const typeBreakdownChart = {
    labels: Object.keys(stats?.localTypeBreakdown || {}),
    datasets: [{
      data: Object.values(stats?.localTypeBreakdown || {}),
      backgroundColor: [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
      ],
      borderWidth: 0
    }]
  };

  const userRoleChart = {
    labels: Object.keys(stats?.userRoleBreakdown || {}),
    datasets: [{
      data: Object.values(stats?.userRoleBreakdown || {}),
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
      borderWidth: 0
    }]
  };

  const indexingChart = {
    labels: ['Scopus', 'Web of Science', 'UGC', 'Peer Reviewed'],
    datasets: [{
      label: 'Publications Count',
      data: [
        stats?.indexingBreakdown?.['Scopus'] || 0,
        stats?.indexingBreakdown?.['Web of Science'] || 0,
        stats?.indexingBreakdown?.['UGC'] || 0,
        stats?.indexingBreakdown?.['Peer Reviewed'] || 0
      ],
      backgroundColor: [
        '#FF8C00', // Orange for Scopus
        '#DC2626', // Red for Web of Science  
        '#16A34A', // Green for UGC
        '#7C3AED'  // Purple for Peer Reviewed
      ],
      borderColor: [
        '#FF8C00',
        '#DC2626',
        '#16A34A', 
        '#7C3AED'
      ],
      borderWidth: 1,
      borderRadius: 4,
      borderSkipped: false
    }]
  };

  // Debug: Log indexing chart data
  console.log('Indexing chart data:', {
    scopus: stats?.indexingBreakdown?.['Scopus'] || 0,
    wos: stats?.indexingBreakdown?.['Web of Science'] || 0,
    ugc: stats?.indexingBreakdown?.['UGC'] || 0,
    peer: stats?.indexingBreakdown?.['Peer Reviewed'] || 0,
    fullBreakdown: stats?.indexingBreakdown
  });

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          font: {
            size: 10,
          },
        },
      },
    },
  };

  const indexingBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 0,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 10,
          font: {
            size: 10,
          },
        },
      },
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      },
    },
  };

  // Quick action items
  const quickActions = [
    {
      title: 'Manage Journals',
      description: 'Add, edit, or delete journal entries',
      href: '/dashboard/admin/item/manageJournals',
      icon: BookOpen,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Manage Subjects',
      description: 'Add or modify subject categories',
      href: '/dashboard/admin/item/setting/manageSubject',
      icon: FileText,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Manage Departments',
      description: 'Add or modify department list',
  href: '/dashboard/admin/item/setting/manageDepartment',
      icon: Database,
      color: 'bg-teal-500 hover:bg-teal-600'
    },
    {
      title: 'User Management',
      description: 'View and manage registered users',
      href: '/dashboard/admin/users/manageusers',
      icon: Users,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Analytics',
      description: 'View detailed analytics and reports',
      href: '/dashboard/admin/analytics/visitors',
      icon: BarChart3,
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      title: 'FAQ Management',
      description: 'Manage frequently asked questions',
      href: '/dashboard/admin/faq/manage',
      icon: Shield,
      color: 'bg-red-500 hover:bg-red-600'
    },
    {
      title: 'Edit News & Highlights Management',
      description: 'Create and manage blog posts',
      href: '/dashboard/admin/blog/editblog',
      icon: Edit,
      color: 'bg-indigo-500 hover:bg-indigo-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm lg:text-base text-gray-600">
            Digital Library of Kanya Mahavidyalaya - Administrative Overview
          </p>
        </div>

        {/* Admin Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 lg:gap-6">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl lg:text-2xl font-bold flex-shrink-0">
              A
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Administrator</h2>
              <p className="text-gray-600 mb-2 lg:mb-0">System Administrator</p>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 lg:gap-4 mt-3 text-xs lg:text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Shield size={16} />
                  Admin Role
                </div>
                <div className="flex items-center gap-1">
                  <Globe size={16} />
                  Digital Library Management System
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Details */}
        {extSubscription && (
          <div className="mb-6 lg:mb-8">
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 border-l-4 border-indigo-500">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-900 flex items-center">
                  <Calendar className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-indigo-600" />
                  Subscription Details
                </h2>
                <div className="flex items-center">
                  { extSubscription?.status === 'active' && (
                    <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-600 mr-1" />
                  )}
                  { extSubscription?.status === 'inactive' && (
                    <XCircle className="w-4 h-4 lg:w-5 lg:h-5 text-red-600 mr-1" />
                  )}
                  { extSubscription?.status === 'suspended' && (
                    <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-600 mr-1" />
                  )}
                  <span className={`px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium ${
                    extSubscription?.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : extSubscription?.status === 'inactive'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {(extSubscription?.status || '').charAt(0).toUpperCase() + (extSubscription?.status || '').slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                <div className="bg-gray-50 rounded-lg p-3 lg:p-4">
                  <p className="text-xs lg:text-sm font-medium text-gray-600 mb-1">Start Date</p>
                  <p className="text-base lg:text-lg font-semibold text-gray-900">
                    {new Date(extSubscription?.startDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 lg:p-4">
                  <p className="text-xs lg:text-sm font-medium text-gray-600 mb-1">End Date</p>
                  <p className="text-base lg:text-lg font-semibold text-gray-900">
                    {new Date(extSubscription?.endDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 lg:p-4">
                  <p className="text-xs lg:text-sm font-medium text-gray-600 mb-1">Days Remaining</p>
                  <p className="text-base lg:text-lg font-semibold text-gray-900">
                    {(() => {
                      const end = new Date(extSubscription?.endDate);
                      const now = new Date();
                      const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                      return Math.max(0, diff);
                    })()} days
                  </p>
                </div>
              </div>
              {extSubscription?.websiteName && (
                <div className="mt-4 text-xs lg:text-sm text-gray-600">
                  <span className="font-medium text-gray-700">Institution:</span> {extSubscription.websiteName} ({extSubscription.domain})
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 mb-6 lg:mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 lg:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm lg:text-base font-medium text-gray-600">Total Local Items</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats?.overview?.totalLocalItems || 0}</p>
                <p className="text-sm lg:text-base text-blue-600 mt-2">In local database</p>
              </div>
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <Library className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 lg:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm lg:text-base font-medium text-gray-600">Registered Users</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats?.overview?.totalUsers || 0}</p>
                <p className="text-sm lg:text-base text-green-600 mt-2">Active accounts</p>
              </div>
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 lg:w-8 lg:h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 lg:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm lg:text-base font-medium text-gray-600">Subject Categories</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats?.overview?.totalSubjects || 0}</p>
                <p className="text-sm lg:text-base text-orange-600 mt-2">Available subjects</p>
              </div>
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-orange-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 lg:w-8 lg:h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 mb-6 lg:mb-8">
          {/* Content Type Distribution */}
          <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
            <div className="flex items-center mb-4">
              <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 mr-2" />
              <h3 className="text-base lg:text-lg font-semibold text-gray-900">Content Type Distribution</h3>
            </div>
            <div className="h-48 lg:h-64">
              <Bar data={contentTypeChart} options={chartOptions} />
            </div>
          </div>

          {/* Local Content Types */}
          <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
            <div className="flex items-center mb-4">
              <PieChart className="w-4 h-4 lg:w-5 lg:h-5 text-green-600 mr-2" />
              <h3 className="text-base lg:text-lg font-semibold text-gray-900">Local Content Types</h3>
            </div>
            <div className="h-48 lg:h-64">
              <Doughnut data={typeBreakdownChart} options={doughnutOptions} />
            </div>
          </div>

          {/* User Roles Distribution */}
          <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
            <div className="flex items-center mb-4">
              <Users className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600 mr-2" />
              <h3 className="text-base lg:text-lg font-semibold text-gray-900">User Roles Distribution</h3>
            </div>
            <div className="h-48 lg:h-64 mb-6">
              <Doughnut data={userRoleChart} options={doughnutOptions} />
            </div>
            
            {/* Indexing Distribution Bar Chart */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center mb-4">
                <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-600 mr-2" />
                <h4 className="text-sm lg:text-base font-semibold text-gray-900">Publications by Indexing Type</h4>
              </div>
              <div className="h-48 lg:h-56">
                <Bar data={indexingChart} options={indexingBarOptions} />
              </div>
            </div>
          </div>

          {/* Local Library Overview */}
          <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
            <div className="flex items-center mb-4">
              <Library className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-600 mr-2" />
              <h3 className="text-base lg:text-lg font-semibold text-gray-900">Browse Categories Overview</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors duration-200">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900 text-sm">Book</p>
                    <p className="text-xs text-blue-600">Academic books</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-blue-700">{stats?.localTypeBreakdown?.['Book'] || 0}</p>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors duration-200">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="font-medium text-emerald-900 text-sm">Book Chapters</p>
                    <p className="text-xs text-emerald-600">Book sections</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-emerald-700">{stats?.localTypeBreakdown?.['Book Chapters'] || 0}</p>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors duration-200">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="font-medium text-purple-900 text-sm">Conference Proceeding</p>
                    <p className="text-xs text-purple-600">Conference papers</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-purple-700">{stats?.localTypeBreakdown?.['Conference Proceeding'] || 0}</p>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors duration-200">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-900 text-sm">Dissertation</p>
                    <p className="text-xs text-orange-600">Doctoral works</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-orange-700">{stats?.localTypeBreakdown?.['Dissertation'] || 0}</p>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-cyan-50 rounded-lg border border-cyan-100 hover:bg-cyan-100 transition-colors duration-200">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-600" />
                  <div>
                    <p className="font-medium text-cyan-900 text-sm">Magazine</p>
                    <p className="text-xs text-cyan-600">Periodical publications</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-cyan-700">{stats?.localTypeBreakdown?.['Magazine'] || 0}</p>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg border border-pink-100 hover:bg-pink-100 transition-colors duration-200">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-pink-600" />
                  <div>
                    <p className="font-medium text-pink-900 text-sm">Manuscript</p>
                    <p className="text-xs text-pink-600">Original manuscripts</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-pink-700">{stats?.localTypeBreakdown?.['Manuscript'] || 0}</p>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors duration-200">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-600" />
                  <div>
                    <p className="font-medium text-slate-900 text-sm">Newspaper</p>
                    <p className="text-xs text-slate-600">News publications</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-slate-700">{stats?.localTypeBreakdown?.['Newspaper'] || 0}</p>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-colors duration-200">
                <div className="flex items-center gap-2">
                  <Edit className="w-4 h-4 text-red-600" />
                  <div>
                    <p className="font-medium text-red-900 text-sm">Question Papers</p>
                    <p className="text-xs text-red-600">Exam papers</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-red-700">{stats?.localTypeBreakdown?.['Question Papers'] || 0}</p>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg border border-teal-100 hover:bg-teal-100 transition-colors duration-200">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <div>
                    <p className="font-medium text-teal-900 text-sm">Research Papers</p>
                    <p className="text-xs text-teal-600">Research articles</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-teal-700">{stats?.localTypeBreakdown?.['Research Papers'] || 0}</p>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors duration-200">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  <div>
                    <p className="font-medium text-indigo-900 text-sm">Thesis</p>
                    <p className="text-xs text-indigo-600">Academic thesis</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-indigo-700">{stats?.localTypeBreakdown?.['Thesis'] || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 mb-6 lg:mb-8">
          <div className="flex items-center mb-4 lg:mb-6">
            <Activity className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-600 mr-2" />
            <h3 className="text-base lg:text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="group block p-3 lg:p-4 rounded-lg border border-gray-200 hover:border-transparent hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start space-x-3">
                  <div className={`${action.color} rounded-lg p-2 transition-colors duration-300`}>
                    <action.icon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs lg:text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">
                      {action.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {action.description}
                    </p>
                  </div>
                  <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400 group-hover:text-indigo-600 transition-colors duration-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Subject Statistics */}
        {stats?.subjectBreakdown && Object.keys(stats.subjectBreakdown).length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
            <div className="flex items-center mb-4 lg:mb-6">
              <FileText className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 mr-2" />
              <h3 className="text-base lg:text-lg font-semibold text-gray-900">Content by Subject</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
              {Object.entries(stats.subjectBreakdown).map(([subject, count]) => (
                <div key={subject} className="bg-gray-50 rounded-lg p-3 lg:p-4">
                  <div className="flex justify-between items-center">
                    <p className="text-xs lg:text-sm font-medium text-gray-700 truncate">{subject}</p>
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}