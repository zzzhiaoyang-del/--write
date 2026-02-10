import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * 删除数字人 API
 * 删除数字人记录及其关联的存储文件
 */

export async function DELETE(request: NextRequest) {
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

    // 1. 获取数字人信息
    const { data: digitalHuman, error: fetchError } = await supabase
      .from('digital_humans')
      .select('*')
      .eq('id', digitalHumanId)
      .eq('user_id', user.id) // 确保只能删除自己的数字人
      .single()

    if (fetchError || !digitalHuman) {
      return NextResponse.json({ error: '数字人不存在或无权限删除' }, { status: 404 })
    }

    // 2. 删除 Supabase Storage 中的文件（如果有）
    if (digitalHuman.video_url && digitalHuman.video_url.includes('supabase')) {
      try {
        // 从URL中提取文件路径
        const url = new URL(digitalHuman.video_url)
        const pathParts = url.pathname.split('/')
        const bucketIndex = pathParts.findIndex(part => part === 'storage')
        if (bucketIndex !== -1 && pathParts.length > bucketIndex + 3) {
          const bucketName = pathParts[bucketIndex + 2]
          const filePath = pathParts.slice(bucketIndex + 3).join('/')

          const { error: deleteFileError } = await supabase
            .storage
            .from(bucketName)
            .remove([filePath])

          if (deleteFileError) {
            console.error('删除存储文件失败:', deleteFileError)
            // 继续执行，不阻止删除记录
          }
        }
      } catch (error) {
        console.error('解析文件URL失败:', error)
        // 继续执行
      }
    }

    // 3. 删除数据库记录
    const { error: deleteError } = await supabase
      .from('digital_humans')
      .delete()
      .eq('id', digitalHumanId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('删除数据库记录失败:', deleteError)
      return NextResponse.json({ error: '删除失败' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '数字人已删除',
    })

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
