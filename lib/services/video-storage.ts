import { createClient } from '@supabase/supabase-js'

/**
 * 视频存储服务
 * 负责下载百度视频并上传到 Supabase 存储
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// 使用 Service Role Key 以绕过 RLS
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

/**
 * 下载百度视频并上传到 Supabase 存储
 * @param baiduVideoUrl 百度视频URL
 * @param taskId 任务ID（用于文件命名）
 * @returns Supabase 存储的公开URL
 */
export async function downloadAndUploadVideo(
  baiduVideoUrl: string,
  taskId: string
): Promise<string> {
  try {
    console.log(`开始下载视频: ${baiduVideoUrl}`)

    // 1. 下载百度视频
    const response = await fetch(baiduVideoUrl)
    if (!response.ok) {
      throw new Error(`下载视频失败: ${response.statusText}`)
    }

    const videoBuffer = await response.arrayBuffer()
    const videoBlob = new Blob([videoBuffer], { type: 'video/mp4' })

    // 2. 生成文件名
    const fileName = `${taskId}_${Date.now()}.mp4`
    const filePath = `videos/${fileName}`

    console.log(`开始上传到 Supabase: ${filePath}`)

    // 3. 上传到 Supabase 存储桶
    const { error } = await supabaseAdmin.storage
      .from('avatar-videos')
      .upload(filePath, videoBlob, {
        contentType: 'video/mp4',
        upsert: false,
      })

    if (error) {
      throw new Error(`上传视频失败: ${error.message}`)
    }

    // 4. 获取公开URL
    const { data: urlData } = supabaseAdmin.storage
      .from('avatar-videos')
      .getPublicUrl(filePath)

    console.log(`视频上传成功: ${urlData.publicUrl}`)

    return urlData.publicUrl
  } catch (error: any) {
    console.error('下载和上传视频失败:', error)
    throw new Error(`视频处理失败: ${error.message}`)
  }
}

/**
 * 删除 Supabase 存储中的视频
 * @param videoUrl Supabase 视频URL
 */
export async function deleteVideo(videoUrl: string): Promise<void> {
  try {
    // 从URL中提取文件路径
    const url = new URL(videoUrl)
    const pathParts = url.pathname.split('/')
    const bucketIndex = pathParts.indexOf('avatar-videos')
    const filePath = pathParts.slice(bucketIndex + 1).join('/')

    const { error } = await supabaseAdmin.storage
      .from('avatar-videos')
      .remove([filePath])

    if (error) {
      throw new Error(`删除视频失败: ${error.message}`)
    }

    console.log(`视频删除成功: ${filePath}`)
  } catch (error: any) {
    console.error('删除视频失败:', error)
    throw error
  }
}

