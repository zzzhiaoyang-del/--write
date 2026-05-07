import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: NextRequest) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { error: "REPLICATE_API_TOKEN 未配置" },
      { status: 500 }
    );
  }

  let body: { imageUrl?: string; audioUrl?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求体格式错误" }, { status: 400 });
  }

  const { imageUrl, audioUrl } = body;

  if (!imageUrl || !audioUrl) {
    return NextResponse.json(
      { error: "imageUrl 和 audioUrl 均为必填项" },
      { status: 400 }
    );
  }

  // 简单校验是否为合法 URL
  try {
    new URL(imageUrl);
    new URL(audioUrl);
  } catch {
    return NextResponse.json({ error: "URL 格式不合法" }, { status: 400 });
  }

  try {
    // 使用 predictions.create 获取异步 prediction id
    const prediction = await replicate.predictions.create({
      version:
        "3aa3dac9353cc4d6bd62a8f95957bd844003b401ca4e4a9b33baa574c549d376",
      input: {
        source_image: imageUrl,
        driven_audio: audioUrl,
        preprocess: "crop",
        still_mode: false,
        use_enhancer: false,
        batch_size: 1,
        size: 256,
        pose_style: 0,
        facerender: "facevid2vid",
        exp_scale: 1,
      },
    });

    return NextResponse.json({
      predictionId: prediction.id,
      status: prediction.status,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Replicate 调用失败";
    console.error("[sadtalker/generate]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
