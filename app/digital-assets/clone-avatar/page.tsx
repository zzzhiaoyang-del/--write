'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, AlertCircle, CheckCircle2, X, Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function CloneAvatarPage() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<string>('')
  const [showTutorial, setShowTutorial] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 验证图片大小和格式
      if (file.size > 10 * 1024 * 1024) { // 10MB
        alert('图片大小不能超过10MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        alert('请上传图片文件（JPG、PNG 等）')
        return
      }
      setImageFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!imageFile || !name || !category) {
      alert('请填写所有必填项')
      return
    }

    setUploading(true)
    setProgress('正在上传图片...')

    try {
      // 1. 上传图片到服务器/云存储
      const formData = new FormData()
      formData.append('image', imageFile)
      formData.append('name', name)
      formData.append('category', category)

      const uploadResponse = await fetch('/api/digital-human/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) throw new Error('图片上传失败')

      const { imageUrl } = await uploadResponse.json()
      setProgress('图片上传成功，正在创建数字分身...')

      // 2. 调用数字人克隆API
      const cloneResponse = await fetch('/api/digital-human/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          name,
          category,
        }),
      })

      if (!cloneResponse.ok) throw new Error('数字分身创建失败')

      const { avatarId } = await cloneResponse.json()
      setProgress('数字分身创建成功！')

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
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            克隆形象
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            上传图片，创建您的数字人分身
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setShowTutorial(true)}
          >
            <Info className="w-4 h-4 mr-2" />
            查看教程
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. 数字人形象 */}
          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  1
                </span>
                数字人形象
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
                        <p className="text-sm font-medium mb-2">上传图片</p>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="max-w-xs mx-auto cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-xs space-y-1 text-blue-900 dark:text-blue-100">
                    <p>• 支持 JPG、PNG、JPEG 等常见图片格式</p>
                    <p>• 建议图片大小在 10MB 以内</p>
                    <p>• 建议使用清晰的正面照片，单人出镜</p>
                    <p>• 图片将用于生成会说话的数字人</p>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* 2. 数字人名称 */}
          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  2
                </span>
                数字人名称
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="请输入分身名称"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                className="h-12"
              />
            </CardContent>
          </Card>

          {/* 3. 数字人分类 */}
          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  3
                </span>
                数字人分类
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="请选择分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business">商务</SelectItem>
                  <SelectItem value="education">教育</SelectItem>
                  <SelectItem value="entertainment">娱乐</SelectItem>
                  <SelectItem value="marketing">营销</SelectItem>
                  <SelectItem value="other">其他</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full sm:w-auto"
                type="button"
              >
                + 添加分类
              </Button>
            </CardContent>
          </Card>

          {/* 提交按钮 */}
          <Button
            type="submit"
            className="w-full h-14 text-base font-semibold"
            size="lg"
            disabled={uploading || !imageFile || !name || !category}
          >
            {uploading ? progress : '提交'}
          </Button>

          {/* 用户协议 */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" id="agreement" className="rounded" required />
            <label htmlFor="agreement">
              我已阅读并同意{' '}
              <a href="/terms" className="text-primary hover:underline">
                《使用者承诺函》
              </a>
            </label>
          </div>
        </form>
      </div>

      {/* Tutorial Dialog */}
      <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">数字人图片要求</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Upload className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">上传清晰的正面照片</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-primary" />
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">单人出镜，无遮挡</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-primary" />
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">图片大小在 10MB 以内</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-primary" />
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">支持 JPG、PNG 等格式</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-primary" />
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-3 text-sm">错误示例</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="aspect-square rounded-lg bg-muted mb-2 flex items-center justify-center">
                    <X className="w-8 h-8 text-destructive" />
                  </div>
                  <p className="text-xs text-muted-foreground">捂住嘴巴</p>
                </div>
                <div className="text-center">
                  <div className="aspect-square rounded-lg bg-muted mb-2 flex items-center justify-center">
                    <X className="w-8 h-8 text-destructive" />
                  </div>
                  <p className="text-xs text-muted-foreground">侧脸拍摄</p>
                </div>
                <div className="text-center">
                  <div className="aspect-square rounded-lg bg-muted mb-2 flex items-center justify-center">
                    <X className="w-8 h-8 text-destructive" />
                  </div>
                  <p className="text-xs text-muted-foreground">多人出镜</p>
                </div>
                <div className="text-center">
                  <div className="aspect-square rounded-lg bg-muted mb-2 flex items-center justify-center">
                    <X className="w-8 h-8 text-destructive" />
                  </div>
                  <p className="text-xs text-muted-foreground">图片模糊</p>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setShowTutorial(false)}
            className="w-full"
          >
            上传图片
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}