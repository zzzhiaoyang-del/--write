import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 检查数字人创建状态（轮询D-ID API）
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 验证用户登录
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { digitalHumanId } = await request.json()

    if (!digitalHumanId) {
      return NextResponse.json({ error: '缺少数字人ID' }, { status: 400 })
    }

    // 从数据库获取数字人信息
    const { data: digitalHuman, error: fetchError } = await supabase
      .from('digital_humans')
      .select('*')
      .eq('id', digitalHumanId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !digitalHuman) {
      return NextResponse.json({ error: '数字人不存在' }, { status: 404 })
    }

    // 如果已经完成，直接返回
    if (digitalHuman.status === 'completed') {
      return NextResponse.json({
        status: 'completed',
        message: '数字人已完成',
      })
    }

    // 如果没有 did_talk_id，说明是模拟模式，直接标记为完成
    if (!digitalHuman.did_talk_id) {
      await supabase
        .from('digital_humans')
        .update({ status: 'completed' })
        .eq('id', digitalHumanId)

      return NextResponse.json({
        status: 'completed',
        message: '数字人已完成（模拟模式）',
      })
    }

    // 调用 D-ID API 检查状态
    if (!process.env.D_ID_API_KEY) {
      return NextResponse.json({ error: '未配置D-ID API Key' }, { status: 500 })
    }

    try {
      const didResponse = await fetch(
        `https://api.d-id.com/talks/${digitalHuman.did_talk_id}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${process.env.D_ID_API_KEY}`,
          },
        }
      )

      if (!didResponse.ok) {
        const errorText = await didResponse.text()
        console.error('D-ID API error:', errorText)
        return NextResponse.json({
          error: 'D-ID API调用失败',
          details: errorText
        }, { status: 500 })
      }

      const didData = await didResponse.json()
      console.log('D-ID status:', didData.status)

      // D-ID 状态: created, processing, done, error
      if (didData.status === 'done') {
        // 更新数据库状态为完成
        await supabase
          .from('digital_humans')
          .update({
            status: 'completed',
            result_url: didData.result_url, // 保存生成的视频URL
          })
          .eq('id', digitalHumanId)

        return NextResponse.json({
          status: 'completed',
          message: '数字人创建完成',
          resultUrl: didData.result_url,
        })
      } else if (didData.status === 'error') {
        // 更新数据库状态为失败
        await supabase
          .from('digital_humans')
          .update({ status: 'failed' })
          .eq('id', digitalHumanId)

        return NextResponse.json({
          status: 'failed',
          message: '数字人创建失败',
          error: didData.error,
        })
      } else {
        // 仍在处理中
        return NextResponse.json({
          status: 'processing',
          message: '数字人正在创建中...',
          progress: didData.status,
        })
      }
    } catch (error) {
      console.error('Check status error:', error)
      return NextResponse.json({
        error: '检查状态失败',
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Check status error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
