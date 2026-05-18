import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * 数字人视频生成 API（已迁移至适配器模式）
 * 此路由保留用于兼容旧版"口播文字"流程，
 * 新的主流程请使用 /api/create-video（支持 TTS + SadTalker）
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: '此接口已废弃，请使用 /api/create-video' },
    { status: 410 }
  )
}
