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

    // 查询数字人信息，获取 presenter_id 或 video_url
    const { data: digitalHuman, error: queryError } = await supabase
      .from('digital_humans')
      .select('id, presenter_id, video_url')
      .eq('avatar_id', avatarId)
      .single()

    if (queryError || !digitalHuman) {
      console.error('查询数字人失败:', queryError)
      return NextResponse.json(
        { error: '数字人不存在' },
        { status: 404 }
      )
    }

    // 确定使用哪个ID/URL传给 D-ID API
    // 优先使用 presenter_id，其次使用 video_url（图片克隆时存储的是图片URL）
    const presenterIdOrUrl = digitalHuman.presenter_id || digitalHuman.video_url

    if (!presenterIdOrUrl) {
      return NextResponse.json(
        { error: '数字人缺少必要的图片或视频信息' },
        { status: 400 }
      )
    }

    // 检查是否是视频文件（D-ID talks API 只接受图片）
    const isVideoFile = /\.(mp4|mov|avi|webm)$/i.test(presenterIdOrUrl)
    if (isVideoFile && !digitalHuman.presenter_id) {
      console.error('检测到视频文件，但没有 presenter_id:', presenterIdOrUrl)
      return NextResponse.json(
        { error: '该数字人是从视频克隆的，暂时无法用于创作视频。请使用图片克隆的数字人，或等待视频克隆功能完善。' },
        { status: 400 }
      )
    }

    console.log('使用的 presenter ID/URL:', presenterIdOrUrl)

    // 检查是否配置了 D-ID API
    const hasDIDConfig = !!process.env.D_ID_API_KEY

    let taskId = ''
    let status = 'processing'

    if (hasDIDConfig) {
      // 调用 D-ID 数字人视频生成 API
      try {
        taskId = await submitVideoGenerationTask(text, presenterIdOrUrl, {
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
