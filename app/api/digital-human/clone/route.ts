import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * 数字人克隆（图片上传）API
 * 已移除 D-ID 依赖，直接将图片 URL 存入数据库并标记为 completed
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { imageUrl, name, category } = await request.json()

    if (!imageUrl || !name) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const avatarId = `avatar_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    const { error: dbError } = await supabase
      .from('digital_humans')
      .insert({
        user_id: user.id,
        avatar_id: avatarId,
        name,
        category: category || 'other',
        video_url: imageUrl, // 存储图片 URL（字段名沿用旧设计）
        status: 'completed',  // 图片上传即完成，无需异步处理
        created_at: new Date().toISOString(),
      })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: '保存失败' }, { status: 500 })
    }

    return NextResponse.json({ success: true, avatarId })
  } catch (error: any) {
    console.error('Clone error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
