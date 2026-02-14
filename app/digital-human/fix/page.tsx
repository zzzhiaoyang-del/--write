'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { AppLayout } from '@/components/app-layout'

export default function FixDigitalHumanPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; updated: number; message: string } | null>(null)

  const handleFix = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/digital-human/fix-status', {
        method: 'POST',
        credentials: 'include',
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        // 3秒后跳转到数字人列表
        setTimeout(() => {
          window.location.href = '/digital-human/list'
        }, 3000)
      }
    } catch (error) {
      console.error('Fix error:', error)
      setResult({
        success: false,
        updated: 0,
        message: '修复失败，请重试',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-gray-900">修复数字人状态</CardTitle>
          <CardDescription className="text-gray-600">
            将所有"处理中"的数字人状态更新为"已完成"
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!result && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                如果你的数字人一直显示"处理中"状态，点击下面的按钮可以批量修复。
              </p>
              <Button
                onClick={handleFix}
                disabled={loading}
                className="w-full bg-[#FF6600] hover:bg-[#FF8533] text-white"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    修复中...
                  </>
                ) : (
                  '立即修复'
                )}
              </Button>
            </div>
          )}

          {result && (
            <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-start gap-3">
                {result.success && <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />}
                <div>
                  <p className={`font-medium ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                    {result.message}
                  </p>
                  {result.success && (
                    <p className="text-sm text-green-700 mt-1">
                      3秒后自动跳转到数字人列表...
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  )
}
