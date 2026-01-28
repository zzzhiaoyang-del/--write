"use client"

import React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { type AIAgent, formatUsageCount } from "@/lib/agents-data"
import {
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
  ArrowRight,
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

interface AgentCardProps {
  agent: AIAgent
  compact?: boolean
}

export function AgentCard({ agent, compact = false }: AgentCardProps) {
  const IconComponent = iconMap[agent.icon] || Bot

  if (compact) {
    return (
      <Link href={`/agent/${agent.id}`}>
        <Card className="group hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer h-full">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <IconComponent className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {agent.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {agent.shortDescription}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Card className="group hover:shadow-lg hover:border-primary/30 transition-all duration-300 h-full flex flex-col">
      <CardContent className="p-5 flex-1">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
            <IconComponent className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {agent.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {agent.shortDescription}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {agent.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          {formatUsageCount(agent.usageCount)} 次使用
        </div>
      </CardContent>
      <CardFooter className="px-5 pb-5 pt-0">
        <Link href={`/agent/${agent.id}`} className="w-full">
          <Button className="w-full group/btn bg-primary hover:bg-primary/90 text-primary-foreground">
            立即使用
            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
