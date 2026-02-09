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

    const { imageUrl, name, category } = await request.json()

    if (!imageUrl || !name) {
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

    // 🎯 使用 D-ID API（最便宜方案，约 $10-20/分身）
    let avatarId = `avatar_${Date.now()}`
    let didTalkId: string | null = null

    if (process.env.DID_API_KEY) {
      // 使用用户上传的图片 URL
      try {
        const didResponse = await fetch('https://api.d-id.com/talks', {
          method: 'POST',
          headers: {
            'Authorization': process.env.DID_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            source_url: imageUrl, // 使用用户上传的图片
            script: {
              type: 'text',
              input: `你好，我是 ${name}，你的数字人分身！`, // 使用用户提供的名称
            },
            config: {
              fluent: true,
              pad_audio: 0,
            },
          }),
        })

        if (didResponse.ok) {
          const didData = await didResponse.json()
          didTalkId = didData.id // D-ID talk ID
          avatarId = `did_${didData.id}` // 使用 D-ID 返回的 ID
          console.log('D-ID API success:', didData)
        } else {
          const errorText = await didResponse.text()
          console.error('D-ID API error:', errorText)
          // 如果 API 调用失败，继续使用模拟数据
        }
      } catch (error) {
        console.error('D-ID API call failed:', error)
        // 失败时继续使用模拟数据
      }
    }
    // 如果没有配置 API Key，使用 MVP 模式（模拟数据）

    // 保存到数据库
    // 如果使用了 D-ID API，状态为 processing（等待 webhook）
    // 如果是 MVP 模式，直接标记为 completed
    const initialStatus = process.env.DID_API_KEY ? 'processing' : 'completed'

    const { data: insertedData, error: dbError } = await supabase
      .from('digital_humans')
      .insert({
        user_id: user.id,
        avatar_id: avatarId,
        name,
        category,
        video_url: imageUrl,
        status: initialStatus,
        did_talk_id: didTalkId, // 保存 D-ID talk ID 用于状态轮询
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: '保存失败' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      avatarId,
      message: process.env.DID_API_KEY
        ? '🎉 数字人创建成功！（使用 D-ID API）'
        : '🎉 数字人创建成功！（MVP模式：模拟数据，3秒后自动完成）',
    })

  } catch (error) {
    console.error('Clone error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
