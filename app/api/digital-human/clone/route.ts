import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 示例：使用 HeyGen API
// 你需要在 .env.local 添加: HEYGEN_API_KEY=your_api_key_here

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 验证用户登录
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { videoUrl, name, category } = await request.json()

    if (!videoUrl || !name) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    // 方案1: 使用 HeyGen API (推荐)
    // const heygenResponse = await fetch('https://api.heygen.com/v1/avatar.create', {
    //   method: 'POST',
    //   headers: {
    //     'X-Api-Key': process.env.HEYGEN_API_KEY!,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     video_url: videoUrl,
    //     avatar_name: name,
    //   }),
    // })
    //
    // const heygenData = await heygenResponse.json()
    // const avatarId = heygenData.data.avatar_id

    // 方案2: 使用 D-ID API
    // const didResponse = await fetch('https://api.d-id.com/clips', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Basic ${process.env.DID_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     presenter_id: 'custom',
    //     driver_url: videoUrl,
    //   }),
    // })

    // 🚀 MVP模式：模拟数字人创建（不调用真实API，快速测试）
    const avatarId = `avatar_${Date.now()}`

    // 保存到数据库
    const { data: insertedData, error: dbError } = await supabase
      .from('digital_humans')
      .insert({
        user_id: user.id,
        avatar_id: avatarId,
        name,
        category,
        video_url: videoUrl,
        status: 'processing', // processing, completed, failed
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: '保存失败' }, { status: 500 })
    }

    // 🎯 MVP模式：3秒后自动标记为"已完成"（模拟真实处理）
    // 生产环境应该通过webhook回调更新状态
    setTimeout(async () => {
      const supabaseUpdate = await createClient()
      await supabaseUpdate
        .from('digital_humans')
        .update({ status: 'completed' })
        .eq('id', insertedData.id)
    }, 3000)

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: '保存失败' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      avatarId,
      message: '🎉 数字人创建成功！（MVP模式：模拟数据，3秒后自动完成）',
    })

  } catch (error) {
    console.error('Clone error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
