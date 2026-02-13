"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AgentCard } from "@/components/agent-card"
import { agents } from "@/lib/agents-data"
import { AppLayout } from "@/components/app-layout"
import { Clock, Heart, Sparkles, Settings, ArrowRight, Plus } from "lucide-react"

// Simulated user data
const recentlyUsedIds = ["topic-expert", "rewrite-assistant", "title-optimizer"]
const favoriteIds = ["marketing-expert", "positioning-expert", "data-analyst"]
const recommendedIds = ["script-writer", "comment-assistant", "general-assistant", "video-analyzer", "live-assistant", "content-planner"]

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
    <AppLayout title="我的 AI 员工" description="管理你的 AI 数字员工团队">
      <div className="space-y-8">
        {/* Recently Used - Horizontal Scroll */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FF6600]/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#FF6600]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">最近使用</h2>
                <p className="text-sm text-muted-foreground">快速继续你的工作</p>
              </div>
            </div>
          </div>

          {recentlyUsed.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {recentlyUsed.map((agent) => (
                <div key={agent.id} className="min-w-[300px]">
                  <AgentCard agent={agent} compact />
                </div>
              ))}
            </div>
          ) : (
            <Card className="border-dashed bg-white">
              <CardContent className="py-8 text-center">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                  暂无最近使用记录
                </p>
                <Link href="/marketplace">
                  <Button className="mt-4 bg-gradient-to-r from-[#FF6600] to-[#FF8533] hover:shadow-md text-white">
                    去探索 AI 员工
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Favorites - Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FF8533]/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-[#FF8533]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">已收藏</h2>
                <p className="text-sm text-muted-foreground">你收藏的 AI 员工</p>
              </div>
            </div>
            <Button variant="outline" className="hover:border-[#FF6600] hover:text-[#FF6600]">
              <Settings className="w-4 h-4 mr-2" />
              管理团队
            </Button>
          </div>

          {favoriteAgents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoriteAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed bg-white">
              <CardContent className="py-8 text-center">
                <Heart className="w-12 h-12 mx-auto text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                  暂无收藏的 AI 员工
                </p>
                <Link href="/marketplace">
                  <Button className="mt-4 bg-gradient-to-r from-[#FF6600] to-[#FF8533] hover:shadow-md text-white">
                    去发现更多
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Recommended - Horizontal Scroll */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FF6600]/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#FF6600]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">为你推荐</h2>
                <p className="text-sm text-muted-foreground">根据你的使用习惯推荐</p>
              </div>
            </div>
            <Link href="/marketplace">
              <Button variant="ghost" className="text-[#FF6600] hover:text-[#FF8533]">
                查看更多
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2">
            {recommended.map((agent) => (
              <div key={agent.id} className="min-w-[280px]">
                <AgentCard agent={agent} />
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <Card className="bg-gradient-to-br from-[#FF6600]/5 to-[#FF8533]/5 border-[#FF6600]/20">
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
                  <Button size="lg" className="bg-gradient-to-r from-[#FF6600] to-[#FF8533] hover:shadow-md text-white">
                    <Plus className="w-5 h-5 mr-2" />
                    探索更多
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppLayout>
  )
}

