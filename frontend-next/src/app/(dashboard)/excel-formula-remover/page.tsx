'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Upload, FileSpreadsheet, Loader2, Download } from 'lucide-react'

export default function ExcelFormulaRemoverPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/toolset/excel-formula-remover', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        setDownloadUrl(data.data?.download_url || '')
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
        <h1 className="text-2xl font-bold text-white">Excel 去公式</h1>
        <p className="text-white/60">移除 Excel 文件中的公式，保留数值</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-white">上传文件</CardTitle>
            <CardDescription className="text-white/60">
              上传需要去除公式的 Excel 文件
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
                      accept=".xlsx,.xls"
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
                    处理中...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="h-4 w-4" />
                    去除公式
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-white">下载结果</CardTitle>
          </CardHeader>
          <CardContent>
            {downloadUrl ? (
              <div className="flex flex-col items-center justify-center gap-4 py-8">
                <FileSpreadsheet className="h-16 w-16 text-green-400" />
                <p className="text-white/80">处理完成！</p>
                <a href={downloadUrl} download>
                  <Button>
                    <Download className="h-4 w-4" />
                    下载文件
                  </Button>
                </a>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center text-white/40">
                上传文件后显示下载链接
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
