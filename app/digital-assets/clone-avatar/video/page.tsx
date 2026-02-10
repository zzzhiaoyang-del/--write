'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, AlertCircle, ArrowLeft } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRouter } from 'next/navigation'

export default function VideoAvatarPage() {
  const router = useRouter()
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<string>('')
  const [agreed, setAgreed] = useState(false)

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 验证视频大小和格式
      if (file.size > 500 * 1024 * 1024) { // 500MB
        alert('视频大小不能超过500MB')
        return
      }
      const validTypes = ['video/mp4', 'video/quicktime']
      if (!validTypes.includes(file.type)) {
        alert('请上传 mp4 或 mov 格式的视频')
        return
      }
      setVideoFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!videoFile) {
      alert('请上传视频')
      return
    }

    if (!agreed) {
      alert('请同意使用者承诺函')
      return
    }

    setUploading(true)
    setProgress('正在上传视频...')

    try {
      // 1. 上传视频到服务器/云存储
      const formData = new FormData()
      formData.append('video', videoFile)

      const uploadResponse = await fetch('/api/digital-human/upload-video', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        // 尝试解析 JSON，如果失败则读取文本
        let errorMessage = '视频上传失败'
        try {
          const errorData = await uploadResponse.json()
          console.error('上传失败 (JSON):', errorData)
          errorMessage = errorData.details || errorData.error || errorMessage
        } catch (e) {
          // 如果不是 JSON，读取原始文本
          const errorText = await uploadResponse.text()
          console.error('上传失败 (文本):', errorText)

          // 检查是否是请求体过大的错误
          if (errorText.includes('Request Entity Too Large') || errorText.includes('413')) {
            errorMessage = '视频文件过大，Vercel 限制为 4.5MB。请使用更小的视频或升级 Vercel 套餐'
          } else if (errorText.includes('FUNCTION_PAYLOAD_TOO_LARGE')) {
            errorMessage = '视频文件过大，超过了服务器限制（4.5MB）'
          } else {
            errorMessage = `上传失败: ${errorText.substring(0, 200)}`
          }
        }
        throw new Error(errorMessage)
      }

      const { videoUrl } = await uploadResponse.json()
      setProgress('视频上传成功，正在创建数字人...')

      // 2. 调用数字人克隆API
      const cloneResponse = await fetch('/api/digital-human/clone-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl,
        }),
      })

      if (!cloneResponse.ok) throw new Error('数字人创建失败')

      const { avatarId } = await cloneResponse.json()
      setProgress('数字人创建成功！')

      // 重定向到数字人列表页
      setTimeout(() => {
        window.location.href = '/digital-human/list'
      }, 2000)

    } catch (error) {
      console.error('Error:', error)
      alert(error instanceof Error ? error.message : '创建失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              视频生成数字人
            </h1>
            <p className="text-lg text-muted-foreground">
              上传视频，创建高质量数字人分身
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. 上传视频 */}
          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  1
                </span>
                上传视频
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/20 hover:bg-muted/30 transition-colors">
                  {videoFile ? (
                    <div className="space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{videoFile.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setVideoFile(null)}
                      >
                        重新选择
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">请上传一段视频，用于生成图片数字人</p>
                        <p className="text-xs text-muted-foreground mb-4">将文件拖到此处，或点击此区域上传</p>
                        <input
                          type="file"
                          accept="video/mp4,video/quicktime"
                          onChange={handleVideoUpload}
                          className="hidden"
                          id="video-upload"
                        />
                        <label htmlFor="video-upload">
                          <Button type="button" variant="outline" asChild>
                            <span className="cursor-pointer">选择文件</span>
                          </Button>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. 视频要求 */}
          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  2
                </span>
                视频要求
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-xs space-y-1 text-blue-900 dark:text-blue-100">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="font-semibold mb-1">视频方向：</p>
                      <p>横向或纵向</p>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">文件格式：</p>
                      <p>mp4、mov</p>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">视频时长：</p>
                      <p>5秒~30分钟</p>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">文件大小：</p>
                      <p>小于500MB</p>
                    </div>
                    <div className="col-span-2">
                      <p className="font-semibold mb-1">分辨率：</p>
                      <p>360p~4K</p>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* 3. 示例视频 */}
          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  3
                </span>
                示例视频
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-600 dark:text-orange-400 mb-4">
                暂时没有视频素材？使用我们的示例素材来感受效果吧！
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">示例 {i}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 用户协议 */}
          <div className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              id="agreement"
              className="rounded"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <label htmlFor="agreement" className="text-muted-foreground">
              我已阅读并同意{' '}
              <a href="/terms" className="text-primary hover:underline">
                《使用者承诺须知》
              </a>
            </label>
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-14 text-base"
              onClick={() => router.back()}
            >
              取消
            </Button>
            <Button
              type="submit"
              className="flex-1 h-14 text-base font-semibold"
              disabled={uploading || !videoFile || !agreed}
            >
              {uploading ? progress : '确定'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
