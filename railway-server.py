"""
抖音账号拆解 API - Railway 部署版本
使用 FastAPI + Uvicorn 持续运行服务
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os
from typing import Dict, List, Any
from apify_client import ApifyClient
from openai import OpenAI

# ==================== 配置部分 ====================

# Apify Actor ID (clockworks/tiktok-scraper)
ACTOR_ID = "clockworks/tiktok-scraper"

# API Keys (从环境变量读取)
APIFY_API_TOKEN = os.getenv("APIFY_API_TOKEN")
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")

# 验证环境变量
if not APIFY_API_TOKEN:
    print("警告: APIFY_API_TOKEN 未设置")
if not DEEPSEEK_API_KEY:
    print("警告: DEEPSEEK_API_KEY 未设置")

# 初始化客户端
apify_client = ApifyClient(APIFY_API_TOKEN) if APIFY_API_TOKEN else None
deepseek_client = OpenAI(
    api_key=DEEPSEEK_API_KEY,
    base_url="https://api.deepseek.com"
) if DEEPSEEK_API_KEY else None

# 创建 FastAPI 应用
app = FastAPI(title="抖音账号拆解 API (Railway)")

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DeepSeek 系统提示词（用户自定义版本 v1.0）
SYSTEM_PROMPT = """# 角色 (Role): 抖音实战拆解专家
## 简介 (Profile):
- 作者 (author): 朝阳
- 版本 (version): 1.0
- 语言 (language): 中文

## 背景 (Background):
用户手持一份抖音博主的原始数据 (JSON格式)，包含简介、核心数据指标及近期视频标题。老板需要透过这些枯燥的数据，快速看懂这个账号的商业价值，了解其成功背后的底层逻辑，以及如果团队要跟进复制，具体该怎么做。老板没时间看专业术语，需要简单直白的大白话。

## 目标 (Goals):
1.  解析JSON数据，提炼核心商业信息。
2.  用通俗语言 (说人话) 解释账号为什么能火。
3.  给出具体的复制方案和执行建议 (直接生成选题方向)。
4.  指出潜在风险，帮助团队少走弯路。

## 约束 (Constrains):
1.  严禁使用任何星号符号 (包括Markdown语法的加粗星号)，列表请使用短横线 (-)。
2.  禁止输出"好的"、"收到"、"正在分析"等废话，直接输出报告。
3.  语言风格必须极度通俗，禁止堆砌运营黑话 (如"颗粒度"、"底层逻辑"等，除非紧跟大白话解释)。
4.  排版要简洁明了，重点突出。
5.  必须基于提供的JSON数据进行分析，不可瞎编。

### 技能 (Skills):
1.  数据洞察力：能从粉丝数、点赞比、标题风格反推用户画像。
2.  爆款逆向：能通过视频标题列表分析出脚本结构和情绪钩子。
3.  实操指导：能将分析结果转化为具体的拍摄、选题建议。

## 规则 (Rules):
1.  结论先行：先告诉老板这账号值不值得做，再说什么。
2.  拆解维度：必须包含账号定位、爆款公式、复制要点、避坑指南四个模块。
3.  选题生成：必须根据分析结果，现场拟定3个可用的参考选题。

## 工作流 (Workflow):
1.  读取并解析用户提供的JSON数据。
2.  输出 [账号定位]：用一句话说清他是谁、卖什么、给谁看。
3.  输出 [爆款密码]：分析标题和数据，总结他做对了哪三件事。
4.  输出 [怎么复制]：如果我们做，第一步、第二步、第三步具体干什么。
5.  输出 [参考选题]：结合该账号风格，给出3个具体的视频标题建议。
6.  输出 [避坑指南]：这类账号最容易死在哪一步。

## 初始化 (Initialization):
作为角色 <Role>, 严格遵守 <Rules>, 使用默认 <Language>。
当用户输入JSON数据后，不需要任何开场白，直接根据 <Workflow> 进行深度拆解，输出一份没有任何星号符号的纯净报告。"""


# ==================== 数据清洗函数 ====================

def clean_douyin_data(items: List[Dict[str, Any]]) -> str:
    """清洗 clockworks/tiktok-scraper 返回的抖音数据"""
    if not items or len(items) == 0:
        return "未获取到有效数据"

    first_item = items[0]
    result = "# 抖音账号数据\n\n"

    # 1. 昵称
    author_meta = first_item.get('authorMeta', {}) or first_item.get('author', {})
    nickname = author_meta.get('name') or author_meta.get('nickname', '未知')
    result += f"## 昵称\n{nickname}\n\n"

    # 2. 简介
    signature = author_meta.get('signature') or author_meta.get('bio', '暂无简介')
    result += f"## 简介\n{signature}\n\n"

    # 3. 统计数据
    result += "## 统计数据\n"
    follower_count = author_meta.get('fans') or author_meta.get('followerCount', 0)
    video_count = author_meta.get('video') or author_meta.get('videoCount', 0)
    heart_count = author_meta.get('heart') or author_meta.get('heartCount', 0)

    result += f"- 粉丝数: {format_number(follower_count)}\n"
    result += f"- 作品数: {video_count}\n"
    result += f"- 获赞数: {format_number(heart_count)}\n\n"

    # 4. 提取视频列表
    if items and len(items) > 0:
        result += "## 最近视频作品 (前 10 个)\n\n"
        for i, video in enumerate(items[:10], 1):
            title = video.get('text') or video.get('desc') or video.get('title', '无标题')
            digg_count = video.get('diggCount', 0)
            comment_count = video.get('commentCount', 0)
            share_count = video.get('shareCount', 0)
            play_count = video.get('playCount', 0)

            result += f"{i}. {title}\n"
            result += f"   - 点赞: {format_number(digg_count)} | 评论: {format_number(comment_count)} | 分享: {format_number(share_count)} | 播放: {format_number(play_count)}\n"
    else:
        result += "## 视频数据\n暂无视频数据\n\n"

    return result


def format_number(num: int) -> str:
    """格式化数字 (万、亿)"""
    if num >= 100000000:
        return f"{num / 100000000:.1f}亿"
    elif num >= 10000:
        return f"{num / 10000:.1f}万"
    else:
        return str(num)


# ==================== API 路由 ====================

class AnalyzeRequest(BaseModel):
    url: str


@app.get("/")
async def root():
    """健康检查"""
    return {
        "status": "ok",
        "message": "抖音账号拆解 API (Railway 版) 运行正常",
        "version": "2.0",
        "environment": "Railway"
    }


@app.post("/analyze")
async def analyze_douyin_account(request: AnalyzeRequest):
    """分析抖音账号"""

    # 验证环境变量
    if not apify_client:
        raise HTTPException(status_code=500, detail="APIFY_API_TOKEN 未配置")
    if not deepseek_client:
        raise HTTPException(status_code=500, detail="DEEPSEEK_API_KEY 未配置")

    if not request.url:
        raise HTTPException(status_code=400, detail="URL 不能为空")

    try:
        print(f"[请求] 分析 URL: {request.url}")

        # 步骤 1: Apify 抓取数据
        run_input = {
            "profileURLs": [request.url],
            "resultsPerPage": 20,
            "shouldDownloadVideos": False,
            "shouldDownloadCovers": False,
            "shouldDownloadSubtitles": False
        }

        print(f"[Apify] 开始运行 Actor: {ACTOR_ID}")
        run = apify_client.actor(ACTOR_ID).call(run_input=run_input)
        print(f"[Apify] Actor 运行完成")

        # 获取 dataset 结果
        dataset_items = list(apify_client.dataset(run["defaultDatasetId"]).iterate_items())
        print(f"[Apify] 获取到 {len(dataset_items)} 条数据")

        if not dataset_items:
            raise HTTPException(status_code=500, detail="Apify 未返回任何数据")

        # 步骤 2: 数据清洗
        cleaned_data = clean_douyin_data(dataset_items)

        # 步骤 3: DeepSeek 分析
        print("[DeepSeek] 开始 AI 分析")
        truncated_data = cleaned_data[:30000] if len(cleaned_data) > 30000 else cleaned_data

        response = deepseek_client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"请分析以下抖音账号数据:\n\n{truncated_data}"}
            ],
            temperature=1.3,
            max_tokens=4000,
            stream=False
        )

        result = response.choices[0].message.content
        print("[DeepSeek] AI 分析完成")

        return {
            "result": result,
            "status": "success"
        }

    except Exception as e:
        print(f"[错误] {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
