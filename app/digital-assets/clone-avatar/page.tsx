'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Video, Image as ImageIcon } from 'lucide-react'

export default function CloneAvatarPage() {
  const router = useRouter()

  const goToVideoAvatar = () => {
    router.push('/digital-assets/clone-avatar/video')
  }

  const goToImageAvatar = () => {
    router.push('/digital-assets/clone-avatar/image')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            克隆形象
          </h1>
          <p className="text-lg text-muted-foreground">
            选择您的数字人生成方式
          </p>
        </div>

        {/* 选择卡片 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* 视频生成数字人 */}
          <Card className="border-2 hover:border-primary transition-colors cursor-pointer group" onClick={goToVideoAvatar}>
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Video className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-2xl">视频生成数字人</CardTitle>
              <CardDescription className="text-base mt-2">
                上传视频素材，创建高质量数字人分身
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>支持 mp4、mov 格式</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>视频时长 5秒~30分钟</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>文件大小小于 500MB</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>更真实的动作和表情</span>
                </li>
              </ul>
              <Button className="w-full" size="lg">
                选择视频生成
              </Button>
            </CardContent>
          </Card>

          {/* 图片生成数字人 */}
          <Card className="border-2 hover:border-primary transition-colors cursor-pointer group" onClick={goToImageAvatar}>
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <ImageIcon className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-2xl">图片生成数字人</CardTitle>
              <CardDescription className="text-base mt-2">
                上传图片素材，快速创建数字人分身
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>支持 png、jpg、jpeg 格式</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>图片大小不超过 10MB</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>建议使用正面、半身照片</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>快速生成，操作简单</span>
                </li>
              </ul>
              <Button className="w-full" size="lg">
                选择图片生成
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 提示信息 */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>不确定选择哪种方式？视频生成效果更真实，图片生成更快速便捷</p>
        </div>
      </div>
    </div>
  )
}