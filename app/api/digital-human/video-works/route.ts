import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 检查用户认证
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const avatarId = searchParams.get('avatarId')

    if (!avatarId) {
      return NextResponse.json(
        { error: '缺少 avatarId 参数' },
        { status: 400 }
      )
    }

    // 查询该数字人的所有视频作品
    const { data: works, error: dbError } = await supabase
      .from('video_works')
      .select('*')
      .eq('user_id', user.id)
      .eq('avatar_id', avatarId)
      .order('created_at', { ascending: false })

    if (dbError) {
      console.error('数据库错误:', dbError)
      return NextResponse.json(
        { error: '查询失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      works: works || [],
    })
  } catch (error: any) {
    console.error('获取作品列表失败:', error)
    return NextResponse.json(
      { error: error.message || '服务器错误' },
      { status: 500 }
    )
  }
}
