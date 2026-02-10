import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * 视频上传 API
 * 用于上传视频文件到存储服务（Supabase Storage）
 * 供视频克隆数字人功能使用
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 验证用户登录
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const formData = await request.formData()
    const videoFile = formData.get('video') as File

    if (!videoFile) {
      return NextResponse.json({ error: '缺少视频文件' }, { status: 400 })
    }

    // 验证是否为视频文件
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo']
    if (!validTypes.includes(videoFile.type)) {
      return NextResponse.json({ error: '只支持 mp4、mov 格式的视频' }, { status: 400 })
    }

    // 验证文件大小（500MB）
    const maxSize = 500 * 1024 * 1024
    if (videoFile.size > maxSize) {
      return NextResponse.json({ error: '视频文件不能超过 500MB' }, { status: 400 })
    }

    // 生成唯一文件名
    const fileExt = videoFile.name.split('.').pop()
    const fileName = `${user.id}/videos/${Date.now()}.${fileExt}`

    // 上传到 Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('digital-human-videos')
      .upload(fileName, videoFile, {
        contentType: videoFile.type,
        cacheControl: '3600',
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: '视频上传失败' }, { status: 500 })
    }

    // 获取公开URL
    const { data: { publicUrl } } = supabase.storage
      .from('digital-human-videos')
      .getPublicUrl(fileName)

    return NextResponse.json({
      videoUrl: publicUrl,
      fileName,
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
