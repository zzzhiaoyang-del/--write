import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDIDTaskStatus, convertDIDStatusToDBStatus } from '@/lib/services/did.service'

/**
 * 检查视频生成状态 API
 * 从百度云API迁移到D-ID API
 */

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

    // 检查是否配置了 D-ID API
    const hasDIDConfig = !!process.env.D_ID_API_KEY

    if (hasDIDConfig && work.task_id) {
      // 调用 D-ID API 查询任务状态
      try {
        console.log(`查询 D-ID 任务状态: ${work.task_id}`)
        const didStatus = await getDIDTaskStatus(work.task_id, 'talks')
        console.log(`D-ID 任务状态响应:`, didStatus)
        const dbStatus = convertDIDStatusToDBStatus(didStatus.status)
        console.log(`转换后的数据库状态: ${dbStatus}`)

        // 更新数据库
        const updateData: any = {
          status: dbStatus,
        }

        if (didStatus.result_url) {
          updateData.video_url = didStatus.result_url
        }

        if (didStatus.duration) {
          updateData.duration = didStatus.duration
        }

        const { error: updateError } = await supabase
          .from('video_works')
          .update(updateData)
          .eq('id', workId)

        if (updateError) {
          console.error('更新状态失败:', updateError)
        }

        return NextResponse.json({
          status: dbStatus,
          video_url: didStatus.result_url,
          duration: didStatus.duration,
        })
      } catch (error: any) {
        console.error('查询 D-ID 任务状态失败:', error)
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
