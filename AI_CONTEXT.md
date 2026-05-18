# 陛然 AI (Biran AI) - 最高机密档案与进化蓝图 (AI 助手必读)

> **⚠️ 致所有的 AI 助手 (Claude/Cursor 等)：**
> 你不仅是一个写代码的程序员，你是本项目的首席技术官 (CTO)。在修改代码前，请务必阅读本文件的全部内容！这决定了本项目能否成为一台"全自动内容生产线"。不要偏离此架构进行盲目修改。

## 1. 商业定位与核心飞轮 (Commercial Flywheel)

* **项目名称：** 陛然 AI - 全栈式 AI 数字员工平台
* **核心护城河：** 不是单一 AI 工具，而是"一键内容自动化工作流 (WaaS)"。
* **核心飞轮：** 【眼睛】发现爆款 → 【大脑】原创改写 → 【嘴巴】数字人生成视频
* **终极体验：** 用户丢入一个竞品链接，3 分钟后拿到一个可直接发布的原创数字人短视频。
* **技术栈：** Next.js (App Router) + Vercel (Serverless API) + Supabase (DB & Storage)
* **认证机制：** Google OAuth via Supabase Auth，middleware 自动刷新 session
* **线上地址：** https://write-sigma.vercel.app

## 2. 核心业务模块与架构状态

### 模块 A：嘴巴车间 (数字人工厂) - `/digital-human/create-video`
* **状态：** ⏳ MVP 待测试
* **架构：** Adapter Pattern（适配器模式），前端严禁直接调用第三方接口。
* **数据流：**
  ```
  前端提交 { imageUrl, text, voiceType }
    → POST /api/create-video
      → TTSService.generateAudioFromText(text, voiceType)
        → Edge TTS 生成音频 Buffer → 上传 Supabase digital-human-audios → 返回 public URL
      → VideoGenerationService.generateDigitalHuman(imageUrl, audioUrl, 'sadtalker')
        → 提交 Replicate SadTalker → 返回 predictionId
      → 写入 video_works 表（记录任务状态）
      → 返回 { predictionId, workId }
    → 前端每 5 秒轮询 GET /api/status?predictionId=xxx
      → 返回 processing / completed(含 videoUrl) / failed
    → 完成后前端渲染 <video> 自动播放
  ```
* **关键文件：**
  * `lib/services/TTSService.ts` — 配音服务（Edge TTS，零成本）
  * `lib/services/VideoGenerationService.ts` — 视频生成适配器（当前用 SadTalker）
  * `app/api/create-video/route.ts` — 统一下单接口
  * `app/api/status/route.ts` — 状态轮询接口

### 模块 B：大脑车间 (智能广场) - `/marketplace`
* **状态：** ⏳ 待连通（DeepSeek 余额不足时需充值）
* **商业使命：** 将 DeepSeek 能力产品化，封装成 20+ 个"专家智能体"（预设 System Prompt）。
* **架构：** 所有 Agent 统一走 `POST /api/generate`，根据 `agentId` 匹配不同 System Prompt。

### 模块 C：眼睛车间 (灵感库) - `/inspiration`
* **状态：** ⏳ 待连通
* **商业使命：** 解决用户"不知道发什么"的痛点。
* **技术方案：**
  1. 用户输入抖音/小红书竞品链接
  2. **Jina Reader API** 绕过反爬，提取网页纯文本
  3. **DeepSeek API** 分析提取"爆款标题、痛点逻辑、核心大纲"
  4. 前端渲染真实数据，取代目前的硬编码假数据

## 3. 🚀 终极进化蓝图 (Future Upgrades)

### 进化一：WaaS 一键工作流 (核心商业升级)
* **触发条件：** 模块 A 和模块 B 都跑通后。
* **执行规范：** 在 `/inspiration` 前端增加 "一键生成视频" 按钮。将 DeepSeek 改写后的文案，连同用户默认的 imageUrl 和 voiceType，静默提交给 `/api/create-video`，打通任督二脉。

### 进化二：底层算力替换 (提升品质)
* **触发条件：** 主人要求"升级音色"或"提高视频逼真度"。
* **配音升级：** 替换为火山引擎 TTS / Minimax (海螺AI) / ElevenLabs。
  * 只修改 `lib/services/TTSService.ts`，**保持入参 (text, voiceType) 和出参 (Supabase public URL) 不变**。
* **视觉升级：** 替换为火山引擎 Seedance 2.0 / EchoMimic。
  * 只修改 `lib/services/VideoGenerationService.ts`，激活预留的 `provider === "seedance"` 分支。
  * **绝对不要修改前端页面的 UI 和交互逻辑。**

## 4. 环境变量清单 (Environment Variables)
* `NEXT_PUBLIC_SUPABASE_URL`
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`
* `SUPABASE_SERVICE_ROLE_KEY` — 后端特权操作（TTS 音频上传、Storage 写入）
* `REPLICATE_API_TOKEN` — MVP 视频引擎 (SadTalker)
* `DEEPSEEK_API_KEY` — 大脑引擎 (20+ AI Agent)
* `JINA_API_KEY` — 抓取引擎 (抖音/小红书分析)
*(未来新增的 Key 请自动补充到此处)*

## 5. 铁律 (Iron Rules)
1. **统一错误抛出：** API 必须有顶层 `try-catch`，返回结构化 JSON 错误。
2. **绝对安全：** API 密钥只允许出现在 `.env.local` 和 Server 端代码中，前端严禁出现任何密钥。
3. **保持插座干净：** 任何模型替换只能在 Service 层新增 Adapter 分支，不准重构整个流程。
4. **前端不碰第三方：** 前端只调自己的 `/api/*`，所有第三方 API 调用在 Server 端完成。

## 6. 🤖 自测规范 (AI Self-Check Protocol)
> 由于 AI 无法看到前端网页的真实渲染，**在每次完成核心 API 开发后**，必须主动提供一个 Node.js 测试脚本（如 `test-api.js`），模拟前端 fetch 请求调用接口，`console.log` 输出完整的响应数据、耗时、每一步状态。让用户在终端运行 `node test-api.js` 并反馈结果，以此确认真实物理链路是否跑通，而非凭代码逻辑盲目自信。

*(EOF - 每次开启新对话，请 AI 回复："已读取最高商业机密档案，随时准备进化！")*
