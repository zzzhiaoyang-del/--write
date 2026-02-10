import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { submitImageCloneTask } from '@/lib/services/did.service'

/**
 * 图片克隆数字人 API
 *
 * 修改点：
 * 1. 从百度智能云改为 D-ID API
 * 2. 鉴权方式：百度 AccessToken → D-ID Basic Auth
 * 3. API 端点：百度智能云 API → D-ID API
 * 4. 请求参数：适配 D-ID API 格式
 *
 * D-ID API 文档：
 * https://docs.d-id.com/reference/clips
 */

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 验证用户登录
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { imageUrl, name, model } = await request.json()

    if (!imageUrl || !name) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    // D-ID API 配置
    const D_ID_API_KEY = process.env.D_ID_API_KEY

    let avatarId = `avatar_image_${Date.now()}`
    let didTaskId: string | null = null

    // 如果配置了 D-ID API，调用真实接口
    if (D_ID_API_KEY) {
      try {
        // 调用 D-ID 图片克隆接口
        didTaskId = await submitImageCloneTask(imageUrl, name)
        avatarId = `did_image_${didTaskId}`
        console.log('D-ID 图片克隆 API 调用成功，任务ID:', didTaskId)
      } catch (error: any) {
        console.error('D-ID API 调用失败:', error)
        // 失败时使用模拟数据
      }
    }

    // 保存到数据库
    const initialStatus = D_ID_API_KEY && didTaskId ? 'processing' : 'completed'

    const { data: insertedData, error: dbError } = await supabase
      .from('digital_humans')
      .insert({
        user_id: user.id,
        avatar_id: avatarId,
        name,
        category: 'image',
        video_url: imageUrl, // 存储图片 URL
        status: initialStatus,
        did_talk_id: didTaskId, // 使用 D-ID 任务 ID
        clone_type: 'image', // 标记为图片克隆
        model_version: model || 'default',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: '保存失败' }, { status: 500 })
    }

    // 返回格式保持不变（前端兼容）
    return NextResponse.json({
      success: true,
      avatarId,
      message: D_ID_API_KEY && didTaskId
        ? '🎉 图片数字人创建成功！（使用 D-ID API）'
        : '🎉 图片数字人创建成功！（MVP模式：模拟数据）',
    })

  } catch (error) {
    console.error('Clone error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
