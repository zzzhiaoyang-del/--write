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
import { Footer } from "@/components/footer"
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
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-muted/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {user.user_metadata?.full_name?.slice(0, 1) || user.email?.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </h1>
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-0"
                >
                  <Crown className="w-3 h-3 mr-1" />
                  {userData.planName}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">{user.email}</p>
              <p className="text-sm text-muted-foreground mt-2">
                加入时间：{joinDate}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="bg-transparent">
                <Settings className="w-4 h-4 mr-2" />
                设置
              </Button>
              <Link href="/pricing">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Zap className="w-4 h-4 mr-2" />
                  升级套餐
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Usage Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  使用统计
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Today */}
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        今日使用
                      </span>
                      <span className="text-sm font-medium">
                        {userData.dailyUsed}/{userData.dailyLimit}
                      </span>
                    </div>
                    <Progress
                      value={(userData.dailyUsed / userData.dailyLimit) * 100}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      剩余 {userData.dailyLimit - userData.dailyUsed} 次
                    </p>
                  </div>

                  {/* This Month */}
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        本月使用
                      </span>
                      <span className="text-sm font-medium">
                        {userData.monthlyUsed}/{userData.monthlyLimit}
                      </span>
                    </div>
                    <Progress
                      value={(userData.monthlyUsed / userData.monthlyLimit) * 100}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      剩余 {userData.monthlyLimit - userData.monthlyUsed} 次
                    </p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">156</div>
                    <div className="text-xs text-muted-foreground">本月生成</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">5</div>
                    <div className="text-xs text-muted-foreground">
                      常用 AI 员工
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">28</div>
                    <div className="text-xs text-muted-foreground">活跃天数</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* History */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="w-5 h-5 text-muted-foreground" />
                  使用历史
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  查看全部
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {historyItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {item.agentName}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {item.preview}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
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
                  <Heart className="w-5 h-5 text-accent" />
                  收藏的 AI 员工
                </CardTitle>
                <Link href="/my-agents">
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
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
                  <Crown className="w-5 h-5 text-primary" />
                  当前套餐
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <Badge className="bg-primary/10 text-primary border-0 text-lg px-4 py-1">
                    {userData.planName}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-4">
                    升级 Pro 版解锁全部 AI 员工和更多使用次数
                  </p>
                  <Link href="/pricing">
                    <Button className="mt-4 w-full bg-primary hover:bg-primary/90 text-primary-foreground">
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
                  <Settings className="w-5 h-5 text-muted-foreground" />
                  设置
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {settingsMenu.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-3 px-6 py-4 hover:bg-muted/50 transition-colors"
                    >
                      <item.icon className="w-5 h-5 text-muted-foreground" />
                      <span className="flex-1 text-foreground">{item.label}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Logout */}
            <Button
              variant="outline"
              className="w-full text-muted-foreground hover:text-destructive hover:border-destructive bg-transparent"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              退出登录
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
