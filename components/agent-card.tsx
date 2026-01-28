"use client"

import React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { type AIAgent } from "@/lib/agents-data"
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
    <Card className="group hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex flex-col aspect-square">
      <CardContent className="p-5 flex-1 flex flex-col justify-between">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <IconComponent className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-tight mb-1.5">
              {agent.name}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {agent.shortDescription}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {agent.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs px-2.5 py-0.5">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <Link href={`/agent/${agent.id}`} className="w-full">
          <Button className="w-full h-11 text-sm font-medium group/btn bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
            立即使用
            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
