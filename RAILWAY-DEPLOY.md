# Railway 部署指南 - 抖音账号拆解 API

## 环境变量配置

在 Railway 项目中添加以下环境变量：

### DEEPSEEK_API_KEY
```
sk-xxxxxxxxxxxxxxxxxxxxxxxx
```
（使用你从 DeepSeek 平台获取的真实密钥）

### APIFY_API_TOKEN
```
apify_api_xxxxxxxxxxxxxxxxxxxxxxxx
```
（使用你从 Apify 控制台获取的真实 Token）

## 部署步骤

### 1. 创建 Railway 项目

1. 访问 https://railway.app/
2. 使用 GitHub 账号登录
3. 点击「New Project」
4. 选择「Deploy from GitHub repo」
5. 选择你的仓库（应该已经推送到 GitHub）

### 2. 配置环境变量

在 Railway 项目页面：

1. 点击项目名称进入设置
2. 点击「Variables」标签
3. 点击「New Variable」
4. 添加第一个变量：
   - Variable Name: `DEEPSEEK_API_KEY`
   - Variable Value: （你的 DeepSeek API Key）

5. 再次点击「New Variable」
6. 添加第二个变量：
   - Variable Name: `APIFY_API_TOKEN`
   - Variable Value: （你的 Apify API Token）

### 3. 自动部署

Railway 会自动：
- 识别 `requirements.txt` 安装依赖
- 识别 `Procfile` 启动服务
- 分配公网域名

### 4. 获取 API 地址

部署完成后：
1. 在 Railway 项目页面点击「Settings」
2. 找到「Domains」部分
3. 点击「Generate Domain」生成公网地址
4. 复制生成的 URL（格式：`https://xxxx.up.railway.app`）

## 测试部署

部署完成后，使用以下命令测试：

```bash
# 健康检查
curl https://your-app.up.railway.app/

# 分析抖音账号（替换为真实链接）
curl -X POST https://your-app.up.railway.app/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.douyin.com/user/MS4wLjABAAAA..."}'
```

## 查看日志

在 Railway 项目页面：
1. 点击「Deployments」标签
2. 选择最新的部署
3. 查看实时日志输出

## 预期输出

成功启动后，日志应该显示：
```
INFO:     Started server process [1]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:xxxx
```

## 常见问题

### Q: 部署失败，显示缺少模块

A: 确保 `requirements.txt` 包含所有依赖：
```
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-dotenv==1.0.0
requests==2.31.0
openai==1.12.0
pydantic==2.5.3
apify-client==1.7.1
```

### Q: 环境变量不生效

A: 检查变量名称是否完全一致（区分大小写）

### Q: API 请求超时

A: Apify 抓取需要 30-120 秒，这是正常现象

## 成本估算

### Railway 费用
- Hobby 计划：$5/月（500 小时免费）
- 或使用免费试用额度

### API 调用费用
- Apify: ~$0.01-0.05 / 次
- DeepSeek: ~$0.001-0.005 / 次
- 总成本: ~$0.01-0.06 / 次分析

## 安全建议

⚠️ **重要提醒**:
1. 本文档包含真实的 API Keys
2. 请妥善保管，不要公开分享
3. 建议定期轮换密钥
4. 部署完成后可删除此文档

## 下一步

部署成功后：
- [ ] 获取公网 URL
- [ ] 测试健康检查接口
- [ ] 使用真实抖音链接测试分析功能
- [ ] 前端对接（如需要）

---

**当前状态**: ✅ 环境变量已配置，可以开始部署
