'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, AlertCircle, ArrowLeft } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRouter } from 'next/navigation'

export default function ImageAvatarPage() {
  const router = useRouter()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [model, setModel] = useState('3.1')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<string>('')
  const [agreed, setAgreed] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 验证图片大小和格式
      if (file.size > 10 * 1024 * 1024) { // 10MB
        alert('图片大小不能超过10MB')
        return
      }
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg']
      if (!validTypes.includes(file.type)) {
        alert('请上传 png、jpg 或 jpeg 格式的图片')
        return
      }
      setImageFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!imageFile || !name) {
      alert('请填写所有必填项')
      return
    }

    if (!agreed) {
      alert('请同意使用者承诺函')
      return
    }

    setUploading(true)
    setProgress('正在上传图片...')

    try {
      // 1. 上传图片到服务器/云存储
      const formData = new FormData()
      formData.append('image', imageFile)
      formData.append('name', name)
      formData.append('model', model)

      const uploadResponse = await fetch('/api/digital-human/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) throw new Error('图片上传失败')

      const { imageUrl } = await uploadResponse.json()
      setProgress('图片上传成功，正在创建数字人...')

      // 2. 调用数字人克隆API
      const cloneResponse = await fetch('/api/digital-human/clone-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          name,
          model,
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
              图片生成数字人
            </h1>
            <p className="text-lg text-muted-foreground">
              上传图片，快速创建数字人分身
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. 数字人名称 */}
          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  1
                </span>
                数字人名称
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="请输入数字人名称"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                className="h-12"
              />
            </CardContent>
          </Card>

          {/* 2. 上传图片 */}
          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  2
                </span>
                上传图片
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/20 hover:bg-muted/30 transition-colors">
                  {imageFile ? (
                    <div className="space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{imageFile.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {(imageFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setImageFile(null)}
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
                        <p className="text-sm font-medium mb-2">请上传一张图片，用于生成图片数字人</p>
                        <p className="text-xs text-muted-foreground mb-4">将文件拖到此处，或点击此区域上传</p>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload">
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

          {/* 3. 图片要求 */}
          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  3
                </span>
                图片要求
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-xs space-y-1 text-blue-900 dark:text-blue-100">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="font-semibold mb-1">人物：</p>
                      <p>正面、半身</p>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">格式：</p>
                      <p>png/jpg/jpeg</p>
                    </div>
                    <div className="col-span-2">
                      <p className="font-semibold mb-1">尺寸：</p>
                      <p>不超过10MB，小于4000px</p>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* 4. 选择模型 */}
          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  4
                </span>
                选择模型
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="model"
                    value="3.1"
                    checked={model === '3.1'}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">3.1</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="model"
                    value="3.0"
                    checked={model === '3.0'}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">3.0</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="model"
                    value="2.1"
                    checked={model === '2.1'}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">2.1</span>
                </label>
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
              <span className="ml-2 text-primary">500积分/次</span>
              <span className="line-through ml-1 text-muted-foreground">300积分/次</span>
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
              disabled={uploading || !imageFile || !name || !agreed}
            >
              {uploading ? progress : '提交'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
