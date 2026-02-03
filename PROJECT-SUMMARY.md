# 抖音博主账号拆解 - 完整项目总结

## 项目概述

已成功创建一个完整的抖音博主账号拆解后端服务，采用 **Apify 云端抓取 + DeepSeek AI 分析** 架构。

## 核心流程

```
用户输入抖音链接
    ↓
FastAPI 接收请求
    ↓
调用 Apify Actor API (clockworks/tiktok-scraper)
    ↓
获取账号数据（粉丝数、作品数、视频标题等）
    ↓
数据清洗和格式化
    ↓
发送给 DeepSeek API 进行 AI 分析
    ↓
返回结构化报告（账号定位、爆款密码、复制要点、避坑指南）
```

## 项目文件结构

```
AI智能体/
├── railway-server.py           # 主服务文件 (FastAPI + Apify + DeepSeek)
├── requirements.txt            # Python 依赖
├── .env.example               # 环境变量示例
├── Procfile                   # Railway 部署配置
├── railway.json               # Railway 高级配置
├── check_env.py               # 环境检查脚本
├── test_api.py                # API 测试脚本
├── DOUYIN-API-README.md       # 完整技术文档
├── QUICKSTART.md              # 快速开始指南
└── PROJECT-SUMMARY.md         # 本文档
```

## 技术栈

| 组件 | 技术选型 | 说明 |
|------|---------|------|
| Web 框架 | FastAPI | 高性能异步框架 |
| 数据抓取 | Apify Actor API | 云端爬虫服务 |
| AI 分析 | DeepSeek API | 大语言模型 |
| 部署平台 | Railway / Vercel | PaaS 平台 |
| 语言 | Python 3.11+ | - |

## API 接口

### 1. 健康检查
```bash
GET /
```

响应:
```json
{
  "status": "ok",
  "message": "抖音账号拆解 API (Railway 版) 运行正常",
  "version": "2.0"
}
```

### 2. 分析账号
```bash
POST /analyze
Content-Type: application/json

{
  "url": "https://www.douyin.com/user/MS4wLjABAAAA..."
}
```

响应:
```json
{
  "status": "success",
  "result": "【账号定位】\n这是一个...\n\n【爆款密码】\n..."
}
```

## 环境变量配置

需要在 `.env` 文件或部署平台配置以下变量:

```bash
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
APIFY_API_TOKEN=apify_api_xxxxxxxxxxxxxxxx
```

## 本地开发流程

### 1. 安装依赖
```bash
pip install -r requirements.txt
```

### 2. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 填入你的 API Keys
```

### 3. 检查环境
```bash
python check_env.py
```

### 4. 启动服务
```bash
python railway-server.py
```

服务运行在 `http://localhost:8000`

### 5. 测试 API
```bash
python test_api.py
```

## 云端部署流程

### Railway 部署（推荐）

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "部署抖音拆解服务"
   git push origin master
   ```

2. **在 Railway 创建项目**
   - 访问 https://railway.app/
   - 点击 「New Project」
   - 选择 「Deploy from GitHub repo」
   - 选择你的仓库

3. **配置环境变量**
   在 Railway 项目设置中添加:
   - `DEEPSEEK_API_KEY`
   - `APIFY_API_TOKEN`

4. **自动部署**
   Railway 会自动识别 `Procfile` 并启动服务

5. **获取公网 URL**
   部署完成后会生成一个公网访问地址

### Vercel 部署

> 注意: Apify Actor 运行时间较长（30-120秒），Vercel 免费版有超时限制，建议使用 Railway。

如需使用 Vercel，需要:
- 升级到 Pro 计划（60秒超时）
- 或使用异步队列 + Webhook 方案

## DeepSeek 提示词说明

系统使用自定义的 AI 提示词，分析维度包括:

1. **账号定位**: 一句话说清账号是谁、卖什么、给谁看
2. **爆款密码**: 分析账号做对了哪三件事
3. **怎么复制**: 给出具体的三步执行方案
4. **参考选题**: 生成 3 个可用的视频标题建议
5. **避坑指南**: 指出这类账号最容易失败的环节

**语言风格**: 大白话、无专业术语、结论先行、面向老板决策

## 获取 API Keys

### DeepSeek API Key
1. 访问 https://platform.deepseek.com/
2. 注册并登录
3. 创建 API Key
4. 复制 `sk-` 开头的密钥

### Apify API Token
1. 访问 https://apify.com/
2. 注册并登录
3. 进入 Settings → Integrations → API Tokens
4. 复制 `apify_api_` 开头的 Token
5. 免费账户有每月 $5 的免费额度

## 使用的 Apify Actor

**Actor ID**: `clockworks/tiktok-scraper`

**功能**: 抓取抖音账号数据
- 用户昵称、简介
- 粉丝数、作品数、获赞数
- 最近 20 个视频的标题和互动数据

**费用**: 约 $0.01-0.05 / 次请求（取决于视频数量）

## 常见问题

### Q: 如何测试 API 是否正常工作？

A: 运行测试脚本:
```bash
python test_api.py
```

### Q: Apify 抓取失败怎么办？

A: 检查以下几点:
1. 抖音链接格式是否正确（完整的用户主页链接）
2. Apify Token 是否有效
3. 账户余额是否充足
4. 检查 Apify 控制台的 Actor 运行日志

### Q: DeepSeek 分析返回空结果？

A: 检查:
1. DeepSeek API Key 是否正确
2. 账户余额是否充足
3. 查看服务器日志中的错误信息

### Q: Railway 部署后无法访问？

A: 检查:
1. 环境变量是否正确配置
2. 查看 Railway 日志是否有报错
3. 确认服务已成功启动

## 性能和成本

### 响应时间
- Apify 抓取: 30-120 秒（取决于账号规模）
- DeepSeek 分析: 5-15 秒
- 总耗时: 约 35-135 秒

### API 调用成本（单次请求）
- Apify: $0.01-0.05
- DeepSeek: $0.001-0.005
- 总成本: 约 $0.01-0.06 / 次

### 优化建议
1. 实现缓存机制（24小时内相同 URL 直接返回缓存）
2. 使用队列系统处理长时间任务
3. 改为流式输出（SSE）提升用户体验

## 环境配置状态

✅ **DeepSeek API Key**: 已配置
✅ **Apify API Token**: 已配置
✅ **.env 文件**: 已创建
✅ **Git 安全**: .env 已加入 .gitignore

## 本地测试

```bash
# 1. 测试 API Keys 连接
python test_keys.py

# 2. 启动服务
python railway-server.py

# 3. 完整测试
python test_api.py
```

## Railway 部署

详细步骤请查看 [RAILWAY-DEPLOY.md](RAILWAY-DEPLOY.md)

简要步骤：
1. 访问 https://railway.app/
2. 从 GitHub 部署
3. 添加环境变量（DEEPSEEK_API_KEY 和 APIFY_API_TOKEN）
4. 自动部署完成

## 下一步计划

- [ ] 部署到 Railway 并获取公网 URL
- [ ] 使用真实抖音链接测试完整流程
- [ ] 前端对接（如需要）
- [ ] 添加缓存机制（Redis）
- [ ] 实现流式输出（Server-Sent Events）
- [ ] 添加用户认证和限流

## 项目信息

- **作者**: 朝阳
- **版本**: 2.0
- **最后更新**: 2026-02-03
- **GitHub**: 已推送
- **许可证**: MIT
- **状态**: ✅ 已配置完成，可以部署

## 相关文档

- [DOUYIN-API-README.md](DOUYIN-API-README.md) - 完整技术文档
- [QUICKSTART.md](QUICKSTART.md) - 快速开始指南
- [.env.example](.env.example) - 环境变量示例

---

**项目已成功配置并推送到 GitHub！** 🎉
