import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function GET(req: NextRequest) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { error: "REPLICATE_API_TOKEN 未配置" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const predictionId = searchParams.get("id");

  if (!predictionId) {
    return NextResponse.json(
      { error: "缺少 id 参数" },
      { status: 400 }
    );
  }

  try {
    const prediction = await replicate.predictions.get(predictionId);

    return NextResponse.json({
      id: prediction.id,
      status: prediction.status, // starting | processing | succeeded | failed | canceled
      output: prediction.output ?? null,
      error: prediction.error ?? null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "查询状态失败";
    console.error("[sadtalker/status]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
