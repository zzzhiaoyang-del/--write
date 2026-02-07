import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    const name = formData.get('name') as string
    const category = formData.get('category') as string

    if (!videoFile || !name || !category) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    // 生成唯一文件名
    const fileExt = videoFile.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    // 上传到 Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
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
