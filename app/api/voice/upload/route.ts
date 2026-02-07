import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audio = formData.get('audio') as File
    const name = formData.get('name') as string
    const language = formData.get('language') as string

    if (!audio || !name || !language) {
      return NextResponse.json(
        { error: '缺少必填参数' },
        { status: 400 }
      )
    }

    // TODO: 实现音频文件上传到云存储（如 Supabase Storage）
    // 这里先返回一个模拟的URL
    const audioUrl = `https://example.com/voices/${Date.now()}-${audio.name}`

    return NextResponse.json({
      audioUrl,
      message: '音频上传成功'
    })

  } catch (error) {
    console.error('Audio upload error:', error)
    return NextResponse.json(
      { error: '音频上传失败' },
      { status: 500 }
    )
  }
}
