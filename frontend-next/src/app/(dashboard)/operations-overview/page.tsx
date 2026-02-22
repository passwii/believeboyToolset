'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Store, Globe, Compass, Loader2 } from 'lucide-react'

interface OperationData {
  sites?: Array<{ name: string; url: string; status: string }>
  shops?: Array<{ id: number; name: string; url: string }>
}

export default function OperationsOverviewPage() {
  const [data, setData] = useState<OperationData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/toolset/operations-overview')
        if (response.data.success) {
          setData(response.data.data)
        }
      } catch (error) {
        console.error('获取运营概览失败:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">运营总览</h1>
        <p className="text-white/60">查看所有运营数据概览</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Compass className="h-5 w-5 text-indigo-400" />
            <CardTitle className="text-lg font-semibold text-white">运营导航</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white/60">快速访问所有运营工具</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Globe className="h-5 w-5 text-purple-400" />
            <CardTitle className="text-lg font-semibold text-white">站点导航</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white/60">管理您的所有站点</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Store className="h-5 w-5 text-pink-400" />
            <CardTitle className="text-lg font-semibold text-white">店铺导航</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white/60">快速跳转到各店铺</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
