import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 检查用户是否已登录
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: '未登录，请先登录' },
        { status: 401 }
      )
    }

    // 获取查询参数
    const searchParams = request.nextUrl.searchParams
    const agentId = searchParams.get('agentId')
    const limit = parseInt(searchParams.get('limit') || '10')

    // 构建查询
    let query = supabase
      .from('agent_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    // 如果指定了 agentId，则只查询该 AI 员工的历史记录
    if (agentId) {
      query = query.eq('agent_id', agentId)
    }

    const { data, error } = await query

    if (error) {
      console.error('查询历史记录失败:', error)
      return NextResponse.json(
        { error: '查询历史记录失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({ history: data || [] })
  } catch (error) {
    console.error('服务器错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 检查用户是否已登录
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: '未登录，请先登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { agentId, formData, result } = body

    // 验证必需字段
    if (!agentId || !formData || !result) {
      return NextResponse.json(
        { error: '缺少必需字段' },
        { status: 400 }
      )
    }

    // 插入历史记录
    const { data, error } = await supabase
      .from('agent_history')
      .insert({
        user_id: user.id,
        agent_id: agentId,
        form_data: formData,
        result: result
      })
      .select()
      .single()

    if (error) {
      console.error('保存历史记录失败:', error)
      return NextResponse.json(
        { error: '保存历史记录失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('服务器错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 检查用户是否已登录
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: '未登录，请先登录' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: '缺少历史记录 ID' },
        { status: 400 }
      )
    }

    // 删除历史记录（RLS 会自动确保只能删除���己的记录）
    const { error } = await supabase
      .from('agent_history')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('删除历史记录失败:', error)
      return NextResponse.json(
        { error: '删除历史记录失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('服务器错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
