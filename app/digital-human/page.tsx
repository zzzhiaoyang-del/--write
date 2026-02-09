'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, AlertCircle, Image } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function DigitalHumanPage() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<string>('')

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
      setProgress('图片上传成功，正在创建数字人...')

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
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">数字分身</h1>
        <p className="text-muted-foreground">上传视频，创建您的数字人分身</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. 数字人形象 */}
        <Card>
          <CardHeader>
            <CardTitle>1. 数字人形象</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                {imageFile ? (
                  <div className="space-y-2">
                    <Upload className="w-12 h-12 mx-auto text-primary" />
                    <p className="text-sm font-medium">{imageFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(imageFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
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
                  <>
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm font-medium mb-2">上传图片</p>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="max-w-xs mx-auto"
                    />
                  </>
                )}
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs space-y-1">
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
        <Card>
          <CardHeader>
            <CardTitle>2. 数字人名称</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="请输入分身名称"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
            />
          </CardContent>
        </Card>

        {/* 3. 数字人分类 */}
        <Card>
          <CardHeader>
            <CardTitle>3. 数字人分类</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
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
          </CardContent>
        </Card>

        {/* 提交按钮 */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={uploading || !videoFile || !name || !category}
        >
          {uploading ? progress : '提交'}
        </Button>
      </form>
    </div>
  )
}
