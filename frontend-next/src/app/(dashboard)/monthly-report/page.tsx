'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Upload, FileText, Loader2 } from 'lucide-react'

export default function MonthlyReportPage() {
  const [files, setFiles] = useState<FileList | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!files || files.length === 0) return

    setLoading(true)
    try {
      const formData = new FormData()
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i])
      }

      const response = await fetch('/api/dataset/monthly-report', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        setResult(data.data?.html || '处理完成')
      }
    } catch (error) {
      console.error('处理失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">财务月报</h1>
        <p className="text-white/60">上传并处理财务月报数据</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-white">上传数据</CardTitle>
            <CardDescription className="text-white/60">
              上传 CSV 或 Excel 格式的月报文件
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">上传文件（可多选）</label>
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-white/20 p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-white/40" />
                    <p className="mt-2 text-sm text-white/60">
                      {files ? `${files.length} 个文件已选择` : '点击或拖拽文件到此处'}
                    </p>
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      multiple
                      onChange={(e) => setFiles(e.target.files)}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading || !files}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    处理中...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    处理数据
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-white">处理结果</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: result }}
              />
            ) : (
              <div className="flex h-64 items-center justify-center text-white/40">
                上传文件后显示结果
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
