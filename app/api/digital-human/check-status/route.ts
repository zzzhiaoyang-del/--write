import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * 检查数字人创建状态
 * 已移除 D-ID 依赖，直接读取数据库状态
 * 数字人上传后直接标记为 completed（图片无需异步处理）
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { digitalHumanId } = await request.json()

    if (!digitalHumanId) {
      return NextResponse.json({ error: '缺少数字人ID' }, { status: 400 })
    }

    const { data: digitalHuman, error: fetchError } = await supabase
      .from('digital_humans')
      .select('status, video_url')
      .eq('id', digitalHumanId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !digitalHuman) {
      return NextResponse.json({ error: '数字人不存在' }, { status: 404 })
    }

    // 如果仍是 processing，自动标记为 completed（图片上传无需等待）
    if (digitalHuman.status === 'processing') {
      await supabase
        .from('digital_humans')
        .update({ status: 'completed' })
        .eq('id', digitalHumanId)

      return NextResponse.json({ status: 'completed' })
    }

    return NextResponse.json({ status: digitalHuman.status })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '服务器错误' }, { status: 500 })
  }
}
