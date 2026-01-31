from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, HttpUrl
import requests
from openai import OpenAI
import os
from dotenv import load_dotenv
import asyncio
from typing import AsyncGenerator

# 加载环境变量
load_dotenv()

app = FastAPI(title="抖音账号拆解 API")

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境请修改为具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 环境变量
JINA_API_KEY = os.getenv("JINA_API_KEY")
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")

# 验证环境变量
if not JINA_API_KEY:
    raise ValueError("JINA_API_KEY 未在环境变量中设置")
if not DEEPSEEK_API_KEY:
    raise ValueError("DEEPSEEK_API_KEY 未在环境变量中设置")

# 初始化 DeepSeek 客户端
deepseek_client = OpenAI(
    api_key=DEEPSEEK_API_KEY,
    base_url="https://api.deepseek.com"
)

# 系统提示词
SYSTEM_PROMPT = """# Role: 抖音账号拆解专家
## Profile:
- Author: 朝阳
- Version: 1.0
- Language: 中文

## Background:
用户通过JavaScript爬虫获取了目标抖音博主的详细数据信息,但面对海量数据和专业术语,老板无法直观理解账号的核心价值。用户需要一个专家角色,能够透过数据看本质,将枯燥的信息转化为通俗易懂的商业逻辑,直接告诉老板这个账号是怎么火的、能不能抄、怎么抄、以及如何避免踩坑。

## Goals:
1. 深度剖析目标账号的"爆款基因",包括人设定位、选题逻辑、拍摄风格。
2. 提炼出可复制的成功路径,为老板提供具体的执行建议。
3. 识别账号的潜在风险和操作难点,帮助团队规避弯路。
4. 语言风格必须通俗易懂(说人话),确保老板能秒懂。

## Constrains:
1. 必须使用大白话,禁止使用晦涩难懂的专业术语。
2. 核心聚焦于"商业价值"和"可执行性",不要罗列无意义的数据。
3. 输出排版必须整洁,严格禁止使用星号(*)符号,包括Markdown中的加粗和列表符(列表使用短横线 - )。
4. 每一个分析点必须对应一个具体的行动建议。

### Skills:
1. 爆款内容逆向工程能力:能从视频表现反推脚本结构和情绪钩子。
2. 商业变现逻辑分析:识别账号的变现路径(带货、广告、引流)。
3. 运营策略拆解:分析更新频率、发布时间、粉丝互动模式。

## Rules:
1. 既然是给老板看,结论先行,先说价值,再说细节。
2. 遇到数据分析时,直接转化为"这对我们意味着什么"。
3. 绝对禁止在输出结果中出现任何星号(*)。

## Workflow:
1. 接收用户提供的账号数据或描述信息。
2. 按照以下框架进行深度拆解:
   - 账号定位一句话总结(他是谁,做给谁看,卖什么)。
   - 爆款逻辑拆解(为什么火,也就是流量密码)。
   - 复制实操指南(如果我们做,第一步做什么,核心抓手是什么)。
   - 避坑指南(这类账号最容易死在哪里)。
3. 输出最终报告。

## Initialization:
作为 <Role>, 严格遵守 <Rules>, 使用默认 <Language> 与用户对话。我将直接忽略欢迎语,当用户输入账号信息后,直接依据 <Workflow> 输出无星号(*)的纯净分析报告。"""


class AnalyzeRequest(BaseModel):
    url: str


def fetch_content_from_jina(target_url: str) -> str:
    """
    使用 Jina Reader 抓取目标 URL 的内容
    """
    jina_url = f"https://r.jina.ai/{target_url}"
    headers = {
        "Authorization": f"Bearer {JINA_API_KEY}",
        "X-Retain-Images": "none"  # 只抓取文本,不要图片
    }

    try:
        response = requests.get(jina_url, headers=headers, timeout=30)
        response.raise_for_status()
        return response.text
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=500,
            detail=f"Jina 内容抓取失败: {str(e)}"
        )


def truncate_text(text: str, max_length: int = 30000) -> str:
    """
    截断文本以防止超长输入
    """
    if len(text) > max_length:
        return text[:max_length] + "\n\n[文本过长,已自动截断]"
    return text


async def stream_deepseek_analysis(content: str) -> AsyncGenerator[str, None]:
    """
    使用 DeepSeek 进行流式分析
    """
    try:
        # 截断文本
        truncated_content = truncate_text(content)

        # 调用 DeepSeek API (流式)
        stream = deepseek_client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"请分析以下抖音账号数据:\n\n{truncated_content}"}
            ],
            temperature=1.3,
            stream=True
        )

        # 流式返回数据
        for chunk in stream:
            if chunk.choices[0].delta.content:
                yield f"data: {chunk.choices[0].delta.content}\n\n"

        # 发送结束信号
        yield "data: [DONE]\n\n"

    except Exception as e:
        error_msg = f"AI 分析失败: {str(e)}"
        yield f"data: [ERROR] {error_msg}\n\n"


@app.get("/")
async def root():
    """
    健康检查接口
    """
    return {
        "status": "ok",
        "message": "抖音账号拆解 API 正常运行",
        "version": "1.0"
    }


@app.post("/analyze")
async def analyze_douyin_account(request: AnalyzeRequest):
    """
    分析抖音账号的主接口

    流程:
    1. 接收用户提供的 URL
    2. 使用 Jina Reader 抓取内容
    3. 使用 DeepSeek 进行 AI 分析
    4. 流式返回分析结果
    """
    if not request.url:
        raise HTTPException(status_code=400, detail="URL 不能为空")

    # 步骤 1: 抓取内容
    try:
        content = fetch_content_from_jina(request.url)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"内容抓取失败: {str(e)}"
        )

    # 步骤 2: 流式分析并返回
    return StreamingResponse(
        stream_deepseek_analysis(content),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
