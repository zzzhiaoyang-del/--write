/**
 * 视频生成服务 —— 适配器模式（Adapter Pattern）
 *
 * 所有上层业务代码只需调用 generateDigitalHuman()，
 * 底层切换到哪个 AI 服务商，上层完全无感知。
 *
 * 当前支持的 provider：
 *   - "liveportrait"：阿里云百炼 LivePortrait（默认）
 *
 * 预留扩展：
 *   - "sadtalker"：Replicate SadTalker
 *   - "seedance"：火山引擎 Seedance 2.0
 */

// ─── 类型定义 ────────────────────────────────────────────────────────────────

export interface GenerationResult {
  taskId: string
  status: string
}

export interface PollResult {
  status: 'processing' | 'completed' | 'failed'
  videoUrl?: string
  error?: string
}

// ─── 配置 ────────────────────────────────────────────────────────────────────

const DASHSCOPE_BASE = 'https://dashscope.aliyuncs.com/api/v1'
const DASHSCOPE_SUBMIT_URL = `${DASHSCOPE_BASE}/services/aigc/image2video/video-synthesis`
const DASHSCOPE_TASKS_URL = `${DASHSCOPE_BASE}/tasks`

const MODEL = 'liveportrait'

// ─── 主入口函数 ──────────────────────────────────────────────────────────────

export async function generateDigitalHuman(
  imageUrl: string,
  audioUrl: string,
  provider: string = 'liveportrait'
): Promise<GenerationResult> {
  if (provider === 'liveportrait') {
    return submitLivePortraitTask(imageUrl, audioUrl)
  }

  if (provider === 'sadtalker') {
    return submitSadTalkerTask(imageUrl, audioUrl)
  }

  throw new Error(`未知的 provider: ${provider}，当前支持 "liveportrait" 和 "sadtalker"`)
}

/**
 * 轮询任务状态（统一入口，前端通过 /api/status 调用）
 */
export async function pollTaskStatus(
  taskId: string,
  provider: string = 'liveportrait'
): Promise<PollResult> {
  if (provider === 'liveportrait') {
    return pollLivePortraitStatus(taskId)
  }

  if (provider === 'sadtalker') {
    return pollSadTalkerStatus(taskId)
  }

  throw new Error(`未知的 provider: ${provider}`)
}

// ─── 阿里云百炼 LivePortrait 实现 ────────────────────────────────────────────

async function submitLivePortraitTask(
  imageUrl: string,
  audioUrl: string
): Promise<GenerationResult> {
  const apiKey = process.env.ALIYUN_API_KEY
  if (!apiKey) {
    throw new Error('ALIYUN_API_KEY 未配置，请在环境变量中设置')
  }

  const response = await fetch(DASHSCOPE_SUBMIT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify({
      model: MODEL,
      input: {
        image_url: imageUrl,
        audio_url: audioUrl,
      },
      parameters: {
        expression_strength: 1.0,
      },
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    const msg = data?.message || data?.error?.message || JSON.stringify(data)
    throw new Error(`LivePortrait 提交失败 [${response.status}]: ${msg}`)
  }

  const taskId = data?.output?.task_id
  if (!taskId) {
    throw new Error(`LivePortrait 未返回 task_id: ${JSON.stringify(data)}`)
  }

  return {
    taskId,
    status: data?.output?.task_status || 'PENDING',
  }
}

async function pollLivePortraitStatus(taskId: string): Promise<PollResult> {
  const apiKey = process.env.ALIYUN_API_KEY
  if (!apiKey) {
    throw new Error('ALIYUN_API_KEY 未配置')
  }

  const response = await fetch(`${DASHSCOPE_TASKS_URL}/${taskId}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${apiKey}` },
  })

  const data = await response.json()

  if (!response.ok) {
    const msg = data?.message || JSON.stringify(data)
    throw new Error(`LivePortrait 状态查询失败 [${response.status}]: ${msg}`)
  }

  const taskStatus = data?.output?.task_status

  if (taskStatus === 'SUCCEEDED') {
    const output = data?.output || {}
    const results = data?.results || {}
    const videoUrl = results.video_url || output.video_url || output.video_url_list?.[0] || ''
    return { status: 'completed', videoUrl }
  }

  if (taskStatus === 'FAILED') {
    const msg = data?.output?.message || data?.output?.code || '视频生成失败'
    return { status: 'failed', error: msg }
  }

  if (taskStatus === 'CANCELED' || taskStatus === 'UNKNOWN') {
    return { status: 'failed', error: `任务异常: ${taskStatus}` }
  }

  return { status: 'processing' }
}

// ─── Replicate SadTalker 实现（备用）──────────────────────────────────────────

async function submitSadTalkerTask(
  imageUrl: string,
  audioUrl: string
): Promise<GenerationResult> {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN 未配置')
  }

  const Replicate = (await import('replicate')).default
  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

  const prediction = await replicate.predictions.create({
    version: 'a519cc0cfebaaeade068b23899165a11ec76aaa1d2b313d40d214f204ec957a3',
    input: {
      source_image: imageUrl,
      driven_audio: audioUrl,
      still_mode: true,
      use_enhancer: true,
      preprocess: 'crop',
      size_of_image: 256,
    },
  })

  return { taskId: prediction.id, status: prediction.status }
}

async function pollSadTalkerStatus(taskId: string): Promise<PollResult> {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN 未配置')
  }

  const Replicate = (await import('replicate')).default
  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })
  const prediction = await replicate.predictions.get(taskId)

  if (prediction.status === 'succeeded') {
    const videoUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output
    return { status: 'completed', videoUrl }
  }

  if (prediction.status === 'failed' || prediction.status === 'canceled') {
    const errMsg = typeof prediction.error === 'string' ? prediction.error : JSON.stringify(prediction.error) ?? '生成失败'
    return { status: 'failed', error: errMsg }
  }

  return { status: 'processing' }
}
