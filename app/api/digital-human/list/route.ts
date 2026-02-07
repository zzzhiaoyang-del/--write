import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 验证用户登录
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 查询用户的数字人列表
    const { data: humans, error: queryError } = await supabase
      .from('digital_humans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (queryError) {
      console.error('Query error:', queryError)
      return NextResponse.json({ error: '查询失败' }, { status: 500 })
    }

    return NextResponse.json({ humans })

  } catch (error) {
    console.error('List error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
