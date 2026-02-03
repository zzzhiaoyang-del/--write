# 抖音博主账号拆解 API

## 项目简介

这是一个完整的抖音博主账号分析后端服务，通过 Apify API 获取抖音账号数据，再使用 DeepSeek AI 进行深度分析，生成通俗易懂的商业分析报告。

## 核心流程

```
用户输入抖音链接
    ↓
调用 Apify API 获取账号数据（粉丝数、作品数、视频标题等）
    ↓
数据清洗和格式化
    ↓
发送给 DeepSeek API 进行 AI 分析
    ↓
返回结构化拆解报告（账号定位、爆款密码、复制要点、避坑指南）
```

## 技术栈

- **后端框架**: FastAPI
- **数据抓取**: Apify Actor API (clockworks/tiktok-scraper)
- **AI 分析**: DeepSeek API
- **部署平台**: Railway / Vercel / 自托管

## 文件结构

```
├── railway-server.py       # 主服务文件（推荐使用）
├── requirements.txt        # Python 依赖
├── .env.example           # 环境变量示例
├── Procfile               # Railway 部署配置
├── railway.json           # Railway 配置文件
└── DOUYIN-API-README.md   # 项目文档
```

## 快速开始

### 1. 环境准备

**安装依赖**

```bash
pip install -r requirements.txt
```

**配置环境变量**

复制 `.env.example` 为 `.env` 并填写：

```bash
# DeepSeek API Key
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx

# Apify API Token
APIFY_API_TOKEN=apify_api_xxxxxxxxxxxxxxxx
```

### 2. 本地运行

```bash
python railway-server.py
```

服务将在 `http://localhost:8000` 启动。

### 3. 测试 API

**健康检查**
```bash
curl http://localhost:8000/
```

**分析抖音账号**
```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.douyin.com/user/MS4wLjABAAAA..."}'
```

## API 文档

### POST /analyze

分析抖音博主账号

**请求参数**

```json
{
  "url": "https://www.douyin.com/user/MS4wLjABAAAA..."
}
```

**响应格式**

```json
{
  "status": "success",
  "result": "【账号定位】\n这是一个专注于...\n\n【爆款密码】\n- 第一点...\n..."
}
```

**错误响应**

```json
{
  "status": "error",
  "error": "错误信息"
}
```

## 获取 API Keys

### DeepSeek API Key

1. 访问 [DeepSeek 开放平台](https://platform.deepseek.com/)
2. 注册/登录账号
3. 进入「API Keys」页面
4. 创建新的 API Key
5. 复制 `sk-` 开头的密钥

### Apify API Token

1. 访问 [Apify 官网](https://apify.com/)
2. 注册/登录账号
3. 进入 Settings → Integrations → API Tokens
4. 复制 `apify_api_` 开头的 Token
5. 免费账号有每月 $5 的免费额度

## 部署指南

### Railway 部署（推荐）

1. Fork 本项目到你的 GitHub
2. 访问 [Railway](https://railway.app/)
3. 点击 「New Project」→「Deploy from GitHub repo」
4. 选择你的仓库
5. 添加环境变量：
   - `DEEPSEEK_API_KEY`
   - `APIFY_API_TOKEN`
6. Railway 会自动识别 `Procfile` 并启动服务

### Vercel 部署

由于 Apify Actor 运行时间较长（30-120秒），Vercel 免费版有超时限制，建议：
- 升级到 Vercel Pro（60秒超时）
- 或使用 Railway 部署

### Docker 部署

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["python", "railway-server.py"]
```

```bash
docker build -t douyin-api .
docker run -p 8000:8000 \
  -e DEEPSEEK_API_KEY=your_key \
  -e APIFY_API_TOKEN=your_token \
  douyin-api
```

## DeepSeek 提示词说明

系统使用自定义的 AI 提示词，包含以下分析维度：

1. **账号定位**: 一句话说清楚账号是谁、卖什么、给谁看
2. **爆款密码**: 分析账号做对了哪三件事
3. **怎么复制**: 给出第一步、第二步、第三步的具体执行方案
4. **参考选题**: 生成 3 个可用的视频标题建议
5. **避坑指南**: 指出这类账号最容易失败的环节

语言风格：大白话、无专业术语、结论先行、面向老板决策

## 常见问题

### Q1: Apify 抓取失败怎么办？

- 检查抖音链接格式是否正确
- 确认 Apify Token 是否有效
- 查看 Apify 账户余额是否充足

### Q2: DeepSeek 分析返回空结果？

- 检查 API Key 是否正确
- 确认账号余额是否充足
- 查看服务器日志中的错误信息

### Q3: Railway 部署后无法访问？

- 检查环境变量是否正确配置
- 查看 Railway 日志中是否有报错
- 确认端口设置为 `PORT` 环境变量

## 性能优化建议

1. **缓存机制**: 对相同 URL 的请求结果缓存 24 小时
2. **异步处理**: 使用队列系统处理长时间任务
3. **流式输出**: 改为 SSE 流式返回，提升用户体验
4. **限流控制**: 添加 IP 限流，防止滥用

## 项目维护

- 作者: 朝阳
- 版本: 2.0
- 最后更新: 2026-02-03

## 许可证

MIT License
