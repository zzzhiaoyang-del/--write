# Railway 部署指南 - 抖音账号拆解 API

## 为什么选择 Railway?

✅ **免费 $5 额度/月** (足够测试和小规模使用)
✅ **无超时限制** (Apify 需要 30-120 秒)
✅ **原生支持 Python**
✅ **自动从 Git 部署**
✅ **提供免费域名**
✅ **简单易用**

## 📋 部署步骤

### 1. 注册 Railway 账号

访问: https://railway.app

- 使用 GitHub 账号登录
- 免费套餐无需信用卡

### 2. 创建新项目

1. 点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 连接您的 GitHub 仓库
4. 选择这个项目仓库

### 3. 配置环境变量

在 Railway 项目中:

1. 点击项目 → Variables
2. 添加以下变量:

```env
APIFY_API_TOKEN=apify_api_xxxxxxxxxxxxxxxxxxxxxxxxxx
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. 自动部署

Railway 会自动:
- 检测 Python 项目
- 读取 `api/requirements.txt`
- 安装依赖
- 启动服务 (使用 `Procfile` 或 `railway.json` 配置)

部署完成后,您会获得一个免费域名,类似:
```
https://your-project.up.railway.app
```

## 🔧 已创建的文件

### 1. [railway-server.py](railway-server.py)
- Railway 专用服务器代码
- 基于 FastAPI
- 集成 Apify + DeepSeek
- 监听 `$PORT` 环境变量 (Railway 自动分配)

### 2. [Procfile](Procfile)
- Railway 启动命令
- 告诉 Railway 如何运行服务

### 3. [railway.json](railway.json)
- Railway 配置文件
- 定义构建和部署行为

### 4. [api/requirements.txt](api/requirements.txt) (已更新)
- 添加了 FastAPI 和 Uvicorn

## 📡 API 使用

部署成功后,您可以:

### 健康检查
```bash
curl https://your-project.up.railway.app/
```

响应:
```json
{
  "status": "ok",
  "message": "抖音账号拆解 API (Railway 版) 运行正常",
  "version": "2.0",
  "environment": "Railway"
}
```

### 分析账号
```bash
curl -X POST https://your-project.up.railway.app/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.douyin.com/user/MS4wLjABAAAA..."}'
```

## 🔗 与 Next.js 前端集成

修改您的 Next.js API Route ([app/api/generate/route.ts](app/api/generate/route.ts#L2266-L2276)):

```typescript
// 抖音账号拆解使用 Railway 后端
if (agentId === 'douyin-account-analyzer') {
  try {
    const response = await fetch('https://your-project.up.railway.app/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: formData.url })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || '分析失败')
    }

    const data = await response.json()
    return NextResponse.json({ result: data.result })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '分析失败' },
      { status: 500 }
    )
  }
}
```

## 📊 监控和日志

### 查看日志
1. 进入 Railway 项目
2. 点击 Deployments
3. 选择最新部署
4. 查看 Build Logs 和 Deploy Logs

日志会显示:
```
[请求] 分析 URL: https://www.douyin.com/user/...
[Apify] 开始运行 Actor: clockworks/tiktok-scraper
[Apify] Actor 运行完成
[Apify] 获取到 20 条数据
[DeepSeek] 开始 AI 分析
[DeepSeek] AI 分析完成
```

### 查看性能
Railway Dashboard 会显示:
- CPU 使用率
- 内存使用
- 请求数量
- 响应时间

## 💰 费用估算

### Railway 免费套餐
- $5 免费额度/月
- 约等于 500 小时运行时间
- 足够小规模使用

### 付费后
- $5/月 = 500 小时
- $10/月 = 1000 小时
- 远低于 Vercel Pro ($20/月)

### Apify 费用
- 免费 $5/月
- 每次抓取 $0.01-0.05
- 免费额度支持 100-500 次

### DeepSeek 费用
- 极低,约 $0.001/次

## ⚙️ 高级配置

### 自定义域名
1. Railway 项目 → Settings → Domains
2. 添加自定义域名
3. 配置 DNS CNAME 记录

### 扩展资源
如果需要更多资源:
1. Settings → Resources
2. 升级 Plan
3. 调整 CPU/内存限制

### 自动重启
`railway.json` 已配置:
- 失败时自动重启
- 最多重试 10 次

## 🐛 故障排查

### 问题 1: 部署失败

**查看 Build Logs**:
- 依赖安装失败 → 检查 `api/requirements.txt`
- Python 版本问题 → Railway 默认使用最新稳定版

**解决**: 查看错误日志,根据提示修复

### 问题 2: 环境变量未设置

**错误**: "APIFY_API_TOKEN 未配置"

**解决**:
1. 进入 Variables 标签
2. 确认变量已添加
3. Redeploy

### 问题 3: Apify 抓取失败

**可能原因**:
- URL 格式错误
- Apify 余额不足
- 抖音反爬机制

**解决**:
1. 检查 URL 格式 (必须是 `https://www.douyin.com/user/...`)
2. 查看 Apify Dashboard 余额
3. 查看 Railway 日志中的详细错误信息

### 问题 4: 响应慢

**原因**: Apify Actor 运行需要 30-120 秒

**优化**:
1. 减少 `resultsPerPage` (当前 20 → 改为 10)
2. 添加缓存机制
3. 使用异步队列

## 🚀 性能优化

### 1. 添加 Redis 缓存

Railway 支持添加 Redis:
1. New → Database → Redis
2. 在代码中集成缓存逻辑

### 2. 并发处理

修改 uvicorn 启动参数:
```bash
uvicorn railway-server:app --host 0.0.0.0 --port $PORT --workers 4
```

### 3. 异步处理

将 Apify 调用改为异步:
```python
from fastapi import BackgroundTasks

@app.post("/analyze-async")
async def analyze_async(request: AnalyzeRequest, background_tasks: BackgroundTasks):
    task_id = generate_task_id()
    background_tasks.add_task(run_apify_analysis, request.url, task_id)
    return {"task_id": task_id, "status": "processing"}
```

## 📝 下一步

1. ✅ **部署到 Railway** (按照上述步骤)
2. ✅ **测试 API** (使用 curl 或 Postman)
3. ✅ **集成到 Next.js** (修改前端 API 调用)
4. ✅ **监控日志** (确保正常运行)

## 📚 相关链接

- Railway 文档: https://docs.railway.app
- Apify 文档: https://docs.apify.com
- FastAPI 文档: https://fastapi.tiangolo.com

准备好部署了吗? 有任何问题随时问我! 🚀
