"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { AgentCard } from "@/components/agent-card"
import { agents } from "@/lib/agents-data"
import { AppLayout } from "@/components/app-layout"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import {
  User,
  Settings,
  Crown,
  Clock,
  Heart,
  History,
  ChevronRight,
  Zap,
  Calendar,
  BarChart3,
  LogOut,
  Bell,
  Shield,
  CreditCard,
} from "lucide-react"

const favoriteIds = ["marketing-expert", "positioning-expert", "data-analyst"]

const historyItems = [
  {
    id: 1,
    agentName: "AI爆款选题专家",
    preview: "帮我生成5个美食领域的爆款选题...",
    time: "今天 14:30",
  },
  {
    id: 2,
    agentName: "AI内容改写助手",
    preview: "把这段文案改写成小红书风格...",
    time: "今天 10:15",
  },
  {
    id: 3,
    agentName: "AI营销文案专家",
    preview: "为新品写一条朋友圈营销文案...",
    time: "昨天 18:42",
  },
  {
    id: 4,
    agentName: "AI数据分析助手",
    preview: "分析这10条视频的数据表现...",
    time: "昨天 09:20",
  },
  {
    id: 5,
    agentName: "AI爆款标题生成器",
    preview: "为这篇文章生成10个标题...",
    time: "3天前",
  },
]

const settingsMenu = [
  { icon: User, label: "个人资料", href: "#" },
  { icon: Bell, label: "通知设置", href: "#" },
  { icon: Shield, label: "账号安全", href: "#" },
  { icon: CreditCard, label: "支付方式", href: "#" },
]

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Mock user data (will be replaced with real data from database later)
  const userData = {
    plan: "free",
    planName: "免费版",
    dailyUsed: 7,
    dailyLimit: 10,
    monthlyUsed: 156,
    monthlyLimit: 300,
  }

  useEffect(() => {
    // Check authentication
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        // Redirect to home if not logged in
        router.push('/')
        return
      }

      setUser(session.user)
      setLoading(false)
    }

    checkUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/')
      } else {
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, router])

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' })
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Format join date
  const joinDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    : '未知'

  const favoriteAgents = agents.filter((a) => favoriteIds.includes(a.id))

  return (
    <AppLayout>
      {/* Profile Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Avatar className="w-20 h-20">
            <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} />
            <AvatarFallback className="bg-[#FF6600]/10 text-[#FF6600] text-2xl">
              {user.user_metadata?.full_name?.slice(0, 1) || user.email?.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </h1>
              <Badge
                variant="secondary"
                className="bg-[#FF6600]/10 text-[#FF6600] border-0"
              >
                <Crown className="w-3 h-3 mr-1" />
                {userData.planName}
              </Badge>
            </div>
            <p className="text-gray-600 mt-1">{user.email}</p>
            <p className="text-sm text-gray-500 mt-2">
              加入时间：{joinDate}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50">
              <Settings className="w-4 h-4 mr-2" />
              设置
            </Button>
            <Link href="/pricing">
              <Button className="bg-[#FF6600] hover:bg-[#FF8533] text-white">
                <Zap className="w-4 h-4 mr-2" />
                升级套餐
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Usage Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#FF6600]" />
                  使用统计
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Today */}
                  <div className="p-4 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        今日使用
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {userData.dailyUsed}/{userData.dailyLimit}
                      </span>
                    </div>
                    <Progress
                      value={(userData.dailyUsed / userData.dailyLimit) * 100}
                      className="h-2"
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      剩余 {userData.dailyLimit - userData.dailyUsed} 次
                    </p>
                  </div>

                  {/* This Month */}
                  <div className="p-4 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        本月使用
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {userData.monthlyUsed}/{userData.monthlyLimit}
                      </span>
                    </div>
                    <Progress
                      value={(userData.monthlyUsed / userData.monthlyLimit) * 100}
                      className="h-2"
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      剩余 {userData.monthlyLimit - userData.monthlyUsed} 次
                    </p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">156</div>
                    <div className="text-xs text-gray-600">本月生成</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">5</div>
                    <div className="text-xs text-gray-600">
                      常用 AI 员工
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">28</div>
                    <div className="text-xs text-gray-600">活跃天数</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* History */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="w-5 h-5 text-gray-600" />
                  使用历史
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  查看全部
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {historyItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#FF6600]/10 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 text-[#FF6600]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {item.agentName}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {item.preview}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Favorites */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  收藏的 AI 员工
                </CardTitle>
                <Link href="/my-agents">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                    管理收藏
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favoriteAgents.slice(0, 4).map((agent) => (
                    <AgentCard key={agent.id} agent={agent} compact />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Current Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Crown className="w-5 h-5 text-[#FF6600]" />
                  当前套餐
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <Badge className="bg-[#FF6600]/10 text-[#FF6600] border-0 text-lg px-4 py-1">
                    {userData.planName}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-4">
                    升级 Pro 版解锁全部 AI 员工和更多使用次数
                  </p>
                  <Link href="/pricing">
                    <Button className="mt-4 w-full bg-[#FF6600] hover:bg-[#FF8533] text-white">
                      查看升级方案
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Settings Menu */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-600" />
                  设置
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-200">
                  {settingsMenu.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <item.icon className="w-5 h-5 text-gray-600" />
                      <span className="flex-1 text-gray-900">{item.label}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Logout */}
            <Button
              variant="outline"
              className="w-full text-gray-600 hover:text-red-600 hover:border-red-600 bg-transparent border-gray-300"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              退出登录
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
