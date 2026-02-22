'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Upload, Calculator, Loader2 } from 'lucide-react'

export default function ProductAnalysisPage() {
  const [files, setFiles] = useState<{ [key: string]: File }>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  const fileTypes = [
    { key: 'business', label: '业务报告', accept: '.csv' },
    { key: 'payment', label: '付款报告', accept: '.csv' },
    { key: 'advertising', label: '广告报表', accept: '.xlsx,.xls' },
  ]

  const handleFileChange = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles((prev) => ({ ...prev, [type]: e.target.files![0] }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (Object.keys(files).length < 3) return

    setLoading(true)
    try {
      const formData = new FormData()
      Object.entries(files).forEach(([key, file]) => {
        formData.append(key, file)
      })

      const response = await fetch('/api/dataset/product-analysis/submit', {
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

  const allFilesUploaded = Object.keys(files).length >= 3

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">产品分析</h1>
        <p className="text-white/60">上传业务报告、付款报告和广告报表进行分析</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-white">上传数据</CardTitle>
            <CardDescription className="text-white/60">
              需要同时上传3个文件才能进行分析
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {fileTypes.map(({ key, label, accept }) => (
                <div key={key} className="space-y-2">
                  <label className="text-sm font-medium text-white/80">{label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept={accept}
                      onChange={(e) => handleFileChange(key, e)}
                      className="hidden"
                      id={`file-${key}`}
                    />
                    <label
                      htmlFor={`file-${key}`}
                      className="flex-1 cursor-pointer rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                    >
                      {files[key] ? files[key].name : `点击选择 ${label}`}
                    </label>
                    {files[key] && (
                      <span className="text-sm text-green-400">✓</span>
                    )}
                  </div>
                </div>
              ))}

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !allFilesUploaded}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4" />
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
                上传3个文件后显示分析结果
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
