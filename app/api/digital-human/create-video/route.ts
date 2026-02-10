import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { startBackgroundPolling } from '@/lib/services/task-polling'
import { submitVideoGenerationTask } from '@/lib/services/did.service'

// D-ID 数字人视频生成 API
// 文档: https://docs.d-id.com/reference/talks

export async function POST(request: NextRequest) {
  try {
    console.log('=== 开始处理视频生成请求 ===')
    console.log('环境变量检查:')
    console.log('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '已设置' : '❌ 未设置')
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已设置' : '❌ 未设置')
    console.log('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '已设置' : '❌ 未设置')
    console.log('- D_ID_API_KEY:', process.env.D_ID_API_KEY ? '已设置' : '❌ 未设置')

    const supabase = await createClient()
    console.log('Supabase 客户端创建成功')

    // 检查用户认证
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { avatarId, text, voice = 'zh-CN-XiaoxiaoNeural', speed = 1.0, volume = 1.0, pitch = 1.0 } = body

    if (!avatarId || !text) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 验证文本长度
    if (text.length > 5000) {
      return NextResponse.json(
        { error: '文本内容不能超过5000字' },
        { status: 400 }
      )
    }

    // 检查是否配置了 D-ID API
    const hasDIDConfig = !!process.env.D_ID_API_KEY

    let taskId = ''
    let status = 'processing'

    if (hasDIDConfig) {
      // 调用 D-ID 数字人视频生成 API
      try {
        taskId = await submitVideoGenerationTask(text, avatarId, {
          voiceId: voice,
          speed,
          volume,
          pitch,
        })
        console.log('D-ID API 调用成功，任务ID:', taskId)
      } catch (error: any) {
        console.error('D-ID API 调用失败:', error)
        return NextResponse.json(
          { error: error.message || '视频生成失败' },
          { status: 500 }
        )
      }
    } else {
      // MVP 模式：使用模拟数据
      console.log('⚠️ 未配置 D-ID API，使用模拟数据')
      taskId = `mock_task_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`

      // 模拟：5秒后自动完成
      setTimeout(async () => {
        const { error: updateError } = await supabase
          .from('video_works')
          .update({
            status: 'completed',
            video_url: 'https://example.com/mock-video.mp4',
            duration: Math.ceil(text.length / 4),
          })
          .eq('task_id', taskId)

        if (updateError) {
          console.error('更新模拟数据失败:', updateError)
        }
      }, 5000)
    }

    // 保存到数据库
    const { data: work, error: dbError } = await supabase
      .from('video_works')
      .insert({
        user_id: user.id,
        avatar_id: avatarId,
        task_id: taskId,
        name: `作品_${new Date().toLocaleString('zh-CN')}`,
        text,
        voice,
        speed,
        volume,
        pitch,
        status,
      })
      .select()
      .single()

    if (dbError) {
      console.error('数据库错误:', dbError)
      return NextResponse.json(
        { error: '保存失败' },
        { status: 500 }
      )
    }

    // 如果配置了 D-ID API，启动后台轮询
    if (hasDIDConfig && work.id) {
      startBackgroundPolling(work.id, taskId)
      console.log(`已启动后台轮询: 作品ID ${work.id}, 任务ID ${taskId}`)
    }

    return NextResponse.json({
      success: true,
      work,
      taskId,
    })
  } catch (error: any) {
    console.error('创建视频失败:', error)
    return NextResponse.json(
      { error: error.message || '服务器错误' },
      { status: 500 }
    )
  }
}
