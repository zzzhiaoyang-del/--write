'use client'

import { useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, Loader2, CheckCircle2, AlertCircle, Play } from 'lucide-react'
import { AppLayout } from '@/components/app-layout'

// 使用公开 anon key 初始化（仅用于 Storage 上传）
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Status = 'idle' | 'uploading' | 'generating' | 'polling' | 'succeeded' | 'failed'

const STATUS_LABELS: Record<Status, string> = {
  idle: '',
  uploading: '正在上传文件到云存储...',
  generating: '正在提交生成任务...',
  polling: '视频生成中，请稍候（通常需要 2-5 分钟）...',
  succeeded: '视频生成成功！',
  failed: '生成失败，请重试',
}

export default function SadTalkerPage() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrorMsg('请上传图片文件（JPG、PNG 等）')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('图片大小不能超过 10MB')
      return
    }
    setErrorMsg(null)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const allowed = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/webm']
    if (!allowed.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|ogg|webm)$/i)) {
      setErrorMsg('请上传音频文件（MP3、WAV、M4A 等）')
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg('音频大小不能超过 50MB')
      return
    }
    setErrorMsg(null)
    setAudioFile(file)
  }

  // 上传文件到 Supabase Storage，返回 Public URL
  const uploadToSupabase = async (
    file: File,
    bucket: string,
    folder: string
  ): Promise<string> => {
    const ext = file.name.split('.').pop()
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: false })

    if (error) throw new Error(`上传失败: ${error.message}`)

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
    return data.publicUrl
  }

  // 轮询生成状态
  const startPolling = (predictionId: string) => {
    setStatus('polling')
    let attempts = 0
    const MAX_ATTEMPTS = 120 // 最多轮询 10 分钟（每 5 秒一次）

    pollingRef.current = setInterval(async () => {
      attempts++
      if (attempts > MAX_ATTEMPTS) {
        clearInterval(pollingRef.current!)
        setStatus('failed')
        setErrorMsg('生成超时，请重试')
        return
      }

      try {
        const res = await fetch(`/api/sadtalker/status?id=${predictionId}`)
        const data = await res.json()

        if (data.status === 'succeeded') {
          clearInterval(pollingRef.current!)
          // SadTalker output 是一个数组，取第一个元素
          const url = Array.isArray(data.output) ? data.output[0] : data.output
          setVideoUrl(url)
          setStatus('succeeded')
        } else if (data.status === 'failed' || data.status === 'canceled') {
          clearInterval(pollingRef.current!)
          setStatus('failed')
          setErrorMsg(data.error || '生成失败，请重试')
        }
        // starting / processing 继续轮询
      } catch {
        // 网络抖动，继续轮询
      }
    }, 5000)
  }

  const handleGenerate = async () => {
    if (!imageFile || !audioFile) {
      setErrorMsg('请先上传图片和音频文件')
      return
    }

    setErrorMsg(null)
    setVideoUrl(null)
    setStatus('uploading')

    try {
      // 1. 上传图片
      const imageUrl = await uploadToSupabase(
        imageFile,
        'digital-human-images',
        'sadtalker'
      )

      // 2. 上传音频（复用 digital-human-videos bucket）
      const audioUrl = await uploadToSupabase(
        audioFile,
        'digital-human-videos',
        'sadtalker-audio'
      )

      // 3. 提交生成任务
      setStatus('generating')
      const res = await fetch('/api/sadtalker/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, audioUrl }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '提交任务失败')

      // 4. 开始轮询
      startPolling(data.predictionId)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '发生未知错误'
      setErrorMsg(msg)
      setStatus('failed')
    }
  }

  const handleReset = () => {
    if (pollingRef.current) clearInterval(pollingRef.current)
    setImageFile(null)
    setAudioFile(null)
    setImagePreview(null)
    setVideoUrl(null)
    setStatus('idle')
    setErrorMsg(null)
  }

  const isLoading = ['uploading', 'generating', 'polling'].includes(status)

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">SadTalker 数字人生成</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            上传一张人脸图片和一段音频，AI 将自动生成口型同步的数字人视频
          </p>
        </div>

        {/* 上传区域 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">上传素材</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 图片上传 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                人脸图片 <span className="text-red-500">*</span>
                <span className="text-muted-foreground font-normal ml-1">（JPG/PNG，≤10MB）</span>
              </label>
              <label
                className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                  ${imageFile ? 'border-green-400 bg-green-50' : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30'}
                  ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="预览"
                    className="h-full w-full object-contain rounded-lg p-1"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="w-8 h-8" />
                    <span className="text-sm">点击上传图片</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={isLoading}
                />
              </label>
            </div>

            {/* 音频上传 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                驱动音频 <span className="text-red-500">*</span>
                <span className="text-muted-foreground font-normal ml-1">（MP3/WAV/M4A，≤50MB）</span>
              </label>
              <label
                className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                  ${audioFile ? 'border-green-400 bg-green-50' : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30'}
                  ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
              >
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  {audioFile ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                      <span className="text-sm text-green-600">{audioFile.name}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6" />
                      <span className="text-sm">点击上传音频</span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm"
                  className="hidden"
                  onChange={handleAudioChange}
                  disabled={isLoading}
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* 错误提示 */}
        {errorMsg && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        {/* 状态提示 */}
        {isLoading && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>{STATUS_LABELS[status]}</AlertDescription>
          </Alert>
        )}

        {status === 'succeeded' && (
          <Alert className="border-green-400 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              {STATUS_LABELS.succeeded}
            </AlertDescription>
          </Alert>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !imageFile || !audioFile}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                开始生成
              </>
            )}
          </Button>
          {(status !== 'idle') && (
            <Button variant="outline" onClick={handleReset} disabled={isLoading}>
              重置
            </Button>
          )}
        </div>

        {/* 视频播放 */}
        {videoUrl && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">生成结果</CardTitle>
            </CardHeader>
            <CardContent>
              <video
                src={videoUrl}
                controls
                className="w-full rounded-lg"
                autoPlay
              />
              <a
                href={videoUrl}
                download="sadtalker-output.mp4"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block text-center text-sm text-primary underline"
              >
                下载视频
              </a>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
