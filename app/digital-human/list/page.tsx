'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Video, Plus, Loader2, Sparkles, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DigitalHuman {
  id: string
  name: string
  category: string
  status: 'processing' | 'completed' | 'failed'
  created_at: string
  avatar_id: string
  result_url?: string // D-ID 生成的视频URL
}

export default function DigitalHumanListPage() {
  const [humans, setHumans] = useState<DigitalHuman[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [humanToDelete, setHumanToDelete] = useState<DigitalHuman | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchDigitalHumans()
  }, [])

  // 自动轮询处理中的数字人状态
  useEffect(() => {
    const processingHumans = humans.filter(h => h.status === 'processing')

    if (processingHumans.length === 0) {
      return
    }

    // 每5秒检查一次状态
    const interval = setInterval(async () => {
      for (const human of processingHumans) {
        await checkStatus(human.id)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [humans])

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

  const checkStatus = async (digitalHumanId: string) => {
    try {
      const response = await fetch('/api/digital-human/check-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ digitalHumanId }),
      })

      const data = await response.json()

      // 如果状态已完成或失败，刷新列表
      if (data.status === 'completed' || data.status === 'failed') {
        await fetchDigitalHumans()
      }
    } catch (error) {
      console.error('Error checking status:', error)
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

  const handleDeleteClick = (human: DigitalHuman) => {
    setHumanToDelete(human)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!humanToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch('/api/digital-human/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ digitalHumanId: humanToDelete.id }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '删除失败')
      }

      toast.success('数字人已删除')
      await fetchDigitalHumans()
    } catch (error: any) {
      console.error('Error deleting digital human:', error)
      toast.error(error.message || '删除失败')
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setHumanToDelete(null)
    }
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
            <Card key={human.id} className="overflow-hidden relative">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{human.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {human.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(human.status)}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteClick(human)}
                      title="删除数字人"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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

                  {/* 显示生成的视频 */}
                  {human.status === 'completed' && human.result_url && (
                    <div className="mt-4">
                      <video
                        src={human.result_url}
                        controls
                        className="w-full rounded-lg"
                        poster={human.result_url.replace('.mp4', '_thumbnail.jpg')}
                      >
                        您的浏览器不支持视频播放
                      </video>
                      <a
                        href={human.result_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                      >
                        在新窗口打开视频
                      </a>
                    </div>
                  )}

                  {human.status === 'completed' && (
                    <Link href={`/digital-human/create-video?avatarId=${human.avatar_id}&name=${encodeURIComponent(human.name)}`}>
                      <Button className="w-full mt-4" size="sm">
                        <Sparkles className="w-4 h-4 mr-2" />
                        去创作
                      </Button>
                    </Link>
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

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除数字人？</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除数字人 "{humanToDelete?.name}" 吗？此操作无法撤销，将同时删除云端存储的所有相关数据。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  删除中...
                </>
              ) : (
                '确认删除'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
