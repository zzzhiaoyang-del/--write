"use client"

import React from "react"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AgentCard } from "@/components/agent-card"
import { agents, categories, getAgentsByCategory } from "@/lib/agents-data"
import { AppLayout } from "@/components/app-layout"
import {
  Search,
  Grid,
  Crown,
  Users,
  Globe,
  Wrench,
  Bot,
  SlidersHorizontal,
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

function MarketplaceContent() {
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
    <AppLayout title="智能广场" description="发现最适合你的 AI 超级员工，立即开始工作">
      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="搜索 AI 员工、能力或标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-white border-border"
          />
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-full sm:w-40 h-12 bg-white border-border">
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

      {/* Category Filters */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {categories.map((category) => {
          const IconComponent = iconMap[category.icon] || Grid
          const isActive = selectedCategory === category.id
          return (
            <Button
              key={category.id}
              variant={isActive ? "default" : "outline"}
              className={`${
                isActive
                  ? "bg-[#FF6600] text-white hover:bg-[#FF8533]"
                  : "bg-white hover:bg-muted hover:border-[#FF6600] hover:text-[#FF6600]"
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <IconComponent className="w-4 h-4 mr-2" />
              {category.name}
            </Button>
          )
        })}
      </div>

      {/* Agent Grid - 4 columns */}
      {filteredAgents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-border">
          <Bot className="w-16 h-16 mx-auto text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium text-foreground">
            没有找到匹配的 AI 员工
          </h3>
          <p className="mt-2 text-muted-foreground">
            尝试调整搜索关键词或分类筛选
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearchQuery("")
              setSelectedCategory("all")
            }}
          >
            清除筛选
          </Button>
        </div>
      )}
    </AppLayout>
  )
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<Loading />}>
      <MarketplaceContent />
    </Suspense>
  )
}

