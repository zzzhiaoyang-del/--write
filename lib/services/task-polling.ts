import { createClient } from '@/lib/supabase/server'
import { downloadAndUploadVideo } from './video-storage'
import { getDIDTaskStatus, convertDIDStatusToDBStatus } from './did.service'

/**
 * D-ID 数字人任务轮询服务
 * 负责后台轮询 D-ID 任务状态并更新数据库
 */

/**
 * 轮询单个任务的状态
 * @param workId 数据库中的作品ID
 * @param taskId D-ID 任务ID
 * @param maxAttempts 最大轮询次数（默认120次，即10分钟）
 * @param interval 轮询间隔（毫秒，默认5秒，D-ID生成速度较快可缩短至3秒）
 */
export async function pollTaskStatus(
  workId: string,
  taskId: string,
  maxAttempts: number = 120,
  interval: number = 3000
): Promise<void> {
  const supabase = await createClient()
  let attempts = 0

  console.log(`开始轮询任务 ${taskId}，作品ID: ${workId}`)

  const poll = async (): Promise<void> => {
    try {
      attempts++

      // 查询 D-ID 任务状态
      const didStatus = await getDIDTaskStatus(taskId, 'talks')

      console.log(`轮询第 ${attempts} 次，任务 ${taskId} 状态: ${didStatus.status}`)

      // 转换 D-ID 状态为数据库状态
      const dbStatus = convertDIDStatusToDBStatus(didStatus.status)

      // 处理中，继续轮询
      if (dbStatus === 'processing') {
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
      if (dbStatus === 'completed' && didStatus.result_url) {
        console.log(`任务 ${taskId} 生成成功，开始下载和上传视频`)

        try {
          // 下载 D-ID 视频并上传到 Supabase
          const supabaseVideoUrl = await downloadAndUploadVideo(
            didStatus.result_url,
            taskId
          )

          // 处理 duration 值，确保是有效的数字
          let validDuration: number | null = null
          if (didStatus.duration !== undefined && didStatus.duration !== null) {
            const durationNum = typeof didStatus.duration === 'number'
              ? didStatus.duration
              : parseFloat(String(didStatus.duration))

            if (!isNaN(durationNum) && isFinite(durationNum)) {
              validDuration = Math.round(durationNum)
            }
          }

          // 更新数据库
          await supabase
            .from('video_works')
            .update({
              status: 'completed',
              video_url: supabaseVideoUrl,
              duration: validDuration,
              updated_at: new Date().toISOString(),
            })
            .eq('id', workId)

          console.log(`任务 ${taskId} 完成，视频已保存到 Supabase`)
        } catch (uploadError: any) {
          console.error(`任务 ${taskId} 视频上传失败:`, uploadError)

          // 处理 duration 值（如果之前没有定义）
          let validDuration: number | null = null
          if (didStatus.duration !== undefined && didStatus.duration !== null) {
            const durationNum = typeof didStatus.duration === 'number'
              ? didStatus.duration
              : parseFloat(String(didStatus.duration))

            if (!isNaN(durationNum) && isFinite(durationNum)) {
              validDuration = Math.round(durationNum)
            }
          }

          // 上传失败，保存 D-ID 原始URL
          await supabase
            .from('video_works')
            .update({
              status: 'completed',
              video_url: didStatus.result_url,
              duration: validDuration,
              updated_at: new Date().toISOString(),
            })
            .eq('id', workId)
        }
        return
      }

      // 失败
      if (dbStatus === 'failed') {
        await supabase
          .from('video_works')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', workId)

        console.error(`任务 ${taskId} 生成失败: ${didStatus.error?.description || '未知错误'}`)
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
