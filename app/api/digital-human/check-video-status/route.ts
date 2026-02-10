import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    const { workId } = body

    if (!workId) {
      return NextResponse.json(
        { error: '缺少 workId 参数' },
        { status: 400 }
      )
    }

    // 查询作品信息
    const { data: work, error: queryError } = await supabase
      .from('video_works')
      .select('*')
      .eq('id', workId)
      .eq('user_id', user.id)
      .single()

    if (queryError || !work) {
      return NextResponse.json(
        { error: '作品不存在' },
        { status: 404 }
      )
    }

    // 如果已经完成或失败，直接返回
    if (work.status === 'completed' || work.status === 'failed') {
      return NextResponse.json({
        status: work.status,
        video_url: work.video_url,
        duration: work.duration,
      })
    }

    // 检查是否配置了百度 API
    const hasBaiduConfig = process.env.BAIDU_API_KEY && process.env.BAIDU_SECRET_KEY

    if (hasBaiduConfig) {
      // 调用百度 API 查询任务状态
      try {
        const result = await checkBaiduVideoStatus(work.task_id)

        // 更新数据库
        const { error: updateError } = await supabase
          .from('video_works')
          .update({
            status: result.status,
            video_url: result.video_url,
            duration: result.duration,
          })
          .eq('id', workId)

        if (updateError) {
          console.error('更新状态失败:', updateError)
        }

        return NextResponse.json({
          status: result.status,
          video_url: result.video_url,
          duration: result.duration,
        })
      } catch (error: any) {
        console.error('查询百度任务状态失败:', error)
        return NextResponse.json(
          { error: error.message || '查询失败' },
          { status: 500 }
        )
      }
    } else {
      // MVP 模式：返回当前状态
      return NextResponse.json({
        status: work.status,
        video_url: work.video_url,
        duration: work.duration,
      })
    }
  } catch (error: any) {
    console.error('检查视频状态失败:', error)
    return NextResponse.json(
      { error: error.message || '服务器错误' },
      { status: 500 }
    )
  }
}

// 查询百度数字人视频生成状态
async function checkBaiduVideoStatus(taskId: string) {
  // 获取 Access Token
  const accessToken = await getBaiduAccessToken()

  // 调用百度 API 查询任务状态
  const response = await fetch(
    `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/digitalHuman/video/query?access_token=${accessToken}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task_id: taskId,
      }),
    }
  )

  const data = await response.json()

  if (!response.ok || data.error_code) {
    throw new Error(data.error_msg || '查询任务状态失败')
  }

  // 百度 API 返回的状态：
  // 0: 处理中
  // 1: 成功
  // 2: 失败
  let status: 'processing' | 'completed' | 'failed' = 'processing'
  if (data.status === 1) {
    status = 'completed'
  } else if (data.status === 2) {
    status = 'failed'
  }

  return {
    status,
    video_url: data.video_url || null,
    duration: data.duration || null,
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
