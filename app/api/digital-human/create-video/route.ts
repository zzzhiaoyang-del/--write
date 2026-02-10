import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 百度数字人视频生成 API
// 文档: https://cloud.baidu.com/doc/VCA/s/Hlwvz8wd6

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { avatarId, text, voice = 'female-1', speed = 1.0, volume = 1.0, pitch = 1.0 } = body

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

    // 检查是否配置了百度 API
    const hasBaiduConfig = process.env.BAIDU_API_KEY && process.env.BAIDU_SECRET_KEY

    let taskId = ''
    let status = 'processing'

    if (hasBaiduConfig) {
      // 调用百度数字人视频生成 API
      try {
        const result = await createBaiduDigitalHumanVideo({
          avatarId,
          text,
          voice,
          speed,
          volume,
          pitch,
        })
        taskId = result.taskId
      } catch (error: any) {
        console.error('百度 API 调用失败:', error)
        return NextResponse.json(
          { error: error.message || '视频生成失败' },
          { status: 500 }
        )
      }
    } else {
      // MVP 模式：使用模拟数据
      console.log('⚠️ 未配置百度 API，使用模拟数据')
      taskId = `mock_task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

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

// 百度数字人视频生成函数
async function createBaiduDigitalHumanVideo(params: {
  avatarId: string
  text: string
  voice: string
  speed: number
  volume: number
  pitch: number
}) {
  const { avatarId, text, voice, speed, volume, pitch } = params

  // 获取 Access Token
  const accessToken = await getBaiduAccessToken()

  // 调用百度数字人视频生成 API
  const response = await fetch(
    'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/digitalHuman/video/create',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        avatar_id: avatarId,
        text,
        voice_id: voice,
        speed,
        volume,
        pitch,
      }),
    }
  )

  const data = await response.json()

  if (!response.ok || data.error_code) {
    throw new Error(data.error_msg || '百度 API 调用失败')
  }

  return {
    taskId: data.task_id,
  }
}

// 获取百度 Access Token
async function getBaiduAccessToken(): Promise<string> {
  const apiKey = process.env.BAIDU_API_KEY
  const secretKey = process.env.BAIDU_SECRET_KEY

  if (!apiKey || !secretKey) {
    throw new Error('未配置百度 API 密钥')
  }

  const response = await fetch(
    `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`,
    {
      method: 'POST',
    }
  )

  const data = await response.json()

  if (!response.ok || data.error) {
    throw new Error(data.error_description || '获取 Access Token 失败')
  }

  return data.access_token
}
