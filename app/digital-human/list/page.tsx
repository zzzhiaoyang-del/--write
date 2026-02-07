'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Video, Plus, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface DigitalHuman {
  id: string
  name: string
  category: string
  status: 'processing' | 'completed' | 'failed'
  created_at: string
  avatar_id: string
}

export default function DigitalHumanListPage() {
  const [humans, setHumans] = useState<DigitalHuman[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDigitalHumans()
  }, [])

  const fetchDigitalHumans = async () => {
    try {
      const response = await fetch('/api/digital-human/list')
      const data = await response.json()
      setHumans(data.humans || [])
    } catch (error) {
      console.error('Error fetching digital humans:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      processing: { label: '处理中', variant: 'secondary' as const },
      completed: { label: '已完成', variant: 'default' as const },
      failed: { label: '失败', variant: 'destructive' as const },
    }
    const config = statusConfig[status as keyof typeof statusConfig]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">数字人资产</h1>
          <p className="text-muted-foreground">管理您的数字人分身</p>
        </div>
        <Link href="/digital-human">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            创建数字人
          </Button>
        </Link>
      </div>

      {humans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Video className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">还没有数字人</p>
            <p className="text-sm text-muted-foreground mb-4">
              创建您的第一个数字人分身
            </p>
            <Link href="/digital-human">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                立即创建
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {humans.map((human) => (
            <Card key={human.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{human.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {human.category}
                    </p>
                  </div>
                  {getStatusBadge(human.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">
                    创建时间: {new Date(human.created_at).toLocaleDateString('zh-CN')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ID: {human.avatar_id}
                  </div>
                  {human.status === 'completed' && (
                    <Button className="w-full mt-4" size="sm">
                      使用数字人
                    </Button>
                  )}
                  {human.status === 'processing' && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">处理中...</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
