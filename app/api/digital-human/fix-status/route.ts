import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 临时 API：修复所有"处理中"的记录为"已完成"
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 验证用户登录
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 更新所有该用户的 processing 状态为 completed
    const { data, error } = await supabase
      .from('digital_humans')
      .update({ status: 'completed' })
      .eq('user_id', user.id)
      .eq('status', 'processing')
      .select()

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json({ error: '更新失败' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      updated: data?.length || 0,
      message: `已修复 ${data?.length || 0} 个数字人状态`,
    })

  } catch (error) {
    console.error('Fix status error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
