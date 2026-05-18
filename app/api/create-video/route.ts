import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateAudioFromText } from '@/lib/services/TTSService'
import { generateDigitalHuman } from '@/lib/services/VideoGenerationService'

/**
 * POST /api/create-video
 *
 * 完整的"文字 → 视频"流程：
 *   1. 校验文字长度（≤200字）
 *   2. 调用 TTSService 将文字转为音频，上传到 Supabase
 *   3. 调用 VideoGenerationService 提交视频生成任务（阿里云百炼 LivePortrait）
 *   4. 将任务记录写入 video_works 表
 *   5. 返回 taskId 给前端，前端轮询 /api/status
 *
 * 请求体：
 *   { imageUrl: string, text: string, voiceType: string, avatarId?: string }
 *
 * 响应：
 *   { taskId: string, workId: string }
 */
export async function POST(request: NextRequest) {
  // ── 第一道防线：文字长度校验 ─────────────────────────────────────────────
  let body: { imageUrl?: string; text?: string; voiceType?: string; avatarId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '请求体格式错误' }, { status: 400 })
  }

  const { imageUrl, text, voiceType = 'female-1', avatarId } = body

  if (!imageUrl || !text) {
    return NextResponse.json({ error: '缺少必要参数：imageUrl 和 text' }, { status: 400 })
  }

  if (text.length > 200) {
    return NextResponse.json(
      { error: `文字不能超过 200 字，当前 ${text.length} 字` },
      { status: 400 }
    )
  }

  // ── 用户认证 ──────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: '未登录，请先登录' }, { status: 401 })
  }

  // ── 第一步：TTS 文字转音频 ─────────────────────────────────────────────────
  let audioUrl: string
  try {
    audioUrl = await generateAudioFromText(text, voiceType)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'TTS 转换失败'
    console.error('[create-video] TTS 失败:', msg)
    return NextResponse.json({ error: `语音合成失败：${msg}` }, { status: 500 })
  }

  // ── 第二步：提交视频生成任务 ───────────────────────────────────────────────
  let taskId: string
  try {
    const result = await generateDigitalHuman(imageUrl, audioUrl, 'liveportrait')
    taskId = result.taskId
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '视频生成任务提交失败'
    console.error('[create-video] 视频生成失败:', msg)
    return NextResponse.json({ error: `视频生成失败：${msg}` }, { status: 500 })
  }

  // ── 第三步：写入数据库，记录任务 ──────────────────────────────────────────
  const { data: work, error: dbError } = await supabase
    .from('video_works')
    .insert({
      user_id: user.id,
      avatar_id: avatarId ?? null,
      task_id: taskId,
      name: `作品_${new Date().toLocaleString('zh-CN')}`,
      text,
      voice: voiceType,
      status: 'processing',
    })
    .select('id')
    .single()

  if (dbError) {
    console.error('[create-video] 数据库写入失败:', dbError)
    return NextResponse.json({ taskId, workId: null })
  }

  return NextResponse.json({ taskId, workId: work.id })
}
