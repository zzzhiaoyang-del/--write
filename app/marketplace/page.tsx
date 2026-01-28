"use client"

import React from "react"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AgentCard } from "@/components/agent-card"
import { agents, categories, getAgentsByCategory } from "@/lib/agents-data"
import { Footer } from "@/components/footer"
import {
  Search,
  Grid,
  Crown,
  Users,
  Globe,
  Wrench,
  Bot,
  SlidersHorizontal,
  PenTool,
  TrendingUp,
  DollarSign,
  BarChart3,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Loading from "./loading"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Grid,
  Crown,
  Users,
  Globe,
  Wrench,
}

type SortOption = "recommended" | "popular" | "newest"

export default function MarketplacePage() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams?.get("query") || "")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState<SortOption>("recommended")

  const filteredAgents = useMemo(() => {
    let result = getAgentsByCategory(selectedCategory)

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (agent) =>
          agent.name.toLowerCase().includes(query) ||
          agent.shortDescription.toLowerCase().includes(query) ||
          agent.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    // Sort
    switch (sortBy) {
      case "popular":
        result = [...result].sort((a, b) => b.usageCount - a.usageCount)
        break
      case "newest":
        result = [...result].reverse()
        break
      default:
        // recommended - keep original order
        break
    }

    return result
  }, [searchQuery, selectedCategory, sortBy])

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-muted/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-foreground">智能广场</h1>
          <p className="mt-2 text-muted-foreground">
            发现最适合你的 AI 超级员工，立即开始工作
          </p>

          {/* Search Bar */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="搜索 AI 员工、能力或标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-background"
              />
            </div>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-full sm:w-40 h-12 bg-background">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                <SelectValue placeholder="排序方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">推荐</SelectItem>
                <SelectItem value="popular">热门</SelectItem>
                <SelectItem value="newest">最新</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:w-56 shrink-0">
            <div className="sticky top-24">
              <h3 className="font-semibold text-foreground mb-4">分类筛选</h3>
              <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
                {categories.map((category) => {
                  const IconComponent = iconMap[category.icon] || Grid
                  const isActive = selectedCategory === category.id
                  return (
                    <Button
                      key={category.id}
                      variant={isActive ? "default" : "ghost"}
                      className={`justify-start whitespace-nowrap ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      {category.name}
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Agent Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                共 <span className="font-medium text-foreground">{filteredAgents.length}</span> 个 AI 员工
              </p>
            </div>

            {filteredAgents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAgents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Bot className="w-16 h-16 mx-auto text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium text-foreground">
                  没有找到匹配的 AI 员工
                </h3>
                <p className="mt-2 text-muted-foreground">
                  尝试调整搜索关键词或分类筛选
                </p>
                <Button
                  variant="outline"
                  className="mt-4 bg-transparent"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("all")
                  }}
                >
                  清除筛选
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
