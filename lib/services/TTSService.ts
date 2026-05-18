import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'
import { createClient } from '@supabase/supabase-js'

/**
 * TTS（文字转语音）服务 —— 基于 Edge TTS（零成本）
 *
 * 将用户输入的口播文字转换为音频，上传到 Supabase Storage，返回公开 URL。
 *
 * 流程：用户文字 → [Edge TTS] → 音频 Buffer → [Supabase Storage] → 公开 URL
 */

// ─── 音色映射 ─────────────────────────────────────────────────────────────────

/**
 * 前端音色选项 → 微软 Edge TTS 中文音色
 * 全部免费，无 API 费用
 */
const VOICE_MAP: Record<string, string> = {
  'female-1': 'zh-CN-XiaoxiaoNeural',    // 播音-女声：清晰标准
  'male-1': 'zh-CN-YunxiNeural',         // 播音-男声：年轻活力
  'female-sweet': 'zh-CN-XiaoyiNeural',  // 甜美女声：温柔细腻
  'male-magnetic': 'zh-CN-YunjianNeural', // 磁性男声：沉稳有力
}

// ─── 主函数 ───────────────────────────────────────────────────────────────────

/**
 * 将文字转换为语音，上传到 Supabase，返回公开 URL
 */
export async function generateAudioFromText(
  text: string,
  voiceType: string
): Promise<string> {
  // 1. 映射音色，未知音色回退到 XiaoxiaoNeural
  const voice = VOICE_MAP[voiceType] ?? 'zh-CN-XiaoxiaoNeural'

  // 2. 调用 Edge TTS 生成音频 Buffer
  const audioBuffer = await textToSpeech(text, voice)

  // 3. 上传到 Supabase Storage 并返回公开 URL
  return uploadAudioToSupabase(audioBuffer)
}

// ─── 内部函数 ─────────────────────────────────────────────────────────────────

/**
 * 使用 Edge TTS 将文字转为 MP3 音频 Buffer
 */
async function textToSpeech(text: string, voice: string): Promise<Buffer> {
  const tts = new MsEdgeTTS()

  try {
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3)

    const { audioStream } = tts.toStream(text)

    const chunks: Buffer[] = []
    await new Promise<void>((resolve, reject) => {
      audioStream.on('data', (chunk: Buffer) => chunks.push(chunk))
      audioStream.on('end', resolve)
      audioStream.on('error', reject)
    })

    const buffer = Buffer.concat(chunks)
    if (buffer.length === 0) {
      throw new Error('Edge TTS 生成的音频为空')
    }

    return buffer
  } finally {
    tts.close()
  }
}

/**
 * 将音频 Buffer 上传到 Supabase Storage 的 digital-human-audios bucket
 * 使用 SERVICE_ROLE_KEY 绕过 RLS
 */
async function uploadAudioToSupabase(audioBuffer: Buffer): Promise<string> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase 环境变量未完整配置（需要 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY）')
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const fileName = `tts/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.mp3`

  const { error } = await supabase.storage
    .from('digital-human-audios')
    .upload(fileName, audioBuffer, {
      contentType: 'audio/mpeg',
      upsert: false,
    })

  if (error) {
    throw new Error(`音频上传到 Supabase 失败: ${error.message}`)
  }

  const { data } = supabase.storage
    .from('digital-human-audios')
    .getPublicUrl(fileName)

  return data.publicUrl
}
