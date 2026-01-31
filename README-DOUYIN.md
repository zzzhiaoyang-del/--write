# 抖音账号拆解功能

这是一个集成了 Jina Reader 和 DeepSeek AI 的抖音账号拆解工具。

## 功能特点

- 链接内容自动抓取（Jina Reader）
- AI 智能分析（DeepSeek）
- 专业的账号拆解报告
- 云端和本地双模式支持

## 环境配置

### 1. 复制环境变量模板

```bash
cp .env.example .env.local
```

### 2. 配置 API Keys

在 `.env.local` 文件中填入你的 API Keys：

```env
JINA_API_KEY=your_jina_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### 3. Vercel 部署配置

如果要部署到 Vercel，需要在 Vercel 项目设置中添加环境变量：

1. 进入 Vercel 项目设置
2. 选择 "Environment Variables"
3. 添加以下变量：
   - `JINA_API_KEY`: 你的 Jina API Key
   - `DEEPSEEK_API_KEY`: 你的 DeepSeek API Key

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 `http://localhost:3000/marketplace` 查看 AI 员工列表。

## 技术栈

- Next.js 14
- TypeScript
- Jina Reader API
- DeepSeek API
- Tailwind CSS
