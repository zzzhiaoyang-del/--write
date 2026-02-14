"use client"

import React from "react"

import { useState, use, useEffect } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { getAgentById, formatUsageCount } from "@/lib/agents-data"
import { AgentForm } from "@/components/agent-form"
import { AppLayout } from "@/components/app-layout"
import {
  ArrowLeft,
  Lightbulb,
  Target,
  RefreshCw,
  Megaphone,
  Users,
  LineChart,
  Video,
  MessageCircle,
  Zap,
  Bot,
  Check,
  Clock,
  Heart,
  Send,
  Loader2,
  Copy,
  Sparkles,
  Radio,
  Search,
  BookOpen,
  Edit,
  Calendar,
  Film,
  TrendingUp,
  UserCircle,
  Flame,
  ShoppingBag,
  Camera,
  FileVideo,
  Download,
  ScrollText,
  Trash2,
} from "lucide-react"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Lightbulb,
  Target,
  RefreshCw,
  Megaphone,
  Users,
  LineChart,
  Video,
  MessageCircle,
  Zap,
  Bot,
  Radio,
  Search,
  BookOpen,
  Edit,
  Calendar,
  Copy,
  Film,
  TrendingUp,
  UserCircle,
  Flame,
  ShoppingBag,
  Camera,
  FileVideo,
  Download,
  ScrollText,
}

interface AgentPageProps {
  params: Promise<{ id: string }>
}

export default function AgentPage({ params }: AgentPageProps) {
  const { id } = use(params)
  const agent = getAgentById(id)

  const [input, setInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState("")
  const [isFavorite, setIsFavorite] = useState(false)
  const [history, setHistory] = useState<Array<{
    id: string;
    formData: Record<string, string | string[]>;
    result: string;
    time: string
  }>>([])
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [user, setUser] = useState<any>(null)

  if (!agent) {
    notFound()
  }

  const IconComponent = iconMap[agent.icon] || Bot

  // 加载用户信息和历史记录
  useEffect(() => {
    loadUserAndHistory()
  }, [agent.id])

  const loadUserAndHistory = async () => {
    try {
      // 检查用户登录状态
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)

        // 如果用户已登录，加载历史记录
        if (data.user) {
          await loadHistory()
        }
      }
    } catch (error) {
      console.error('加载用户信息失败:', error)
    }
  }

  const loadHistory = async () => {
    setIsLoadingHistory(true)
    try {
      const response = await fetch(`/api/history?agentId=${agent.id}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        const formattedHistory = data.history.map((item: any) => ({
          id: item.id,
          formData: item.form_data,
          result: item.result,
          time: new Date(item.created_at).toLocaleString('zh-CN', {
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }))
        setHistory(formattedHistory)
      }
    } catch (error) {
      console.error('加载历史记录失败:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const saveToHistory = async (formData: Record<string, string | string[]>, generatedResult: string) => {
    if (!user) return

    try {
      const response = await fetch('/api/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: agent.id,
          formData,
          result: generatedResult
        })
      })

      if (response.ok) {
        // 重新加载历史记录
        await loadHistory()
      }
    } catch (error) {
      console.error('保存历史记录失败:', error)
    }
  }

  const deleteHistoryItem = async (historyId: string) => {
    if (!user) return

    try {
      const response = await fetch(`/api/history?id=${historyId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // 从状态中移除该项
        setHistory(prev => prev.filter(item => item.id !== historyId))

        // 如果删除的是当前选中的项，清空选中状态
        if (selectedHistoryId === historyId) {
          setSelectedHistoryId(null)
        }
      }
    } catch (error) {
      console.error('删除历史记录失败:', error)
    }
  }

  const handleGenerate = async (inputOrFormData?: string | Record<string, string | string[]>) => {
    const inputText = typeof inputOrFormData === 'string' ? inputOrFormData : input
    if (typeof inputOrFormData === 'string' && !inputText.trim()) return

    setIsGenerating(true)
    setResult("")

    try {
      // 如果是表单数据且支持 API 调用的 AI 员工
      if (typeof inputOrFormData === 'object' &&
          (agent.id === 'short-video-topic-expert' || agent.id === 'ip-positioning-expert' || agent.id === 'topic-expert' || agent.id === 'live-script-generator' || agent.id === 'douyin-account-analyzer' || agent.id === 'video-batch-rewrite' || agent.id === 'xiaohongshu-account-analyst' || agent.id === 'circle-marketing-master' || agent.id === 'circle-copy-rewriter' || agent.id === 'circle-clone' || agent.id === 'private-sales-coach' || agent.id === 'private-content-planner' || agent.id === 'persona-video-rewriter' || agent.id === 'hot-video-rewriter' || agent.id === 'live-traffic-script' || agent.id === 'hotspot-topic-assistant' || agent.id === 'title-optimizer' || agent.id === 'hot-video-follow' || agent.id === 'video-to-text' || agent.id === 'teleprompter')) {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            agentId: agent.id,
            formData: inputOrFormData
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '生成失败')
        }

        const data = await response.json()
        setResult(data.result)

        // 保存到历史记录（只有登录用户才保存）
        if (data.result && user) {
          await saveToHistory(inputOrFormData, data.result)
        }
      } else {
        // 其他情况使用模拟数据
        await new Promise((resolve) => setTimeout(resolve, 2000))

        if (typeof inputOrFormData === 'object') {
          const formSummary = Object.entries(inputOrFormData)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n')

          setResult(
            `根据您填写的信息，${agent.name} 已为您生成以下专业内容：\n\n` +
            `【您的输入信息】\n${formSummary}\n\n` +
            `【生成结果】\n\n` +
            `1. 这是一个示例生成结果，展示 ${agent.name} 的工作能力。\n\n` +
            `2. 在实际使用中，AI 会根据您填写的详细信息生成高质量的专业内容。\n\n` +
            `3. 您可以根据需要复制、修改或继续优化这些内容。\n\n` +
            `提示：这只是一个 UI 演示，实际功能需要接入 AI 后端服务。`
          )
        } else {
          setResult(
            `根据您的需求「${inputText}」，我已经为您生成了以下内容：\n\n1. 这是一个示例生成结果，展示 AI 员工的工作能力。\n\n2. 在实际使用中，这里会显示 ${agent.name} 生成的专业内容。\n\n3. 您可以根据需要复制、修改或继续优化这些内容。\n\n提示：这只是一个 UI 演示，实际功能需要接入 AI 后端服务。`
          )
        }
      }
    } catch (error) {
      console.error('生成错误:', error)
      setResult(`生成失败：${error instanceof Error ? error.message : '未知错误'}。请稍后重试。`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleFormSubmit = (formData: Record<string, string | string[]>) => {
    handleGenerate(formData)
  }

  const copyResult = () => {
    navigator.clipboard.writeText(result)
  }

  const loadHistoryItem = (historyItem: typeof history[0]) => {
    setSelectedHistoryId(historyItem.id)
    setResult(historyItem.result)
  }

  return (
    <AppLayout>
      {/* Agent Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <Link
          href="/marketplace"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回智能广场
        </Link>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FF6600]/10 flex items-center justify-center shrink-0">
            <IconComponent className="w-8 h-8 text-[#FF6600]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{agent.name}</h1>
              <Button
                variant="ghost"
                size="icon"
                className={isFavorite ? "text-red-500" : "text-gray-400"}
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
              </Button>
            </div>
            <p className="text-gray-600 mt-1">{agent.shortDescription}</p>
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <div className="flex gap-2">
                {agent.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-700 border-0">
                    {tag}
                  </Badge>
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {formatUsageCount(agent.usageCount)} 次使用
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-full">
        {/* 统一的三栏布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
          {/* Left - Form (1 column) */}
          <div className="lg:col-span-1 flex flex-col">
            {agent.useFormMode && agent.formSteps ? (
              <AgentForm
                steps={agent.formSteps}
                onSubmit={handleFormSubmit}
                isGenerating={isGenerating}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#FF6600]" />
                    开始工作
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder={`例如：${agent.examplePrompts[0]}`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="min-h-32 resize-none border-gray-300"
                  />
                  <Button
                    onClick={() => handleGenerate()}
                    disabled={!input.trim() || isGenerating}
                    className="w-full bg-[#FF6600] hover:bg-[#FF8533] text-white"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        生成结果
                      </>
                    )}
                  </Button>

                  {/* Example Prompts */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">快捷模板：</p>
                    <div className="flex flex-wrap gap-2">
                      {agent.examplePrompts.slice(0, 3).map((prompt, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="text-xs h-auto py-2 px-3 whitespace-normal text-left bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50"
                          onClick={() => setInput(prompt)}
                        >
                          {prompt.length > 25 ? prompt.slice(0, 25) + "..." : prompt}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Middle - Results (2 columns) */}
          <div className="lg:col-span-2 flex flex-col">
            {result ? (
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-lg">生成结果</CardTitle>
                  <Button variant="ghost" size="sm" onClick={copyResult} className="text-gray-600 hover:text-gray-900">
                    <Copy className="w-4 h-4 mr-2" />
                    复制
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-sm leading-relaxed max-h-[600px] overflow-y-auto text-gray-900">
                    {result}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center min-h-[400px]">
                <CardContent className="text-center py-12">
                  <Sparkles className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    等待生成
                  </h3>
                  <p className="text-gray-600 text-sm">
                    填写左侧表单，点击生成按钮开始创作
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right - Info + History (1 column) */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Quick Info */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="text-base">能力简介</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {agent.capabilities.slice(0, 3).map((cap, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <Check className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-gray-600">{cap}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex flex-wrap gap-1.5">
                    {agent.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs bg-gray-100 text-gray-700 border-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* History */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  历史记录
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!user ? (
                  <div className="text-center py-6">
                    <Clock className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-xs text-gray-600 mb-2">登录后查看历史记录</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      onClick={() => window.location.href = '/api/auth/google'}
                    >
                      立即登录
                    </Button>
                  </div>
                ) : isLoadingHistory ? (
                  <div className="text-center py-6">
                    <Loader2 className="w-6 h-6 mx-auto animate-spin text-gray-400 mb-2" />
                    <p className="text-xs text-gray-600">加载中...</p>
                  </div>
                ) : history.length > 0 ? (
                  <div className="space-y-2">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border group ${
                          selectedHistoryId === item.id ? 'border-[#FF6600] bg-gray-50' : 'border-transparent'
                        }`}
                        onClick={() => loadHistoryItem(item)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-xs font-medium text-gray-900 line-clamp-1 flex-1">
                            {typeof item.formData === 'object' && 'niche' in item.formData
                              ? (item.formData.niche as string)
                              : '历史记录'}
                          </p>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {item.time}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteHistoryItem(item.id)
                              }}
                            >
                              <Trash2 className="w-3 h-3 text-red-600" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {item.result.split('\n')[0]}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Clock className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-xs text-gray-600">暂无历史记录</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
