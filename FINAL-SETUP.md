# 🎉 Apify 版本最终配置 - clockworks/tiktok-scraper

## 更新摘要

已将 Apify Actor 更新为公开的 `clockworks/tiktok-scraper`,并完成所有配置。

## ✅ 最终配置

### 1. Actor 信息
- **Actor ID**: `clockworks/tiktok-scraper`
- **类型**: 公开 Actor (免费使用,按用量计费)
- **功能**: 抓取 TikTok/Douyin 用户主页和视频数据

### 2. 输入参数格式
```json
{
  "profileURLs": ["https://www.douyin.com/user/MS4wLjABAAAA..."],
  "resultsPerPage": 20,
  "shouldDownloadVideos": false,
  "shouldDownloadCovers": false,
  "shouldDownloadSubtitles": false
}
```

### 3. 返回数据结构
每个 item 是一个视频对象:
```json
{
  "authorMeta": {
    "name": "用户昵称",
    "signature": "个性签名",
    "fans": 123456,
    "video": 100,
    "heart": 999999
  },
  "text": "视频标题",
  "diggCount": 1234,
  "commentCount": 56,
  "shareCount": 78,
  "playCount": 9999
}
```

### 4. 数据提取逻辑
[api/douyin-analyzer.py#L83-L143](api/douyin-analyzer.py#L83-L143) 已适配该格式:
- 从 `authorMeta` 提取账号信息
- 从 `text` / `desc` 提取视频标题
- 从 `diggCount`, `commentCount`, `shareCount`, `playCount` 提取互动数据

### 5. System Prompt
已更新为新版 (强调实战、选题生成):
- 严禁星号符号
- 必须包含 5 个模块: 账号定位、爆款密码、怎么复制、**参考选题(3个)**、避坑指南
- 极度通俗,禁止废话

## 📋 部署步骤

### 1. Vercel 环境变量
在 Vercel 项目设置中添加:
```env
APIFY_API_TOKEN=apify_api_xxxxxxxxxxxxxxxxxxxxxxxxxx
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. 部署
```bash
git add .
git commit -m "Configure clockworks/tiktok-scraper for Douyin analysis"
git push
```

Vercel 会自动部署。

### 3. 测试
```bash
# 健康检查
curl https://your-project.vercel.app/api/douyin-analyzer

# 测试分析
curl -X POST https://your-project.vercel.app/api/douyin-analyzer \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.douyin.com/user/MS4wLjABAAAA..."}'
```

## ⚠️ 重要提醒

### 1. URL 格式
确保使用完整的抖音用户主页 URL:
```
✅ https://www.douyin.com/user/MS4wLjABAAAA...
❌ https://v.douyin.com/... (短链接)
❌ https://www.douyin.com/video/... (视频链接)
```

### 2. Vercel 超时限制
| 套餐 | 超时 | 可用性 |
|------|------|--------|
| Hobby | 10s | ❌ 不可用 |
| Pro | 60s | ⚠️ 勉强可用 |

**建议**: 升级到 Vercel Pro 或使用 Railway。

### 3. Apify 费用
- 免费额度: $5/月
- 每次抓取: 约 $0.01-0.05
- 估算: 免费额度支持 100-500 次分析

### 4. 抓取速度
- Actor 运行时间: 30-120 秒
- 如遇超时,考虑:
  1. 减少 `resultsPerPage` (当前 20)
  2. 使用异步队列 + Webhook
  3. 部署到无超时限制的平台 (Railway)

## 🔧 调优参数

### 增加抓取视频数量
编辑 [api/douyin-analyzer.py#L169](api/douyin-analyzer.py#L169):
```python
"resultsPerPage": 50,  # 改为 50 (会增加运行时间)
```

### 启用代理
如果抓取失败,可以尝试启用 Apify Proxy:
```python
run_input = {
    "profileURLs": [url],
    "resultsPerPage": 20,
    "shouldDownloadVideos": False,
    "shouldDownloadCovers": False,
    "shouldDownloadSubtitles": False,
    "proxy": {
        "useApifyProxy": True,
        "apifyProxyGroups": ["RESIDENTIAL"]  # 住宅代理,更难被检测
    }
}
```

注意: 启用代理会增加费用 (约 $0.05-0.10/次)。

## 📊 性能优化建议

### 1. 添加缓存
在 Vercel 函数中添加 Redis 缓存:
```python
# 伪代码
cache_key = f"douyin:{url}"
cached = redis.get(cache_key)
if cached:
    return cached

# 抓取数据...
redis.setex(cache_key, 86400, result)  # 缓存 24 小时
```

### 2. 异步处理
使用 Vercel Edge Functions + Background Jobs:
```
用户提交 → 返回 task_id (1秒内)
         ↓
    后台运行 Apify (30-120秒)
         ↓
    存储结果到数据库
         ↓
    前端轮询获取结果
```

### 3. 批量分析
一次性分析多个账号:
```python
run_input = {
    "profileURLs": [url1, url2, url3],  # 多个 URL
    "resultsPerPage": 10
}
```

## 🐛 常见问题

### Q1: "Invalid URL" 错误
**原因**: URL 格式不正确或使用了短链接
**解决**: 确保使用完整的用户主页 URL (`https://www.douyin.com/user/...`)

### Q2: "Actor run failed" 错误
**原因**:
- Apify 账号余额不足
- URL 无法访问 (账号被封禁)
- 抖音反爬机制升级

**解决**:
1. 检查 Apify 账户余额
2. 在抖音 App 中确认 URL 可访问
3. 启用代理 (见上文)

### Q3: 提取的数据为空
**原因**:
- Actor 返回的数据结构变化
- 用户主页无视频

**解决**:
1. 在 Apify 网站手动运行 Actor,查看原始返回数据
2. 根据实际字段名调整 `clean_douyin_data()` 函数

### Q4: "Function execution timed out"
**原因**: Vercel 免费版 10 秒超时,Actor 运行需要 30-120 秒

**解决**:
1. 升级到 Vercel Pro ($20/月)
2. 或部署到 Railway (免费,无超时限制)

## 📚 相关文档

- [APIFY-DEPLOYMENT.md](APIFY-DEPLOYMENT.md): 完整部署指南
- [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md): 部署检查清单
- clockworks/tiktok-scraper 文档: https://apify.com/clockworks/tiktok-scraper

## 🚀 下一步

1. ✅ **立即部署**: 按照上述步骤部署到 Vercel
2. ⏳ **测试功能**: 使用真实抖音 URL 测试
3. 🔧 **调优参数**: 根据测试结果调整 `resultsPerPage` 等参数
4. 📈 **监控费用**: 在 Apify 和 Vercel Dashboard 查看用量和费用

准备好了吗? 有任何问题随时问我!
