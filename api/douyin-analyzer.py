"""
抖音账号拆解 API - Apify 云端版本
部署平台: Vercel Serverless Functions
"""

from http.server import BaseHTTPRequestHandler
import json
import os
from typing import Dict, List, Any, Optional
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
    raise ValueError("环境变量 APIFY_API_TOKEN 未设置")
if not DEEPSEEK_API_KEY:
    raise ValueError("环境变量 DEEPSEEK_API_KEY 未设置")

# 初始化客户端
apify_client = ApifyClient(APIFY_API_TOKEN)
deepseek_client = OpenAI(
    api_key=DEEPSEEK_API_KEY,
    base_url="https://api.deepseek.com"
)

# DeepSeek 系统提示词
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
    """
    清洗 clockworks/tiktok-scraper 返回的抖音数据

    参数:
        items: Apify dataset 返回的 JSON 列表 (每个 item 是一个视频)

    返回:
        格式化后的字符串,用于 AI 分析
    """
    if not items or len(items) == 0:
        return "未获取到有效数据"

    # clockworks/tiktok-scraper 每个 item 是一个视频
    # 账号信息在 authorMeta 或 author 字段中
    first_item = items[0]

    # 提取账号基础信息
    result = "# 抖音账号数据\n\n"

    # 1. 昵称 (从第一个视频的作者信息提取)
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

    # 4. 提取视频列表 (前 10 个)
    if items and len(items) > 0:
        result += "## 最近视频作品 (前 10 个)\n\n"
        for i, video in enumerate(items[:10], 1):
            # 视频标题/描述
            title = video.get('text') or video.get('desc') or video.get('title', '无标题')

            # 视频统计数据
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


# ==================== Apify 抓取函数 ====================

def fetch_douyin_data_with_apify(url: str) -> str:
    """
    使用 Apify 抓取抖音数据

    参数:
        url: 抖音博主主页或视频链接

    返回:
        清洗后的数据字符串

    注意:
        - Apify Actor 运行可能需要 30-120 秒
        - Vercel 免费版函数超时限制为 10 秒 (Hobby) 或 60 秒 (Pro)
        - 建议升级到 Vercel Pro 或使用异步队列处理
    """
    try:
        # 准备输入参数 (clockworks/tiktok-scraper 标准格式)
        run_input = {
            "profileURLs": [url],  # 用户主页 URL 列表
            "resultsPerPage": 20,  # 每个用户抓取的视频数量
            "shouldDownloadVideos": False,  # 不下载视频文件
            "shouldDownloadCovers": False,  # 不下载封面
            "shouldDownloadSubtitles": False  # 不下载字幕
        }

        print(f"[Apify] 开始运行 Actor: {ACTOR_ID}")
        print(f"[Apify] 输入参数: {json.dumps(run_input, ensure_ascii=False)}")

        # 调用 Apify Actor (同步等待完成)
        # 警告: 这里会阻塞,可能触发 Vercel 超时
        run = apify_client.actor(ACTOR_ID).call(run_input=run_input)

        print(f"[Apify] Actor 运行完成,状态: {run.get('status')}")

        # 获取 dataset 结果
        dataset_items = list(apify_client.dataset(run["defaultDatasetId"]).iterate_items())

        print(f"[Apify] 获取到 {len(dataset_items)} 条数据")

        if not dataset_items:
            raise Exception("Apify 未返回任何数据,请检查 URL 或 Actor 配置")

        # 数据清洗
        cleaned_data = clean_douyin_data(dataset_items)

        return cleaned_data

    except Exception as e:
        error_msg = f"Apify 抓取失败: {str(e)}"
        print(f"[错误] {error_msg}")
        raise Exception(error_msg)


# ==================== AI 分析函数 ====================

def analyze_with_deepseek(data: str) -> str:
    """
    使用 DeepSeek 分析抖音数据 (非流式版本)

    参数:
        data: 清洗后的抖音数据字符串

    返回:
        AI 分析结果
    """
    try:
        print("[DeepSeek] 开始 AI 分析...")

        # 截断数据防止超长
        max_length = 30000
        truncated_data = data[:max_length] if len(data) > max_length else data

        # 调用 DeepSeek API (非流式)
        response = deepseek_client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"请分析以下抖音账号数据:\n\n{truncated_data}"}
            ],
            temperature=1.3,
            max_tokens=4000,
            stream=False  # 非流式,适合 Vercel Serverless
        )

        result = response.choices[0].message.content
        print("[DeepSeek] AI 分析完成")

        return result

    except Exception as e:
        error_msg = f"AI 分析失败: {str(e)}"
        print(f"[错误] {error_msg}")
        raise Exception(error_msg)


# ==================== Vercel Handler ====================

class handler(BaseHTTPRequestHandler):
    """
    Vercel Serverless Function Handler

    请求格式:
        POST /api/douyin-analyzer
        Body: {"url": "https://www.douyin.com/user/..."}

    响应格式:
        {"result": "AI 分析结果", "status": "success"}
        或
        {"error": "错误信息", "status": "error"}
    """

    def do_POST(self):
        try:
            # 读取请求体
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))

            # 获取 URL
            url = data.get('url')
            if not url:
                self.send_error_response(400, "缺少 URL 参数")
                return

            print(f"[请求] 分析 URL: {url}")

            # ⚠️ 超时警告
            # Vercel 免费版超时限制:
            # - Hobby: 10 秒
            # - Pro: 60 秒
            # Apify Actor 运行通常需要 30-120 秒
            # 建议: 升级到 Pro 或使用异步队列 + Webhook

            # 步骤 1: Apify 抓取数据
            douyin_data = fetch_douyin_data_with_apify(url)

            # 步骤 2: DeepSeek 分析
            analysis_result = analyze_with_deepseek(douyin_data)

            # 返回成功响应
            self.send_success_response({
                "result": analysis_result,
                "status": "success"
            })

        except Exception as e:
            self.send_error_response(500, str(e))

    def do_GET(self):
        """健康检查"""
        self.send_success_response({
            "message": "抖音账号拆解 API (Apify 版) 运行正常",
            "version": "2.0",
            "status": "ok"
        })

    def send_success_response(self, data: Dict):
        """发送成功响应"""
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))

    def send_error_response(self, status_code: int, message: str):
        """发送错误响应"""
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        error_data = {
            "error": message,
            "status": "error"
        }
        self.wfile.write(json.dumps(error_data, ensure_ascii=False).encode('utf-8'))
