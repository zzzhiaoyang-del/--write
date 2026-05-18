import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * 检查视频生成状态 API（已迁移至适配器模式）
 * 新的状态查询请使用 /api/status?predictionId=xxx
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const body = await request.json()
    const { workId } = body

    if (!workId) {
      return NextResponse.json({ error: '缺少 workId 参数' }, { status: 400 })
    }

    // 直接从数据库读取状态（不再调用 D-ID）
    const { data: work, error: queryError } = await supabase
      .from('video_works')
      .select('status, video_url, duration')
      .eq('id', workId)
      .eq('user_id', user.id)
      .single()

    if (queryError || !work) {
      return NextResponse.json({ error: '作品不存在' }, { status: 404 })
    }

    return NextResponse.json({
      status: work.status,
      video_url: work.video_url,
      duration: work.duration,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '服务器错误' }, { status: 500 })
  }
}
