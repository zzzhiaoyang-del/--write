import { createClient } from '@/lib/supabase/server'
import { downloadAndUploadVideo } from './video-storage'

/**
 * 百度数字人任务轮询服务
 * 负责后台轮询百度任务状态并更新数据库
 */

interface BaiduTaskStatus {
  status: 0 | 1 | 2  // 0: 处理中, 1: 成功, 2: 失败
  video_url?: string
  duration?: number
  error_msg?: string
}

/**
 * 获取百度 Access Token
 */
async function getBaiduAccessToken(): Promise<string> {
  const apiKey = process.env.BAIDU_API_KEY
  const secretKey = process.env.BAIDU_SECRET_KEY

  if (!apiKey || !secretKey) {
    throw new Error('未配置百度 API 密钥')
  }

  const response = await fetch(
    `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`,
    { method: 'POST' }
  )

  const data = await response.json()

  if (!response.ok || data.error) {
    throw new Error(data.error_description || '获取 Access Token 失败')
  }

  return data.access_token
}

/**
 * 查询百度任务状态
 */
async function queryBaiduTaskStatus(taskId: string): Promise<BaiduTaskStatus> {
  const accessToken = await getBaiduAccessToken()

  const response = await fetch(
    `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/digitalHuman/video/query?access_token=${accessToken}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: taskId }),
    }
  )

  const data = await response.json()

  if (!response.ok || data.error_code) {
    throw new Error(data.error_msg || '查询任务状态失败')
  }

  return data
}

/**
 * 轮询单个任务的状态
 * @param workId 数据库中的作品ID
 * @param taskId 百度任务ID
 * @param maxAttempts 最大轮询次数（默认120次，即10分钟）
 * @param interval 轮询间隔（毫秒，默认5秒）
 */
export async function pollTaskStatus(
  workId: string,
  taskId: string,
  maxAttempts: number = 120,
  interval: number = 5000
): Promise<void> {
  const supabase = await createClient()
  let attempts = 0

  console.log(`开始轮询任务 ${taskId}，作品ID: ${workId}`)

  const poll = async (): Promise<void> => {
    try {
      attempts++

      // 查询百度任务状态
      const baiduStatus = await queryBaiduTaskStatus(taskId)

      console.log(`轮询第 ${attempts} 次，任务 ${taskId} 状态: ${baiduStatus.status}`)

      // 处理中，继续轮询
      if (baiduStatus.status === 0) {
        if (attempts < maxAttempts) {
          setTimeout(poll, interval)
        } else {
          // 超时
          await supabase
            .from('video_works')
            .update({
              status: 'failed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', workId)

          console.error(`任务 ${taskId} 轮询超时`)
        }
        return
      }

      // 成功
      if (baiduStatus.status === 1 && baiduStatus.video_url) {
        console.log(`任务 ${taskId} 生成成功，开始下载和上传视频`)

        try {
          // 下载百度视频并上传到 Supabase
          const supabaseVideoUrl = await downloadAndUploadVideo(
            baiduStatus.video_url,
            taskId
          )

          // 更新数据库
          await supabase
            .from('video_works')
            .update({
              status: 'completed',
              video_url: supabaseVideoUrl,
              duration: baiduStatus.duration || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', workId)

          console.log(`任务 ${taskId} 完成，视频已保存到 Supabase`)
        } catch (uploadError: any) {
          console.error(`任务 ${taskId} 视频上传失败:`, uploadError)

          // 上传失败，保存百度原始URL
          await supabase
            .from('video_works')
            .update({
              status: 'completed',
              video_url: baiduStatus.video_url,
              duration: baiduStatus.duration || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', workId)
        }
        return
      }

      // 失败
      if (baiduStatus.status === 2) {
        await supabase
          .from('video_works')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', workId)

        console.error(`任务 ${taskId} 生成失败: ${baiduStatus.error_msg}`)
        return
      }
    } catch (error: any) {
      console.error(`轮询任务 ${taskId} 时出错:`, error)

      // 如果还有重试次数，继续轮询
      if (attempts < maxAttempts) {
        setTimeout(poll, interval)
      } else {
        // 标记为失败
        await supabase
          .from('video_works')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', workId)
      }
    }
  }

  // 开始轮询
  setTimeout(poll, interval)
}

/**
 * 启动后台轮询（在任务创建后调用）
 */
export function startBackgroundPolling(workId: string, taskId: string): void {
  // 使用 setImmediate 或 setTimeout 确保不阻塞主线程
  setImmediate(() => {
    pollTaskStatus(workId, taskId).catch((error) => {
      console.error(`后台轮询任务 ${taskId} 失败:`, error)
    })
  })

  console.log(`已启动后台轮询: 作品ID ${workId}, 任务ID ${taskId}`)
}
