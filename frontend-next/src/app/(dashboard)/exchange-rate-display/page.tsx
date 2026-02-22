'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { ArrowRightLeft, Loader2 } from 'lucide-react'

interface ExchangeRate {
  currency: string
  rate: number
  change: number
}

export default function ExchangeRateDisplayPage() {
  const [rates, setRates] = useState<ExchangeRate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/toolset/exchange-rate-display')
        if (response.data.success) {
          setRates(response.data.data.rates || [])
        }
      } catch (error) {
        console.error('获取汇率失败:', error)
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
        <h1 className="text-2xl font-bold text-white">汇率展示</h1>
        <p className="text-white/60">实时汇率信息</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rates.length > 0 ? (
          rates.map((rate, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <ArrowRightLeft className="h-5 w-5 text-indigo-400" />
                <CardTitle className="text-lg font-medium text-white">
                  {rate.currency}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{rate.rate.toFixed(4)}</div>
                <p className={`text-sm ${rate.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {rate.change >= 0 ? '↑' : '↓'} {Math.abs(rate.change).toFixed(2)}%
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ArrowRightLeft className="h-12 w-12 text-white/20" />
              <p className="mt-4 text-white/60">暂无汇率数据</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
