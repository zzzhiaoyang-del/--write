/**
 * D-ID API 服务封装层
 * 替代百度云API，用于数字人克隆和视频生成
 */

// D-ID API 配置
const D_ID_CONFIG = {
  apiKey: process.env.D_ID_API_KEY || '',
  baseUrl: process.env.D_ID_BASE_URL || 'https://api.d-id.com',
}

// D-ID API 端点
const D_ID_ENDPOINTS = {
  clips: `${D_ID_CONFIG.baseUrl}/clips`,
  talks: `${D_ID_CONFIG.baseUrl}/talks`,
  agents: `${D_ID_CONFIG.baseUrl}/agents`,
}

/**
 * D-ID 任务状态类型
 */
export type DIDTaskStatus = 'created' | 'started' | 'done' | 'error' | 'rejected'

/**
 * D-ID 任务响应接口
 */
export interface DIDTaskResponse {
  id: string
  status: DIDTaskStatus
  result_url?: string
  duration?: number
  error?: {
    kind: string
    description: string
  }
}

/**
 * 获取 D-ID 认证头
 */
function getAuthHeaders(): HeadersInit {
  if (!D_ID_CONFIG.apiKey) {
    throw new Error('D-ID API Key 未配置，请在环境变量中设置 D_ID_API_KEY')
  }

  // D-ID API Key 格式：email:api_key
  // 需要进行 Base64 编码
  const base64Credentials = Buffer.from(D_ID_CONFIG.apiKey).toString('base64')

  return {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${base64Credentials}`,
    'Accept': 'application/json',
  }
}

/**
 * 提交 D-ID 图片克隆任务
 * @param imageUrl 图片URL（需要是公开可访问的URL）
 * @param name 数字人名称
 */
export async function submitImageCloneTask(
  imageUrl: string,
  name?: string
): Promise<string> {
  try {
    const response = await fetch(D_ID_ENDPOINTS.clips, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        source_url: imageUrl, // D-ID clips API 使用 source_url 参数
        script: {
          type: 'text',
          input: 'Hello', // 默认文本，用于测试
          provider: {
            type: 'microsoft',
            voice_id: 'zh-CN-XiaoxiaoNeural',
          },
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('D-ID API 错误响应:', errorData)
      throw new Error(
        `D-ID 图片克隆失败: ${errorData.error?.description || response.statusText}`
      )
    }

    const data: DIDTaskResponse = await response.json()
    console.log('D-ID 图片克隆响应:', data)
    return data.id
  } catch (error: any) {
    console.error('提交 D-ID 图片克隆任务失败:', error)
    throw new Error(`提交 D-ID 图片克隆任务失败: ${error.message}`)
  }
}

/**
 * 提交 D-ID 视频克隆任务
 * @param videoUrl 视频URL（需要是公开可访问的URL）
 * @param name 数字人名称
 */
export async function submitVideoCloneTask(
  videoUrl: string,
  name?: string
): Promise<string> {
  try {
    // D-ID 的视频克隆需要先创建 agent
    const response = await fetch(D_ID_ENDPOINTS.agents, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        presenter: {
          type: 'clip',
          source_url: videoUrl,
        },
        name: name || 'Video Clone',
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        `D-ID 视频克隆失败: ${errorData.error?.description || response.statusText}`
      )
    }

    const data = await response.json()
    return data.id
  } catch (error: any) {
    console.error('提交 D-ID 视频克隆任务失败:', error)
    throw new Error(`提交 D-ID 视频克隆任务失败: ${error.message}`)
  }
}

/**
 * 提交 D-ID 数字人视频生成任务
 * @param text 口播文本
 * @param presenterId D-ID 数字人ID或图片URL
 * @param voiceId 语音ID（可选）
 * @param speed 语速（可选，0.5-2.0）
 * @param volume 音量（可选，0-100）
 * @param pitch 音调（可选，-20到20）
 */
export async function submitVideoGenerationTask(
  text: string,
  presenterId: string,
  options?: {
    voiceId?: string
    speed?: number
    volume?: number
    pitch?: number
  }
): Promise<string> {
  try {
    const requestBody: any = {
      script: {
        type: 'text',
        input: text,
        ssml: false,
        provider: {
          type: 'microsoft',
          voice_id: options?.voiceId || 'zh-CN-XiaoxiaoNeural',
        },
      },
      config: {
        fluent: true,
        pad_audio: 0,
        align_av: true,
        stitch: true,
      },
    }

    // 如果 presenterId 是 URL，直接使用
    if (presenterId.startsWith('http')) {
      requestBody.source_url = presenterId
    } else {
      requestBody.presenter_id = presenterId
    }

    // 添加语音参数
    if (options?.speed) {
      requestBody.script.provider.speed = options.speed
    }

    const response = await fetch(D_ID_ENDPOINTS.talks, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        `D-ID 视频生成失败: ${errorData.error?.description || response.statusText}`
      )
    }

    const data: DIDTaskResponse = await response.json()
    return data.id
  } catch (error: any) {
    console.error('提交 D-ID 视频生成任务失败:', error)
    throw new Error(`提交 D-ID 视频生成任务失败: ${error.message}`)
  }
}

/**
 * 查询 D-ID 任务状态
 * @param taskId D-ID 任务ID
 * @param taskType 任务类型（talks 或 clips）
 */
export async function getDIDTaskStatus(
  taskId: string,
  taskType: 'talks' | 'clips' = 'talks'
): Promise<DIDTaskResponse> {
  try {
    const endpoint = taskType === 'talks' ? D_ID_ENDPOINTS.talks : D_ID_ENDPOINTS.clips
    const response = await fetch(`${endpoint}/${taskId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        `查询 D-ID 任务状态失败: ${errorData.error?.description || response.statusText}`
      )
    }

    const data: DIDTaskResponse = await response.json()
    return data
  } catch (error: any) {
    console.error('查询 D-ID 任务状态失败:', error)
    throw new Error(`查询 D-ID 任务状态失败: ${error.message}`)
  }
}

/**
 * 将 D-ID 状态转换为数据库状态
 */
export function convertDIDStatusToDBStatus(didStatus: DIDTaskStatus): string {
  switch (didStatus) {
    case 'done':
      return 'completed'
    case 'error':
    case 'rejected':
      return 'failed'
    case 'created':
    case 'started':
    default:
      return 'processing'
  }
}
