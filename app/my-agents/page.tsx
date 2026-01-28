"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AgentCard } from "@/components/agent-card"
import { agents } from "@/lib/agents-data"
import { Footer } from "@/components/footer"
import { Clock, Heart, Sparkles, Settings, ArrowRight, Plus } from "lucide-react"

// Simulated user data
const recentlyUsedIds = ["topic-expert", "rewrite-assistant", "title-optimizer"]
const favoriteIds = ["marketing-expert", "positioning-expert", "data-analyst"]
const recommendedIds = ["script-writer", "comment-assistant", "general-assistant"]

export default function MyAgentsPage() {
  const [favorites, setFavorites] = useState<string[]>(favoriteIds)

  const recentlyUsed = agents.filter((a) => recentlyUsedIds.includes(a.id))
  const favoriteAgents = agents.filter((a) => favorites.includes(a.id))
  const recommended = agents.filter((a) => recommendedIds.includes(a.id))

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-muted/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">我的 AI 员工</h1>
              <p className="mt-2 text-muted-foreground">
                管理你的 AI 数字员工团队
              </p>
            </div>
            <Button variant="outline" className="hidden sm:flex bg-transparent">
              <Settings className="w-4 h-4 mr-2" />
              管理团队
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recently Used */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">最近使用</h2>
                <p className="text-sm text-muted-foreground">快速继续你的工作</p>
              </div>
            </div>
          </div>

          {recentlyUsed.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentlyUsed.map((agent) => (
                <AgentCard key={agent.id} agent={agent} compact />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                  暂无最近使用记录
                </p>
                <Link href="/marketplace">
                  <Button className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                    去探索 AI 员工
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Favorites */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">已收藏</h2>
                <p className="text-sm text-muted-foreground">你收藏的 AI 员工</p>
              </div>
            </div>
          </div>

          {favoriteAgents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <Heart className="w-12 h-12 mx-auto text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                  暂无收藏的 AI 员工
                </p>
                <Link href="/marketplace">
                  <Button className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                    去发现更多
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Recommended */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">为你推荐</h2>
                <p className="text-sm text-muted-foreground">根据你的使用习惯推荐</p>
              </div>
            </div>
            <Link href="/marketplace">
              <Button variant="ghost" className="text-primary hover:text-primary/90">
                查看更多
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommended.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                  <h3 className="text-xl font-semibold text-foreground">
                    想要更多 AI 员工？
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    探索智能广场，发现更多适合你的 AI 超级员工
                  </p>
                </div>
                <Link href="/marketplace">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Plus className="w-5 h-5 mr-2" />
                    探索更多
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <Footer />
    </div>
  )
}
