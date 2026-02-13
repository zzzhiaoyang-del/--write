# Apify 版本快速部署清单

## ✅ 已完成配置

### 1. Actor ID 已配置
- ✅ [api/douyin-analyzer.py#L15-L16](api/douyin-analyzer.py#L15-L16): `ACTOR_ID = "clockworks/tiktok-scraper"`
- 这是一个公开的 Apify Actor,专门用于抓取 TikTok/Douyin 数据

### 2. System Prompt 已更新
- ✅ [api/douyin-analyzer.py#L36-L82](api/douyin-analyzer.py#L36-L82): 新版 Prompt
- ✅ [app/api/generate/route.ts#L1724-L1767](app/api/generate/route.ts#L1724-L1767): 同步更新

新 Prompt 特点:
- 结论先行,极度通俗
- 严禁星号符号
- 必须包含: 账号定位、爆款密码、怎么复制、参考选题(3个)、避坑指南
- 禁止输出废话(如"好的"、"收到")

### 3. 依赖文件
- ✅ [api/requirements.txt](api/requirements.txt): 包含 `apify-client` 和 `openai`

### 4. 环境变量模板
- ✅ [.env.example](.env.example): 已添加 `APIFY_API_TOKEN`

## 📋 部署前检查清单

### 步骤 1: 设置 Vercel 环境变量

进入 Vercel 项目 → Settings → Environment Variables，添加:

```env
APIFY_API_TOKEN=apify_api_xxxxxxxxxxxxxxxxxxxxxxxxxx
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 步骤 2: 确认 Actor 输入参数格式

✅ **已配置为 clockworks/tiktok-scraper 标准格式**:

```json
{
  "profileURLs": ["https://www.douyin.com/user/MS4wLjABAAAA..."],
  "resultsPerPage": 20,
  "shouldDownloadVideos": false,
  "shouldDownloadCovers": false,
  "shouldDownloadSubtitles": false
}
```

无需修改。如果需要调整抓取数量,可修改 [api/douyin-analyzer.py#L169](api/douyin-analyzer.py#L169) 的 `resultsPerPage` 参数。

### 步骤 3: 数据结构说明

✅ **已适配 clockworks/tiktok-scraper 返回格式**

该 Actor 返回的每个 item 是一个视频对象,包含:
- `authorMeta` 或 `author`: 账号信息
  - `name` / `nickname`: 昵称
  - `signature` / `bio`: 简介
  - `fans` / `followerCount`: 粉丝数
  - `video` / `videoCount`: 作品数
  - `heart` / `heartCount`: 获赞数
- `text` / `desc`: 视频标题
- `diggCount`: 点赞数
- `commentCount`: 评论数
- `shareCount`: 分享数
- `playCount`: 播放数

数据清洗逻辑已在 [api/douyin-analyzer.py#L83-L143](api/douyin-analyzer.py#L83-L143) 实现。

### 步骤 4: 部署到 Vercel

#### 方式 A: Git 自动部署
```bash
git add .
git commit -m "Add Apify douyin analyzer"
git push
```

#### 方式 B: Vercel CLI
```bash
vercel --prod
```

### 步骤 5: 测试 API

```bash
# 健康检查
curl https://your-project.vercel.app/api/douyin-analyzer

# 测试分析
curl -X POST https://your-project.vercel.app/api/douyin-analyzer \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.douyin.com/user/MS4wLjABAAAA..."}'
```

## ⚠️ 重要提醒

### 1. Vercel 超时限制

| 套餐 | 超时限制 | 是否可用 |
|------|---------|---------|
| Hobby (免费) | 10 秒 | ❌ 无法使用 (Apify 需 30-120 秒) |
| Pro | 60 秒 | ⚠️ 勉强可用 (有风险) |

**建议**:
- 升级到 Vercel Pro ($20/月)
- 或部署到 Railway/Render (无超时限制)

### 2. 数据清洗逻辑

当前 `clean_douyin_data()` 函数支持以下字段:
- 账号信息: nickname, signature, follower_count, aweme_count, total_favorited
- 视频列表: desc, digg_count, comment_count, share_count

如果 Actor `pHREl3foKd6pc4Jcg` 返回的数据结构不同,您需要调整提取逻辑。

### 3. 前端集成

如果要在 Next.js 前端调用这个 API,修改 [app/api/generate/route.ts#L2266-L2276](app/api/generate/route.ts#L2266-L2276):

```typescript
// 当前是调用 Jina Reader,需要改为调用 Vercel 上的 Apify API
if (agentId === 'douyin-account-analyzer') {
  const response = await fetch('https://your-project.vercel.app/api/douyin-analyzer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: formData.url })
  })

  const data = await response.json()
  return NextResponse.json(data)
}
```

## 🐛 常见问题

### 问题 1: "环境变量 APIFY_API_TOKEN 未设置"
**解决**: 在 Vercel 项目设置中添加环境变量,然后重新部署。

### 问题 2: "Function execution timed out"
**解决**:
- 升级到 Vercel Pro
- 或部署到 Railway: https://railway.app (推荐)

### 问题 3: "Apify 未返回任何数据"
**原因**: Actor 输入参数格式错误或 URL 格式不正确
**解决**:
1. 在 Apify 网站手动测试 Actor
2. 检查 `run_input` 参数格式
3. 查看 Vercel 函数日志

### 问题 4: 提取的数据不正确
**原因**: Actor 返回的字段名与代码不匹配
**解决**: 修改 `clean_douyin_data()` 函数的字段映射

## 📊 成本估算

- **Apify**: 免费额度 $5/月,每次约 $0.01-0.05
- **DeepSeek**: 约 $0.001/次
- **Vercel Pro**: $20/月

**总计**: 约 $20/月 (假设 200-500 次分析/月)

## 🚀 下一步优化

1. **添加缓存**: 相同 URL 24 小时内复用结果
2. **异步队列**: 解决 Vercel 超时问题
3. **错误重试**: Apify 失败自动重试 3 次
4. **流式输出**: 边抓取边返回数据

## 📝 相关文档

- 完整部署指南: [APIFY-DEPLOYMENT.md](APIFY-DEPLOYMENT.md)
- Apify API 文档: https://docs.apify.com/api/client/python
- Vercel 部署文档: https://vercel.com/docs/functions/serverless-functions/runtimes/python
