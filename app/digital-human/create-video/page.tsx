'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Play, Download, Eye, ArrowLeft, Sparkles, Video, Upload, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { AppLayout } from '@/components/app-layout'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface VideoWork {
  id: string
  name: string
  text: string
  voice: string
  status: 'processing' | 'completed' | 'failed'
  created_at: string
  video_url?: string
  duration?: number
}

type GenStatus = 'idle' | 'uploading' | 'generating' | 'polling' | 'succeeded' | 'failed'

function CreateVideoContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const avatarId = searchParams.get('avatarId')
  const avatarName = searchParams.get('name')

  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [genStatus, setGenStatus] = useState<GenStatus>('idle')
  const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [works, setWorks] = useState<VideoWork[]>([])
  const [isLoadingWorks, setIsLoadingWorks] = useState(true)
  const [avatarInfo, setAvatarInfo] = useState<any>(null)
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(true)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!avatarId) {
      toast.error('缺少数字人ID')
      router.push('/digital-human/list')
      return
    }
    fetchAvatarInfo()
    fetchWorks()
    return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
  }, [avatarId])

  const fetchAvatarInfo = async () => {
    try {
      setIsLoadingAvatar(true)
      const response = await fetch('/api/digital-human/list')
      const data = await response.json()
      const avatar = data.humans?.find((h: any) => h.avatar_id === avatarId)
      setAvatarInfo(avatar)
    } catch (error) {
      console.error('Error fetching avatar info:', error)
    } finally {
      setIsLoadingAvatar(false)
    }
  }

  const fetchWorks = async () => {
    try {
      setIsLoadingWorks(true)
      const response = await fetch(`/api/digital-human/video-works?avatarId=${avatarId}`)
      const data = await response.json()
      setWorks(data.works || [])
    } catch (error) {
      console.error('Error fetching works:', error)
    } finally {
      setIsLoadingWorks(false)
    }
  }

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg('音频大小不能超过 50MB')
      return
    }
    setErrorMsg(null)
    setAudioFile(file)
  }

  const startPolling = (predictionId: string) => {
    setGenStatus('polling')
    let attempts = 0
    pollingRef.current = setInterval(async () => {
      attempts++
      if (attempts > 120) {
        clearInterval(pollingRef.current!)
        setGenStatus('failed')
        setErrorMsg('生成超时，请重试')
        return
      }
      try {
        const res = await fetch(`/api/sadtalker/status?id=${predictionId}`)
        const data = await res.json()
        if (data.status === 'succeeded') {
          clearInterval(pollingRef.current!)
          const url = Array.isArray(data.output) ? data.output[0] : data.output
          setResultVideoUrl(url)
          setGenStatus('succeeded')
          toast.success('视频生成成功！')
          fetchWorks()
        } else if (data.status === 'failed' || data.status === 'canceled') {
          clearInterval(pollingRef.current!)
          setGenStatus('failed')
          setErrorMsg(data.error || '生成失败，请重试')
        }
      } catch { /* 网络抖动，继续轮询 */ }
    }, 5000)
  }

  const handleSubmit = async () => {
    if (!audioFile) {
      toast.error('请先上传音频文件')
      return
    }
    if (!avatarInfo?.video_url) {
      toast.error('数字人图片不存在，无法生成')
      return
    }

    setErrorMsg(null)
    setResultVideoUrl(null)
    setGenStatus('uploading')

    try {
      // 1. 上传音频到 Supabase
      const ext = audioFile.name.split('.').pop()
      const fileName = `sadtalker-audio/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('digital-human-videos')
        .upload(fileName, audioFile, { upsert: false })
      if (uploadError) throw new Error('音频上传失败：' + uploadError.message)

      const { data: { publicUrl: audioUrl } } = supabase.storage
        .from('digital-human-videos')
        .getPublicUrl(fileName)

      // 2. 提交 SadTalker 生成任务
      setGenStatus('generating')
      const res = await fetch('/api/sadtalker/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: avatarInfo.video_url, // 存的是图片 URL
          audioUrl,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '提交任务失败')

      // 3. 开始轮询
      startPolling(data.predictionId)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '发生未知错误'
      setErrorMsg(msg)
      setGenStatus('failed')
    }
  }

  const isLoading = ['uploading', 'generating', 'polling'].includes(genStatus)

  const statusLabel: Record<GenStatus, string> = {
    idle: '',
    uploading: '正在上传音频...',
    generating: '正在提交生成任务...',
    polling: '视频生成中，请稍候（约 2-5 分钟）...',
    succeeded: '视频生成成功！',
    failed: '',
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      processing: { label: '生成中', variant: 'secondary' as const },
      completed: { label: '已完成', variant: 'default' as const },
      failed: { label: '失败', variant: 'destructive' as const },
    }
    const config = statusConfig[status as keyof typeof statusConfig]
    return <Badge variant={config?.variant ?? 'secondary'}>{config?.label ?? status}</Badge>
  }

  return (
    <AppLayout>
      <div className="flex items-center mb-8">
        <Link href="/digital-human/list">
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
        </Link>
        <div className="ml-4">
          <h1 className="text-3xl font-bold text-gray-900">创作作品</h1>
          <p className="text-gray-600">使用数字人 {avatarName || avatarId} 创作视频</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：创作区域 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 数字人预览 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                数字人预览
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAvatar ? (
                <div className="aspect-video bg-gray-50 rounded-lg flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : avatarInfo?.video_url ? (
                <div className="space-y-2">
                  <img
                    src={avatarInfo.video_url}
                    alt={avatarInfo.name}
                    className="w-full max-h-72 object-contain rounded-lg bg-black"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{avatarInfo.name}</span>
                    <Badge variant="default">已完成</Badge>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-gray-500">数字人形象预览</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 音频上传 */}
          <Card>
            <CardHeader>
              <CardTitle>上传驱动音频</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label>音频文件（MP3 / WAV / M4A，≤50MB）</Label>
              <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                ${audioFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'}
                ${isLoading ? 'pointer-events-none opacity-60' : ''}`}>
                {audioFile ? (
                  <div className="flex flex-col items-center gap-1">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">{audioFile.name}</span>
                    <span className="text-xs text-gray-400">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Upload className="w-7 h-7" />
                    <span className="text-sm">点击上传音频</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.ogg"
                  className="hidden"
                  onChange={handleAudioChange}
                  disabled={isLoading}
                />
              </label>

              {errorMsg && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMsg}</AlertDescription>
                </Alert>
              )}

              {isLoading && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>{statusLabel[genStatus]}</AlertDescription>
                </Alert>
              )}

              {genStatus === 'succeeded' && (
                <Alert className="border-green-400 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">视频生成成功！</AlertDescription>
                </Alert>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={isLoading || !audioFile}
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />生成中...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" />提交生成</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* 生成结果 */}
          {resultVideoUrl && (
            <Card>
              <CardHeader><CardTitle>生成结果</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <video src={resultVideoUrl} controls autoPlay className="w-full rounded-lg" />
                <a
                  href={resultVideoUrl}
                  download="sadtalker-output.mp4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-sm text-primary underline"
                >
                  下载视频
                </a>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 右侧：历史作品 */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <CardHeader><CardTitle>最新作品</CardTitle></CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {isLoadingWorks ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : works.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">还没有作品</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {works.map((work) => (
                    <div key={work.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm line-clamp-1">{work.name || '未命名'}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(work.created_at).toLocaleString('zh-CN')}
                          </p>
                        </div>
                        {getStatusBadge(work.status)}
                      </div>
                      {work.status === 'completed' && work.video_url && (
                        <div className="space-y-2">
                          <video src={work.video_url} controls className="w-full rounded" />
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1" asChild>
                              <a href={work.video_url} target="_blank" rel="noopener noreferrer">
                                <Eye className="w-3 h-3 mr-1" />查看
                              </a>
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1" asChild>
                              <a href={work.video_url} download>
                                <Download className="w-3 h-3 mr-1" />下载
                              </a>
                            </Button>
                          </div>
                        </div>
                      )}
                      {work.status === 'processing' && (
                        <div className="flex items-center justify-center py-2">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          <span className="text-xs text-gray-500">生成中...</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

export default function CreateVideoPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <CreateVideoContent />
    </Suspense>
  )
}

import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Play, Download, Eye, Settings, ArrowLeft, Sparkles, Video } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { AppLayout } from '@/components/app-layout'

interface VideoWork {
  id: string
  name: string
  text: string
  voice: string
  status: 'processing' | 'completed' | 'failed'
  created_at: string
  video_url?: string
  duration?: number
}

function CreateVideoContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const avatarId = searchParams.get('avatarId')
  const avatarName = searchParams.get('name')

  const [text, setText] = useState('')
  const [voice, setVoice] = useState('female-1')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [works, setWorks] = useState<VideoWork[]>([])
  const [isLoadingWorks, setIsLoadingWorks] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [avatarInfo, setAvatarInfo] = useState<any>(null)
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(true)

  // 高级设置
  const [speed, setSpeed] = useState('1.0')
  const [volume, setVolume] = useState('1.0')
  const [pitch, setPitch] = useState('1.0')

  useEffect(() => {
    if (!avatarId) {
      toast.error('缺少数字人ID')
      router.push('/digital-human/list')
      return
    }
    fetchAvatarInfo()
    fetchWorks()
  }, [avatarId])

  const fetchAvatarInfo = async () => {
    try {
      setIsLoadingAvatar(true)
      const response = await fetch('/api/digital-human/list')
      const data = await response.json()
      const avatar = data.humans?.find((h: any) => h.avatar_id === avatarId)
      setAvatarInfo(avatar)
    } catch (error) {
      console.error('Error fetching avatar info:', error)
    } finally {
      setIsLoadingAvatar(false)
    }
  }

  // 自动轮询处理中的作品状态
  useEffect(() => {
    const processingWorks = works.filter(w => w.status === 'processing')

    if (processingWorks.length === 0) {
      return
    }

    // 每5秒检查一次状态
    const interval = setInterval(async () => {
      for (const work of processingWorks) {
        await checkWorkStatus(work.id)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [works])

  const fetchWorks = async () => {
    try {
      setIsLoadingWorks(true)
      console.log('获取作品列表...', { avatarId })
      const response = await fetch(`/api/digital-human/video-works?avatarId=${avatarId}`)
      console.log('作品列表响应状态:', response.status)
      const data = await response.json()
      console.log('作品列表数据:', data)
      setWorks(data.works || [])
    } catch (error) {
      console.error('Error fetching works:', error)
      toast.error('获取作品列表失败')
    } finally {
      setIsLoadingWorks(false)
    }
  }

  const checkWorkStatus = async (workId: string) => {
    try {
      const response = await fetch('/api/digital-human/check-video-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workId }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('检查视频状态失败:', response.status, errorData)
        return
      }

      const data = await response.json()

      // 如果状态已完成或失败，刷新列表
      if (data.status === 'completed' || data.status === 'failed') {
        await fetchWorks()
      }
    } catch (error) {
      console.error('Error checking work status:', error)
    }
  }

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast.error('请输入口播内容')
      return
    }

    if (text.length > 5000) {
      toast.error('文本内容不能超过5000字')
      return
    }

    try {
      setIsSubmitting(true)
      console.log('开始提交视频生成请求...', { avatarId, text, voice })

      const response = await fetch('/api/digital-human/create-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          avatarId,
          text,
          voice,
          speed: parseFloat(speed),
          volume: parseFloat(volume),
          pitch: parseFloat(pitch),
        }),
      })

      console.log('API响应状态:', response.status)
      const data = await response.json()
      console.log('API响应数据:', data)

      if (!response.ok) {
        throw new Error(data.error || '生成失败')
      }

      toast.success('视频生成任务已提交，请稍候...')
      setText('')
      await fetchWorks()
    } catch (error: any) {
      console.error('Error creating video:', error)
      toast.error(error.message || '生成视频失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePreview = () => {
    if (!text.trim()) {
      toast.error('请输入口播内容')
      return
    }
    toast.info('预览功能开发中...')
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      processing: { label: '生成中', variant: 'secondary' as const },
      completed: { label: '已完成', variant: 'default' as const },
      failed: { label: '失败', variant: 'destructive' as const },
    }
    const config = statusConfig[status as keyof typeof statusConfig]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <AppLayout>
      {/* 顶部导航 */}
      <div className="flex items-center mb-8">
        <Link href="/digital-human/list">
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
        </Link>
        <div className="ml-4">
          <h1 className="text-3xl font-bold text-gray-900">创作作品</h1>
          <p className="text-gray-600">使用数字人 {avatarName || avatarId} 创作视频</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：创作区域 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 数字人预览卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                数字人预览
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAvatar ? (
                <div className="aspect-video bg-gray-50 rounded-lg flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
                </div>
              ) : avatarInfo && avatarInfo.video_url ? (
                <div className="space-y-2">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      src={avatarInfo.video_url}
                      controls
                      className="w-full h-full object-contain"
                      poster={avatarInfo.video_url.replace('.mp4', '_thumbnail.jpg')}
                    >
                      您的浏览器不支持视频播放
                    </video>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{avatarInfo.name}</span>
                    <Badge variant={avatarInfo.status === 'completed' ? 'default' : 'secondary'}>
                      {avatarInfo.status === 'completed' ? '已完成' : avatarInfo.status}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Video className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-sm text-gray-600">数字人形象预览</p>
                    <p className="text-xs text-gray-600 mt-1">ID: {avatarId}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 文本输入卡片 */}
          <Card>
            <CardHeader>
              <CardTitle>口播内容</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="text">输入文本</Label>
                <Textarea
                  id="text"
                  placeholder="请输入数字人要说的内容..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={8}
                  className="mt-2"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-600">
                    预计时长: {Math.ceil(text.length / 4)}秒
                  </p>
                  <p className="text-xs text-gray-600">
                    {text.length} / 5000 字
                  </p>
                </div>
              </div>

              {/* 音色选择 */}
              <div>
                <Label htmlFor="voice">音色选择</Label>
                <Select value={voice} onValueChange={setVoice}>
                  <SelectTrigger id="voice" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female-1">播音-女声</SelectItem>
                    <SelectItem value="male-1">播音-男声</SelectItem>
                    <SelectItem value="female-sweet">甜美女声</SelectItem>
                    <SelectItem value="male-magnetic">磁性男声</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handlePreview}
                  disabled={!text.trim()}
                >
                  <Play className="w-4 h-4 mr-2" />
                  试听
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  高级设置
                </Button>
              </div>

              {/* 高级设置 */}
              {showAdvanced && (
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-medium">高级设置</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="speed">语速</Label>
                      <Select value={speed} onValueChange={setSpeed}>
                        <SelectTrigger id="speed" className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0.5">0.5x</SelectItem>
                          <SelectItem value="0.75">0.75x</SelectItem>
                          <SelectItem value="1.0">1.0x</SelectItem>
                          <SelectItem value="1.25">1.25x</SelectItem>
                          <SelectItem value="1.5">1.5x</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="volume">音量</Label>
                      <Select value={volume} onValueChange={setVolume}>
                        <SelectTrigger id="volume" className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0.5">50%</SelectItem>
                          <SelectItem value="0.75">75%</SelectItem>
                          <SelectItem value="1.0">100%</SelectItem>
                          <SelectItem value="1.25">125%</SelectItem>
                          <SelectItem value="1.5">150%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="pitch">音调</Label>
                      <Select value={pitch} onValueChange={setPitch}>
                        <SelectTrigger id="pitch" className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0.5">低</SelectItem>
                          <SelectItem value="1.0">正常</SelectItem>
                          <SelectItem value="1.5">高</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* 提交按钮 */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting || !text.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    提交生成
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：历史作品列表 */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>最新作品</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {isLoadingWorks ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : works.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-600">还没有作品</p>
                  <p className="text-xs text-gray-600 mt-1">
                    创建您的第一个视频作品
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {works.map((work) => (
                    <div
                      key={work.id}
                      className="border rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm line-clamp-1">
                            {work.name || '未命名'}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {new Date(work.created_at).toLocaleString('zh-CN')}
                          </p>
                        </div>
                        {getStatusBadge(work.status)}
                      </div>

                      {work.text && (
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {work.text}
                        </p>
                      )}

                      {work.status === 'completed' && work.video_url && (
                        <div className="space-y-2">
                          <video
                            src={work.video_url}
                            controls
                            className="w-full rounded"
                          >
                            您的浏览器不支持视频播放
                          </video>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              asChild
                            >
                              <a
                                href={work.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                查看
                              </a>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              asChild
                            >
                              <a
                                href={work.video_url}
                                download
                              >
                                <Download className="w-3 h-3 mr-1" />
                                下载
                              </a>
                            </Button>
                          </div>
                        </div>
                      )}

                      {work.status === 'processing' && (
                        <div className="flex items-center justify-center py-2">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          <span className="text-xs text-gray-600">
                            生成中...
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

export default function CreateVideoPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <CreateVideoContent />
    </Suspense>
  )
}
