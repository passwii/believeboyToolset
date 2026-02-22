'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Store, Loader2, ExternalLink } from 'lucide-react'

interface Shop {
  id: number
  name: string
  url: string
}

export default function ShopNavPage() {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/toolset/shops/nav')
        if (response.data.success) {
          setShops(response.data.data.shops || [])
        }
      } catch (error) {
        console.error('获取店铺导航失败:', error)
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
        <h1 className="text-2xl font-bold text-white">店铺导航</h1>
        <p className="text-white/60">快速访问各店铺后台</p>
      </div>

      {shops.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shops.map((shop) => (
            <a
              key={shop.id}
              href={shop.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Card className="transition-all duration-200 hover:scale-[1.02] hover:border-purple-500/50">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <Store className="h-5 w-5 text-purple-400" />
                  <CardTitle className="text-base font-medium text-white">
                    {shop.name}
                  </CardTitle>
                  <ExternalLink className="ml-auto h-4 w-4 text-white/40 opacity-0 transition-opacity group-hover:opacity-100" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white/60 truncate">{shop.url}</p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Store className="h-12 w-12 text-white/20" />
            <p className="mt-4 text-white/60">暂无店铺数据</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
