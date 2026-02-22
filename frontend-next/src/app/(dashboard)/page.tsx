'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { TrendingUp, FileText, Calculator, Users, Store, Activity } from 'lucide-react'
import Link from 'next/link'

interface Statistics {
  report_statistics: {
    daily_reports: number
    monthly_reports: number
    product_analysis: number
  }
  system_status: {
    total_users: number
    total_shops: number
    total_logs: number
  }
}

export default function HomePage() {
  const [stats, setStats] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/statistics')
        if (response.data.success) {
          setStats(response.data.data)
        }
      } catch (error) {
        console.error('获取统计数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">欢迎回来</h1>
        <p className="text-white/60">这里是您的运营概览</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white/80">日报数量</CardTitle>
            <FileText className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats?.report_statistics.daily_reports || 0}
            </div>
            <p className="text-xs text-white/40">过去7天</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white/80">月报数量</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats?.report_statistics.monthly_reports || 0}
            </div>
            <p className="text-xs text-white/40">过去7天</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white/80">产品分析</CardTitle>
            <Calculator className="h-4 w-4 text-pink-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats?.report_statistics.product_analysis || 0}
            </div>
            <p className="text-xs text-white/40">过去7天</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white/80">用户数量</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats?.system_status.total_users || 0}
            </div>
            <p className="text-xs text-white/40">系统总用户</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white/80">商店数量</CardTitle>
            <Store className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats?.system_status.total_shops || 0}
            </div>
            <p className="text-xs text-white/40">系统总商店</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white/80">日志数量</CardTitle>
            <Activity className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats?.system_status.total_logs || 0}
            </div>
            <p className="text-xs text-white/40">系统总日志</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">快速导航</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/daily-report"
              className="flex items-center gap-3 rounded-lg p-2 text-white/80 hover:bg-white/5 hover:text-white"
            >
              <FileText className="h-4 w-4" />
              <span>销售日报</span>
            </Link>
            <Link
              href="/monthly-report"
              className="flex items-center gap-3 rounded-lg p-2 text-white/80 hover:bg-white/5 hover:text-white"
            >
              <TrendingUp className="h-4 w-4" />
              <span>财务月报</span>
            </Link>
            <Link
              href="/product-analysis"
              className="flex items-center gap-3 rounded-lg p-2 text-white/80 hover:bg-white/5 hover:text-white"
            >
              <Calculator className="h-4 w-4" />
              <span>产品分析</span>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">最近活动</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white/40">暂无最近活动</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
