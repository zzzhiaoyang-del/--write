# Playwright 抖音抓取模块 - 安装和使用指南

## 版本信息

- main.py 版本: 2.0 (Playwright 版本)
- 已移除 Jina Reader 依赖
- 仅需 DeepSeek API Key

## 环境要求

- Python 3.8 或更高版本
- Windows / macOS / Linux

## 安装步骤

### 1. 安装 Python 依赖

```bash
pip install -r requirements.txt
```

或手动安装:

```bash
pip install fastapi==0.109.0 uvicorn[standard]==0.27.0 python-dotenv==1.0.0 requests==2.31.0 openai==1.12.0 pydantic==2.5.3 playwright==1.40.0 playwright-stealth==1.0.6
```

### 2. 安装 Playwright 浏览器

**重要**: 安装完 Python 包后,必须单独安装浏览器驱动。

```bash
playwright install chromium
```

如果遇到网络问题,可以设置镜像:

```bash
# Windows CMD
set PLAYWRIGHT_DOWNLOAD_HOST=https://npmmirror.com/mirrors/playwright/
playwright install chromium

# Linux / macOS
export PLAYWRIGHT_DOWNLOAD_HOST=https://npmmirror.com/mirrors/playwright/
playwright install chromium
```

### 3. 配置环境变量

编辑 `.env` 文件:

```env
# DeepSeek API Key (必需)
DEEPSEEK_API_KEY=sk-your-deepseek-api-key

# 注意: 不再需要 JINA_API_KEY
```

## 启动服务

```bash
python main.py
```

启动成功后,你会看到:

```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

访问 http://localhost:8000 可以查看健康状态:

```json
{
  "status": "ok",
  "message": "抖音账号拆解 API 正常运行 (Playwright 版本)",
  "version": "2.0"
}
```

## 调试模式

如果需要查看浏览器运行过程(调试抓取问题),可以修改 [main.py:334](main.py#L334):

```python
# 修改前 (无头模式)
content = await fetch_douyin_content_with_playwright(request.url, headless=True)

# 修改后 (有头模式,可以看到浏览器窗口)
content = await fetch_douyin_content_with_playwright(request.url, headless=False)
```

## 工作原理

### 1. 浏览器配置

- 使用 Chromium 浏览器
- 移动端 User-Agent (模拟 iPhone)
- 移动端视口 (375x812)
- playwright-stealth 反检测

### 2. 数据提取

Playwright 会自动提取以下数据:

- **RENDER_DATA**: 抖音服务端渲染的 JSON 数据 (包含完整账号信息)
- **昵称**: 多选择器尝试 (h1.account-name, [class*="nickname"] 等)
- **简介**: 个性签名/描述
- **统计数据**: 粉丝数、点赞数等
- **视频标题**: 最近 10 个视频标题
- **页面文本**: 完整页面文本 (前 5000 字符)

### 3. 输出格式

提取的数据会格式化为 Markdown,然后传递给 DeepSeek AI 进行分析。

## API 使用

### 请求示例

```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.douyin.com/user/MS4wLjABAAAA..."}'
```

### 响应格式

使用 Server-Sent Events (SSE) 流式返回:

```
data: 根据
data: 您提供的
data: 抖音账号数据
...
data: [DONE]
```

## 常见问题

### 1. 浏览器安装失败

**问题**: `playwright install chromium` 下载超时

**解决**:
```bash
# 使用国内镜像
export PLAYWRIGHT_DOWNLOAD_HOST=https://npmmirror.com/mirrors/playwright/
playwright install chromium
```

### 2. 抓取失败

**问题**: `Playwright 抓取失败: Timeout 30000ms exceeded`

**可能原因**:
- 网络问题
- 抖音反爬机制升级
- URL 格式不正确

**解决**:
1. 使用调试模式查看浏览器行为 (`headless=False`)
2. 增加超时时间 (修改 [main.py:130](main.py#L130) 的 `timeout=30000`)
3. 检查 URL 是否正确

### 3. 提取不到数据

**问题**: 返回 "未知" 或 "未提取到简介"

**可能原因**: 抖音页面结构变化

**解决**:
1. 使用 `headless=False` 模式查看实际页面
2. 在浏览器中检查元素,找到正确的 CSS 选择器
3. 修改 [main.py:157-163](main.py#L157-L163) 的选择器列表

### 4. DeepSeek 分析失败

**问题**: `AI 分析失败: Invalid API key`

**解决**:
1. 检查 `.env` 文件中的 `DEEPSEEK_API_KEY`
2. 确认 API Key 有效且有足够额度

## 技术特性

### 反检测措施

- `playwright-stealth`: 隐藏 WebDriver 特征
- `--disable-blink-features=AutomationControlled`: 禁用自动化控制标识
- 移动端 User-Agent: 降低风险,触发移动版页面 (结构更简单)
- 自然等待: `await asyncio.sleep(3)` 模拟人类浏览

### 性能优化

- 使用 `wait_until='networkidle'`: 等待网络空闲
- 文本截断: 最大 30000 字符,避免超长输入
- 异步处理: 使用 `async/await` 提升性能

## 与 Next.js 集成

目前 Next.js 版本仍然调用 `localhost:8000` 后端。

如需修改,编辑 [app/api/generate/route.ts](app/api/generate/route.ts):

```typescript
const response = await fetch('http://localhost:8000/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: formData.url })
})
```

## 升级说明

### 从 Jina 版本 (v1.0) 迁移到 Playwright 版本 (v2.0)

1. **更新代码**: 已完成,main.py 已替换为 Playwright 版本
2. **更新依赖**: 运行 `pip install -r requirements.txt`
3. **安装浏览器**: 运行 `playwright install chromium`
4. **移除旧配置**: `.env` 中的 `JINA_API_KEY` 不再需要 (但保留也不影响)
5. **重启服务**: `python main.py`

## 下一步优化建议

1. **代理支持**: 添加代理配置,提高稳定性
2. **Cookie 管理**: 支持登录状态,获取更多数据
3. **智能重试**: 失败时自动重试 3 次
4. **选择器配置化**: 将选择器移到配置文件,方便维护
5. **截图功能**: 保存页面截图用于调试

## 许可证

本项目仅供学习和研究使用,请遵守抖音平台的服务条款。
