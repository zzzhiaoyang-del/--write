import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AgentCard } from "@/components/agent-card"
import { agents } from "@/lib/agents-data"
import { ArrowRight } from "lucide-react"

const featuredAgentIds = [
  "topic-expert",
  "ip-positioning-expert",
  "live-script-generator",
  "circle-marketing-master",
  "hot-video-rewriter",
  "video-to-text",
]

export function FeaturedAgents() {
  const featuredAgents = agents.filter((agent) =>
    featuredAgentIds.includes(agent.id)
  )

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl font-bold text-foreground">热门 AI 员工</h2>
            <p className="mt-2 text-muted-foreground">
              最受欢迎的 AI 超级员工，立即体验
            </p>
          </div>
          <Link href="/marketplace">
            <Button variant="ghost" className="text-primary hover:text-primary/90">
              查看全部
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>
    </section>
  )
}
