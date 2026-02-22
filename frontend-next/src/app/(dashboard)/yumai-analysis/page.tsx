'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Upload, BarChart3, Loader2 } from 'lucide-react'

export default function YumaiAnalysisPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/yumai-analysis/submit', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        setResult(data.data?.html || '分析完成')
      }
    } catch (error) {
      console.error('分析失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">商品分析（优麦云）</h1>
        <p className="text-white/60">上传优麦云数据进行产品分析</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-white">上传数据</CardTitle>
            <CardDescription className="text-white/60">
              上传优麦云导出的数据文件
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">上传文件</label>
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-white/20 p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-white/40" />
                    <p className="mt-2 text-sm text-white/60">
                      {file ? file.name : '点击或拖拽文件到此处'}
                    </p>
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading || !file}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4" />
                    开始分析
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-white">分析结果</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: result }}
              />
            ) : (
              <div className="flex h-64 items-center justify-center text-white/40">
                上传文件后显示分析结果
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
