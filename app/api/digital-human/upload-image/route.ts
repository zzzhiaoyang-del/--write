import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * 图片上传 API
 * 用于上传图片文件到存储服务（Supabase Storage）
 * 供图片克隆数字人功能使用
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
    const imageFile = formData.get('image') as File
    const name = formData.get('name') as string
    const model = formData.get('model') as string

    if (!imageFile || !name) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    // 验证是否为图片文件
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg']
    if (!validTypes.includes(imageFile.type)) {
      return NextResponse.json({ error: '只支持 png、jpg、jpeg 格式的图片' }, { status: 400 })
    }

    // 验证文件大小（10MB）
    const maxSize = 10 * 1024 * 1024
    if (imageFile.size > maxSize) {
      return NextResponse.json({ error: '图片文件不能超过 10MB' }, { status: 400 })
    }

    // 生成唯一文件名
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${user.id}/images/${Date.now()}.${fileExt}`

    // 上传到 Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('digital-human-videos')
      .upload(fileName, imageFile, {
        contentType: imageFile.type,
        cacheControl: '3600',
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: '图片上传失败' }, { status: 500 })
    }

    // 获取公开URL
    const { data: { publicUrl } } = supabase.storage
      .from('digital-human-videos')
      .getPublicUrl(fileName)

    return NextResponse.json({
      imageUrl: publicUrl,
      fileName,
      name,
      model,
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
