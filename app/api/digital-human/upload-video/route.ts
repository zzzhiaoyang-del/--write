import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * 视频上传 API
 * 用于上传视频文件到存储服务（Supabase Storage）
 * 供视频克隆数字人功能使用
 */
export async function POST(request: NextRequest) {
  try {
    console.log('=== 开始视频上传 ===')
    const supabase = await createClient()

    // 验证用户登录
    console.log('检查用户登录状态...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('认证错误:', authError)
      return NextResponse.json({
        error: '认证失败',
        details: authError.message
      }, { status: 401 })
    }

    if (!user) {
      console.error('用户未登录')
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    console.log('用户已登录:', user.id)

    const formData = await request.formData()
    const videoFile = formData.get('video') as File

    if (!videoFile) {
      console.error('缺少视频文件')
      return NextResponse.json({ error: '缺少视频文件' }, { status: 400 })
    }

    console.log('视频文件信息:', {
      name: videoFile.name,
      type: videoFile.type,
      size: `${(videoFile.size / (1024 * 1024)).toFixed(2)} MB`
    })

    // 验证是否为视频文件
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo']
    if (!validTypes.includes(videoFile.type)) {
      console.error('不支持的视频格式:', videoFile.type)
      return NextResponse.json({ error: '只支持 mp4、mov 格式的视频' }, { status: 400 })
    }

    // 验证文件大小（500MB）
    const maxSize = 500 * 1024 * 1024
    if (videoFile.size > maxSize) {
      console.error('视频文件过大:', videoFile.size)
      return NextResponse.json({ error: '视频文件不能超过 500MB' }, { status: 400 })
    }

    // 生成唯一文件名
    const fileExt = videoFile.name.split('.').pop()
    const fileName = `${user.id}/videos/${Date.now()}.${fileExt}`
    console.log('生成文件名:', fileName)

    // 上传到 Supabase Storage
    console.log('开始上传到 Supabase Storage...')
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('digital-human-videos')
      .upload(fileName, videoFile, {
        contentType: videoFile.type,
        cacheControl: '3600',
      })

    if (uploadError) {
      console.error('Supabase 上传错误:', {
        message: uploadError.message,
        statusCode: uploadError.statusCode,
        error: uploadError
      })
      return NextResponse.json({
        error: '视频上传失败',
        details: uploadError.message,
        code: uploadError.statusCode
      }, { status: 500 })
    }

    console.log('上传成功:', uploadData)

    // 获取公开URL
    const { data: { publicUrl } } = supabase.storage
      .from('digital-human-videos')
      .getPublicUrl(fileName)

    console.log('生成公开URL:', publicUrl)
    console.log('=== 视频上传完成 ===')

    return NextResponse.json({
      videoUrl: publicUrl,
      fileName,
    })

  } catch (error) {
    console.error('服务器错误:', error)
    return NextResponse.json({
      error: '服务器错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}
