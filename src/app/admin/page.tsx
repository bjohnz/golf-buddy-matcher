'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Shield, Users, MessageCircle, Heart, AlertTriangle, Ban, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Report, AdminStats } from '@/types'
import toast from 'react-hot-toast'

// Sample data for development
const sampleReports: Report[] = [
  {
    id: '1',
    reporter_id: 'user-1',
    reported_user_id: 'user-2',
    reason: 'inappropriate_behavior',
    description: 'User sent inappropriate messages in chat',
    created_at: '2024-01-15T10:30:00Z',
    status: 'pending'
  },
  {
    id: '2',
    reporter_id: 'user-3',
    reported_user_id: 'user-4',
    reason: 'fake_profile',
    description: 'Profile appears to be fake with stock photos',
    created_at: '2024-01-14T15:20:00Z',
    status: 'reviewed'
  },
  {
    id: '3',
    reporter_id: 'user-5',
    reported_user_id: 'user-6',
    reason: 'harassment',
    description: 'Repeated unwanted contact after being unmatched',
    created_at: '2024-01-13T09:15:00Z',
    status: 'resolved'
  }
]

const sampleStats: AdminStats = {
  total_users: 1247,
  total_matches: 892,
  total_messages: 3456,
  reported_users: 23,
  banned_users: 5,
  total_ratings: 567,
  avg_rating: 4.2
}

export default function AdminPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [stats, setStats] = useState<AdminStats>(sampleStats)
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'reviewed' | 'resolved'>('all')

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      setLoading(true)
      // TODO: Load real admin data from API
      setReports(sampleReports)
      setStats(sampleStats)
    } catch (error) {
      console.error('Error loading admin data:', error)
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateReportStatus = async (reportId: string, newStatus: 'reviewed' | 'resolved') => {
    try {
      // TODO: Update report status in API
      setReports(prev => prev.map(report => 
        report.id === reportId ? { ...report, status: newStatus } : report
      ))
      toast.success(`Report marked as ${newStatus}`)
    } catch (error) {
      console.error('Error updating report status:', error)
      toast.error('Failed to update report status')
    }
  }

  const handleBanUser = async (userId: string) => {
    try {
      // TODO: Ban user in API
      toast.success('User has been banned')
    } catch (error) {
      console.error('Error banning user:', error)
      toast.error('Failed to ban user')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'reviewed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'reviewed':
        return 'bg-blue-100 text-blue-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'inappropriate_behavior':
        return 'Inappropriate Behavior'
      case 'fake_profile':
        return 'Fake Profile'
      case 'harassment':
        return 'Harassment'
      case 'spam':
        return 'Spam'
      case 'other':
        return 'Other'
      default:
        return reason
    }
  }

  const filteredReports = reports.filter(report => 
    selectedStatus === 'all' || report.status === selectedStatus
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard"
                className="text-gray-600 hover:text-green-600 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-green-600" />
                <span className="text-xl font-bold text-gray-900">Admin Dashboard</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_users.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Matches</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_matches.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_messages.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reported Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.reported_users}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Ban className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Banned Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.banned_users}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <h2 className="text-lg font-semibold text-gray-900">User Reports</h2>
              </div>
              
              {/* Status Filter */}
              <div className="flex space-x-2">
                {(['all', 'pending', 'reviewed', 'resolved'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-3 py-1 text-sm rounded-full ${
                      selectedStatus === status
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(report.status)}
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getReasonLabel(report.reason)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {report.description || 'No description provided'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {report.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateReportStatus(report.id, 'reviewed')}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Review
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateReportStatus(report.id, 'resolved')}
                              className="text-green-600 hover:text-green-700"
                            >
                              Resolve
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBanUser(report.reported_user_id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Ban User
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No reports found for the selected status.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 