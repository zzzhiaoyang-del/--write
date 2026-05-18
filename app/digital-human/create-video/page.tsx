'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Loader2, Play, Download, Eye, ArrowLeft,
  Sparkles, Video, CheckCircle2, AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { AppLayout } from '@/components/app-layout'

// 客户端 Supabase（仅用于读取数字人信息）
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ─── 类型 ─────────────────────────────────────────────────────────────────────

interface VideoWork {
  id: string
  name: string
  text: string
  voice: string
  status: 'processing' | 'completed' | 'failed'
  created_at: string
  video_url?: string
}

type GenStatus = 'idle' | 'tts' | 'generating' | 'polling' | 'succeeded' | 'failed'

// ─── 安抚式 Loading 文案（每 3 秒轮换）────────────────────────────────────────
const POLLING_MESSAGES = [
  '正在提取面部特征...',
  '正在合成音频轨道...',
  '正在对齐口型与音频...',
  '正在渲染视频帧...',
  '正在进行人脸增强（GFPGAN）...',
  '视频渲染中，通常需要 1-2 分钟...',
  '快好了，请耐心等待...',
]

// ─── 主组件 ───────────────────────────────────────────────────────────────────

function CreateVideoContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const avatarId = searchParams.get('avatarId')
  const avatarName = searchParams.get('name')

  // 表单状态
  const [text, setText] = useState('')
  const [voiceType, setVoiceType] = useState('female-1')

  // 生成流程状态
  const [genStatus, setGenStatus] = useState<GenStatus>('idle')
  const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // 安抚式 Loading 文案
  const [pollingMsgIndex, setPollingMsgIndex] = useState(0)
  const pollingMsgRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 数字人信息
  const [avatarInfo, setAvatarInfo] = useState<any>(null)
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(true)

  // 历史作品
  const [works, setWorks] = useState<VideoWork[]>([])
  const [isLoadingWorks, setIsLoadingWorks] = useState(true)

  useEffect(() => {
    if (!avatarId) {
      toast.error('缺少数字人ID')
      router.push('/digital-human/list')
      return
    }
    fetchAvatarInfo()
    fetchWorks()
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
      if (pollingMsgRef.current) clearInterval(pollingMsgRef.current)
    }
  }, [avatarId])

  // ── 数据获取 ────────────────────────────────────────────────────────────────

  const fetchAvatarInfo = async () => {
    try {
      setIsLoadingAvatar(true)
      const res = await fetch('/api/digital-human/list')
      const data = await res.json()
      const avatar = data.humans?.find((h: any) => h.avatar_id === avatarId)
      setAvatarInfo(avatar)
    } catch {
      // 静默失败，不影响主流程
    } finally {
      setIsLoadingAvatar(false)
    }
  }

  const fetchWorks = async () => {
    try {
      setIsLoadingWorks(true)
      const res = await fetch(`/api/digital-human/video-works?avatarId=${avatarId}`)
      const data = await res.json()
      setWorks(data.works || [])
    } catch {
      // 静默失败
    } finally {
      setIsLoadingWorks(false)
    }
  }

  // ── 安抚式 Loading 文案轮换 ─────────────────────────────────────────────────

  const startPollingMessages = () => {
    setPollingMsgIndex(0)
    pollingMsgRef.current = setInterval(() => {
      setPollingMsgIndex(i => (i + 1) % POLLING_MESSAGES.length)
    }, 3000)
  }

  const stopPollingMessages = () => {
    if (pollingMsgRef.current) {
      clearInterval(pollingMsgRef.current)
      pollingMsgRef.current = null
    }
  }

  // ── 轮询视频生成任务状态 ─────────────────────────────────────────────────

  const startPolling = (taskId: string) => {
    setGenStatus('polling')
    startPollingMessages()
    let attempts = 0

    pollingRef.current = setInterval(async () => {
      attempts++
      // 最多轮询 10 分钟（120 次 × 5 秒）
      if (attempts > 120) {
        clearInterval(pollingRef.current!)
        stopPollingMessages()
        setGenStatus('failed')
        setErrorMsg('生成超时，请重试')
        return
      }

      try {
        const res = await fetch(`/api/status?taskId=${taskId}`)
        const data = await res.json()

        if (data.status === 'completed') {
          clearInterval(pollingRef.current!)
          stopPollingMessages()
          setResultVideoUrl(data.videoUrl)
          setGenStatus('succeeded')
          toast.success('视频生成成功！')
          fetchWorks() // 刷新历史作品列表
        } else if (data.status === 'failed') {
          clearInterval(pollingRef.current!)
          stopPollingMessages()
          setGenStatus('failed')
          setErrorMsg(data.error || '生成失败，请重试')
        }
        // status === 'processing'：继续等待
      } catch {
        // 网络抖动，忽略，继续轮询
      }
    }, 5000)
  }

  // ── 提交生成 ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast.error('请输入口播内容')
      return
    }
    if (!avatarInfo?.video_url) {
      toast.error('数字人图片不存在，无法生成')
      return
    }

    setErrorMsg(null)
    setResultVideoUrl(null)
    setGenStatus('tts')

    try {
      const res = await fetch('/api/create-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: avatarInfo.video_url, // 数字人图片 URL
          text: text.trim(),
          voiceType,
          avatarId,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '提交失败')

      setGenStatus('generating')
      // 短暂停留在"提交中"状态，然后进入轮询
      setTimeout(() => startPolling(data.taskId), 500)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '发生未知错误'
      setErrorMsg(msg)
      setGenStatus('failed')
      stopPollingMessages()
    }
  }

  const handleReset = () => {
    if (pollingRef.current) clearInterval(pollingRef.current)
    stopPollingMessages()
    setGenStatus('idle')
    setResultVideoUrl(null)
    setErrorMsg(null)
  }

  // ── 计算状态 ────────────────────────────────────────────────────────────────

  const isLoading = ['tts', 'generating', 'polling'].includes(genStatus)

  const statusLabel: Record<GenStatus, string> = {
    idle: '',
    tts: '正在合成语音...',
    generating: '正在提交视频生成任务...',
    polling: POLLING_MESSAGES[pollingMsgIndex],
    succeeded: '视频生成成功！',
    failed: '',
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: 'secondary' | 'default' | 'destructive' }> = {
      processing: { label: '生成中', variant: 'secondary' },
      completed: { label: '已完成', variant: 'default' },
      failed: { label: '失败', variant: 'destructive' },
    }
    const c = config[status] ?? { label: status, variant: 'secondary' as const }
    return <Badge variant={c.variant}>{c.label}</Badge>
  }

  // ── 渲染 ────────────────────────────────────────────────────────────────────

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
        {/* ── 左侧：创作区域 ── */}
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
              ) : resultVideoUrl ? (
                <div className="space-y-3">
                  <div className="bg-black rounded-lg overflow-hidden">
                    <video
                      src={resultVideoUrl}
                      controls
                      autoPlay
                      className="w-full max-h-72 object-contain"
                    />
                  </div>
                  <a
                    href={resultVideoUrl}
                    download="digital-human-output.mp4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-sm text-primary underline"
                  >
                    下载视频
                  </a>
                </div>
              ) : avatarInfo?.video_url ? (
                <div className="space-y-2 relative">
                  <img
                    src={avatarInfo.video_url}
                    alt={avatarInfo.name}
                    className="w-full max-h-72 object-contain rounded-lg bg-black"
                  />
                  {/* 生成中遮罩层 */}
                  {isLoading && (
                    <div className="absolute inset-0 bg-black/60 rounded-lg flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-10 h-10 animate-spin text-white" />
                      <p className="text-white text-sm font-medium text-center px-4">
                        {statusLabel[genStatus]}
                      </p>
                    </div>
                  )}
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

          {/* 口播内容输入 */}
          <Card>
            <CardHeader>
              <CardTitle>口播内容</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="text">输入文字（AI 将自动合成语音并生成视频）</Label>
                <Textarea
                  id="text"
                  placeholder="请输入数字人要说的内容，最多 200 字..."
                  value={text}
                  onChange={e => setText(e.target.value)}
                  maxLength={200}
                  rows={6}
                  className="mt-2"
                  disabled={isLoading}
                />
                {/* 双重字数统计 */}
                <div className="flex justify-end mt-1">
                  <span className={`text-xs ${text.length > 180 ? 'text-red-500' : 'text-gray-400'}`}>
                    {text.length} / 200 字
                  </span>
                </div>
              </div>

              {/* 音色选择 */}
              <div>
                <Label htmlFor="voice">音色选择</Label>
                <Select value={voiceType} onValueChange={setVoiceType} disabled={isLoading}>
                  <SelectTrigger id="voice" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female-1">播音-女声（晓晓）</SelectItem>
                    <SelectItem value="male-1">播音-男声（云希）</SelectItem>
                    <SelectItem value="female-sweet">甜美女声（晓伊）</SelectItem>
                    <SelectItem value="male-magnetic">磁性男声（云健）</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 错误提示 */}
              {errorMsg && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMsg}</AlertDescription>
                </Alert>
              )}

              {/* 安抚式 Loading 提示 */}
              {isLoading && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription className="transition-all duration-500">
                    {statusLabel[genStatus]}
                  </AlertDescription>
                </Alert>
              )}

              {/* 成功提示 */}
              {genStatus === 'succeeded' && (
                <Alert className="border-green-400 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">视频生成成功！</AlertDescription>
                </Alert>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isLoading || !text.trim() || text.length > 200}
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />生成中...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" />提交生成</>
                  )}
                </Button>
                {genStatus !== 'idle' && (
                  <Button variant="outline" onClick={handleReset} disabled={isLoading}>
                    重置
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* ── 右侧：历史作品 ── */}
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
                  {works.map(work => (
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
                      {work.text && (
                        <p className="text-xs text-gray-500 line-clamp-2">{work.text}</p>
                      )}
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <CreateVideoContent />
    </Suspense>
  )
}
