'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, Mic, CheckCircle2, Info, Volume2, Sparkles, Zap } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

type CloneMode = 'high-fidelity' | 'professional'
type ScenarioType = 'live-streaming' | 'knowledge-sharing' | 'emotional-content'

export default function CloneVoicePage() {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [language, setLanguage] = useState('zh-CN')
  const [cloneMode, setCloneMode] = useState<CloneMode>('high-fidelity')
  const [scenario, setScenario] = useState<ScenarioType>('live-streaming')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<string>('')
  const [showTutorial, setShowTutorial] = useState(false)
  const [showModeInfo, setShowModeInfo] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 验证音频大小和格式
      if (file.size > 100 * 1024 * 1024) { // 100MB
        alert('音频大小不能超过100MB')
        return
      }
      if (!file.type.startsWith('audio/')) {
        alert('请上传音频文件')
        return
      }
      setAudioFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!audioFile || !name || !language) {
      alert('请填写所有必填项')
      return
    }

    setUploading(true)
    setProgress('正在上传音频...')

    try {
      // 1. 上传音频到服务器/云存储
      const formData = new FormData()
      formData.append('audio', audioFile)
      formData.append('name', name)
      formData.append('language', language)

      const uploadResponse = await fetch('/api/voice/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) throw new Error('音频上传失败')

      const { audioUrl } = await uploadResponse.json()
      setProgress('音频上传成功，正在克隆声音...')

      // 2. 调用声音克隆API
      const cloneResponse = await fetch('/api/voice/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioUrl,
          name,
          language,
        }),
      })

      if (!cloneResponse.ok) throw new Error('声音克隆失败')

      const { voiceId } = await cloneResponse.json()
      setProgress('声音克隆成功！')

      // 重定向到声音列表页
      setTimeout(() => {
        window.location.href = '/digital-assets/voice-list'
      }, 2000)

    } catch (error) {
      console.error('Error:', error)
      alert(error instanceof Error ? error.message : '创建失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  const handleRecording = () => {
    setIsRecording(true)
    // TODO: 实现浏览器录音功能
    alert('录音功能开发中...')
    setIsRecording(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            声音克隆介绍
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            用两种不同克隆方式来创作视频特点
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowModeInfo(true)}
            >
              <Info className="w-4 h-4 mr-2" />
              克隆方式对比
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTutorial(true)}
            >
              <Info className="w-4 h-4 mr-2" />
              录音教程
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 选择克隆方式 */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* 高保真 */}
            <Card
              className={`cursor-pointer transition-all ${
                cloneMode === 'high-fidelity'
                  ? 'border-primary border-2 shadow-lg'
                  : 'border-2 hover:border-primary/50'
              }`}
              onClick={() => setCloneMode('high-fidelity')}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-lg">高保真</h3>
                  </div>
                  {cloneMode === 'high-fidelity' && (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">高性价比 | 高度拟真</p>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <p>• 支持语言：中文和英文</p>
                  <p>• 音频时长：10秒~3分钟</p>
                  <p>• 人声拟真度超80%</p>
                  <p>• 克隆后，可无限次复用</p>
                </div>
                <Badge className="mt-3" variant="secondary">推荐</Badge>
              </CardContent>
            </Card>

            {/* 专业情感版 */}
            <Card
              className={`cursor-pointer transition-all ${
                cloneMode === 'professional'
                  ? 'border-primary border-2 shadow-lg'
                  : 'border-2 hover:border-primary/50'
              }`}
              onClick={() => setCloneMode('professional')}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-lg">专业情感版</h3>
                  </div>
                  {cloneMode === 'professional' && (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">技术领先 | 高度还原</p>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <p>• 支持语言：中文和英文</p>
                  <p>• 音频时长：10秒~3分钟</p>
                  <p>• 人声拟真度超85%</p>
                  <p>• 适配对声音高追求的群体</p>
                </div>
                <Badge className="mt-3" variant="outline">高级</Badge>
              </CardContent>
            </Card>
          </div>

          {/* 应用场景 */}
          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  1
                </span>
                应用场景
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={scenario === 'live-streaming' ? 'default' : 'outline'}
                  onClick={() => setScenario('live-streaming')}
                  className="flex-1"
                >
                  带货主播
                </Button>
                <Button
                  type="button"
                  variant={scenario === 'knowledge-sharing' ? 'default' : 'outline'}
                  onClick={() => setScenario('knowledge-sharing')}
                  className="flex-1"
                >
                  知识分享
                </Button>
                <Button
                  type="button"
                  variant={scenario === 'emotional-content' ? 'default' : 'outline'}
                  onClick={() => setScenario('emotional-content')}
                  className="flex-1"
                >
                  情感博主
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 2. 声音样本 */}
          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  2
                </span>
                声音样本
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/20 hover:bg-muted/30 transition-colors">
                  {audioFile ? (
                    <div className="space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                        <Volume2 className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{audioFile.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAudioFile(null)}
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
                        <p className="text-sm font-medium mb-2">上传音频</p>
                        <Input
                          id="audio-upload"
                          type="file"
                          accept="audio/*"
                          onChange={handleAudioUpload}
                          className="max-w-xs mx-auto cursor-pointer hidden"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 录音小要求 */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="text-sm font-semibold mb-3">录音小要求</h4>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p>• 录制时，请保持10厘米左右距离</p>
                    <p>• 保持录音均速、自然、稳定</p>
                    <p>• 请使用普通话，尽量不要有方言</p>
                    <p>• 音频时长不能少于 10 秒</p>
                  </div>
                </div>

                {/* 双按钮 */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button
                    type="button"
                    variant="default"
                    className="w-full"
                    onClick={handleRecording}
                    disabled={isRecording}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    {isRecording ? '录制中...' : '在线录制'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById('audio-upload')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    上传音频
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. 声音名称 */}
          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  3
                </span>
                声音名称
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="请输入声音名称，例如：我的声音"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                className="h-12"
              />
            </CardContent>
          </Card>

          {/* 4. 语言设置 */}
          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  4
                </span>
                语言设置
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="请选择语言" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zh-CN">中文（简体）</SelectItem>
                  <SelectItem value="zh-TW">中文（繁体）</SelectItem>
                  <SelectItem value="en-US">英语（美式）</SelectItem>
                  <SelectItem value="en-GB">英语（英式）</SelectItem>
                  <SelectItem value="ja-JP">日语</SelectItem>
                  <SelectItem value="ko-KR">韩语</SelectItem>
                </SelectContent>
              </Select>

              {/* 高级设置 */}
              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <h4 className="text-sm font-semibold mb-3">高级设置（可选）</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">音色优化</span>
                    <Badge variant="secondary">推荐</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">降噪处理</span>
                    <Badge variant="secondary">推荐</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 提交按钮 */}
          <Button
            type="submit"
            className="w-full h-14 text-base font-semibold"
            size="lg"
            disabled={uploading || !audioFile || !name || !language}
          >
            {uploading ? progress : '开始克隆'}
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

      {/* Tutorial Dialog - 声音克隆教程 */}
      <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">声音克隆教程</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* 要求列表 */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <p className="text-sm">安静环境</p>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <p className="text-sm">无杂音、噪音</p>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <p className="text-sm">无回声、混响</p>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <p className="text-sm">音色自然、稳定</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-3 text-sm">录音小要求</h4>
              <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                <p>• 录制时，请保持10厘米左右距离</p>
                <p>• 保持录音均速、自然、稳定</p>
                <p>• 请使用普通话，尽量不要有方言</p>
                <p>• 音频时长不能少于 10 秒</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-3 text-sm">详细要求</h4>
              <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                <p>1、所有录音为同一人录制，不掺杂其他人声</p>
                <p>2、录音过程中保证全程环境无杂音，无啰嗦，否则会影响制作效果。</p>
                <p>3、录音过程中可存在口误，口误时无需终止录音，可停顿1秒后继续录制即可。</p>
                <p>4、在录制音频前建议先确定好声音风格，在录音时尽量贴近风格，避免录制的音频情绪起伏大超于平淡。</p>
                <p>5、音频时长不能少于 10 秒</p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setShowTutorial(false)}
            className="w-full"
          >
            我知道了
          </Button>
        </DialogContent>
      </Dialog>

      {/* Mode Info Dialog - 克隆方式对比 */}
      <Dialog open={showModeInfo} onOpenChange={setShowModeInfo}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">克隆方式对比</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="grid gap-4">
              {/* 高保真 */}
              <Card className="border-2">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-lg">高保真</h3>
                    <Badge variant="secondary">推荐</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">高性价比 | 高度拟真</p>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="font-medium mb-2">特点：</p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• 支持语言：中文和英文</li>
                        <li>• 音频时长：10秒~3分钟</li>
                        <li>• 人声拟真度超80%</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium mb-2">优势：</p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• 克隆速度快</li>
                        <li>• 性价比高</li>
                        <li>• 无限次复用</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 专业情感版 */}
              <Card className="border-2 border-primary/30">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-lg">专业情感版</h3>
                    <Badge variant="outline">高级</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">技术领先 | 高度还原</p>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="font-medium mb-2">特点：</p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• 支持语言：中文和英文</li>
                        <li>• 音频时长：10秒~3分钟</li>
                        <li>• 人声拟真度超85%</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium mb-2">优势：</p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• 情感分析算法</li>
                        <li>• 更高还原度</li>
                        <li>• 适合高要求场景</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <Button
            onClick={() => setShowModeInfo(false)}
            className="w-full"
          >
            确定
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
