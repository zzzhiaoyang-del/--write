import { NextRequest, NextResponse } from 'next/server'
import { pollTaskStatus } from '@/lib/services/VideoGenerationService'

/**
 * GET /api/status?taskId=xxx
 *
 * 查询视频生成任务状态。
 * 前端每 5 秒轮询一次，直到状态变为 completed 或 failed。
 *
 * 响应格式：
 *   - 生成中：{ status: 'processing' }
 *   - 成功：  { status: 'completed', videoUrl: 'https://...' }
 *   - 失败：  { status: 'failed', error: '...' }
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const taskId = searchParams.get('taskId') || searchParams.get('predictionId')

  if (!taskId) {
    return NextResponse.json({ error: '缺少 taskId 参数' }, { status: 400 })
  }

  try {
    const result = await pollTaskStatus(taskId, 'liveportrait')
    return NextResponse.json(result)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '查询状态失败'
    console.error('[status]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
