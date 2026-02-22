'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Globe, Loader2, ExternalLink } from 'lucide-react'

interface Site {
  name: string
  url: string
  status: string
}

export default function OperationsNavPage() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/toolset/operations-nav')
        if (response.data.success) {
          setSites(response.data.data.sites || [])
        }
      } catch (error) {
        console.error('获取站点导航失败:', error)
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
        <h1 className="text-2xl font-bold text-white">站点导航</h1>
        <p className="text-white/60">快速访问常用站点</p>
      </div>

      {sites.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((site, index) => (
            <a
              key={index}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Card className="transition-all duration-200 hover:scale-[1.02] hover:border-indigo-500/50">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <Globe className="h-5 w-5 text-indigo-400" />
                  <CardTitle className="text-base font-medium text-white">
                    {site.name}
                  </CardTitle>
                  <ExternalLink className="ml-auto h-4 w-4 text-white/40 opacity-0 transition-opacity group-hover:opacity-100" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white/60 truncate">{site.url}</p>
                  <span className="mt-2 inline-block rounded bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                    {site.status || '正常'}
                  </span>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Globe className="h-12 w-12 text-white/20" />
            <p className="mt-4 text-white/60">暂无站点数据</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
