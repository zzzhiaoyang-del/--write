# Supabase Google 登录配置指南

本指南将帮助你配置 Supabase 和 Google OAuth 以实现 Google 登录功能。

## 📋 目录

1. [创建 Supabase 项目](#1-创建-supabase-项目)
2. [配置 Google OAuth](#2-配置-google-oauth)
3. [配置 Supabase Google Provider](#3-配置-supabase-google-provider)
4. [配置环境变量](#4-配置环境变量)
5. [测试登录功能](#5-测试登录功能)

## 1. 创建 Supabase 项目

### 步骤 1.1: 注册/登录 Supabase

1. 访问 [https://supabase.com](https://supabase.com)
2. 点击 "Start your project" 或 "Sign in"
3. 使用 GitHub 账号登录（推荐）

### 步骤 1.2: 创建新项目

1. 在 Dashboard 中点击 "New Project"
2. 填写项目信息：
   - **Name**: `ai-agent-platform`（或你喜欢的名称）
   - **Database Password**: 设置一个强密码（保存好！）
   - **Region**: 选择离你最近的区域（例如：Northeast Asia (Tokyo)）
3. 点击 "Create new project"
4. 等待项目初始化（约 2 分钟）

### 步骤 1.3: 获取 API Keys

项目创建完成后：

1. 进入 **Project Settings** (左下角齿轮图标) > **API**
2. 找到以下信息：
   - **Project URL**: 类似 `https://xxxxx.supabase.co`
   - **anon public**: 以 `eyJ` 开头的长字符串

3. 复制这两个值，稍后需要用到

## 2. 配置 Google OAuth

### 步骤 2.1: 创建 Google Cloud 项目

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 登录你的 Google 账号
3. 点击顶部的项目选择器，然后点击 "新建项目"
4. 输入项目名称（例如：`AI Agent Platform`），点击"创建"

### 步骤 2.2: 启用 Google+ API

1. 在左侧菜单中选择 **APIs & Services** > **Library**
2. 搜索 "Google+ API"
3. 点击 "Google+ API"，然后点击 "启用"

### 步骤 2.3: 配置 OAuth 同意屏幕

1. 进入 **APIs & Services** > **OAuth consent screen**
2. 选择 **External**（外部），点击 "创建"
3. 填写应用信息：
   - **App name**: `AI超级员工平台`
   - **User support email**: 你的邮箱
   - **Developer contact information**: 你的邮箱
4. 点击 "保存并继续"
5. **Scopes** 页面：点击 "保存并继续"（使用默认）
6. **Test users** 页面：
   - 点击 "ADD USERS"
   - 添加你的 Google 邮箱（用于测试）
   - 点击 "保存并继续"
7. 点击 "返回到信息中心"

### 步骤 2.4: 创建 OAuth 2.0 凭据

1. 进入 **APIs & Services** > **Credentials**
2. 点击顶部 "+ CREATE CREDENTIALS"
3. 选择 "OAuth client ID"
4. 应用类型选择 **Web application**
5. 填写信息：
   - **Name**: `AI Agent Platform Web Client`
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     https://你的生产域名.com
     ```
   - **Authorized redirect URIs**:
     ```
     https://你的项目ID.supabase.co/auth/v1/callback
     ```

     ⚠️ **重要**: 将 `你的项目ID` 替换为你的 Supabase Project URL 中的项目 ID

     例如：如果你的 Supabase URL 是 `https://abcdefgh.supabase.co`，
     则填写：`https://abcdefgh.supabase.co/auth/v1/callback`

6. 点击 "创建"
7. 复制显示的 **Client ID** 和 **Client Secret**（保存好！）

## 3. 配置 Supabase Google Provider

### 步骤 3.1: 启用 Google Provider

1. 返回 Supabase Dashboard
2. 进入 **Authentication** > **Providers**
3. 找到 **Google**，点击展开
4. 打开 "Enable Sign in with Google"

### 步骤 3.2: 填入 Google OAuth 凭据

1. 将刚才复制的 Google **Client ID** 粘贴到对应字段
2. 将 Google **Client Secret** 粘贴到对应字段
3. 点击 "Save"

## 4. 配置环境变量

### 步骤 4.1: 创建本地环境变量文件

在项目根目录创建 `.env.local` 文件：

```bash
# 在项目根目录执行
cp .env.local.example .env.local
```

### 步骤 4.2: 填写环境变量

编辑 `.env.local` 文件，填入你的实际值：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://你的项目ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_anon_key

# DeepSeek API (如果有)
DEEPSEEK_API_KEY=your_deepseek_api_key

# Apify (如果有)
APIFY_API_TOKEN=your_apify_token
```

### 步骤 4.3: 配置生产环境（Railway/Vercel）

如果部署到 Railway 或 Vercel，需要在平台的环境变量设置中添加：

**Railway**:
1. 进入你的项目
2. 点击 "Variables" 标签
3. 添加 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Vercel**:
1. 进入项目 Settings
2. 选择 Environment Variables
3. 添加对应的环境变量

## 5. 测试登录功能

### 步骤 5.1: 启动开发服务器

```bash
npm run dev
```

### 步骤 5.2: 测试登录流程

1. 访问 `http://localhost:3000`
2. 点击导航栏右上角的 "登录" 按钮
3. 点击 "使用 Google 登录"
4. 选择你的 Google 账号
5. 授权应用访问
6. 应该会重定向回首页，并显示你的用户信息

### 步骤 5.3: 验证登录状态

登录成功后：
- 导航栏应显示用户头像/图标
- 点击头像应显示下拉菜单，包含：
  - 用户名和邮箱
  - 个人资料链接
  - 我的 AI 员工链接
  - 登出按钮

### 步骤 5.4: 在 Supabase 中查看用户

1. 返回 Supabase Dashboard
2. 进入 **Authentication** > **Users**
3. 应该能看到刚才登录的用户信息

## 🐛 常见问题排查

### 问题 1: "Invalid Redirect URI" 错误

**原因**: Google OAuth 的重定向 URI 配置不正确

**解决方案**:
1. 检查 Google Cloud Console 中的 Authorized redirect URIs
2. 确保格式为：`https://你的项目ID.supabase.co/auth/v1/callback`
3. 注意不要有多余的空格或 `/`

### 问题 2: "Client ID not found" 错误

**原因**: Supabase 中的 Google Client ID 配置错误

**解决方案**:
1. 重新检查 Supabase > Authentication > Providers > Google
2. 确保 Client ID 和 Client Secret 正确无误
3. 点击 Save 保存配置

### 问题 3: 登录后没有重定向

**原因**: 环境变量未正确加载

**解决方案**:
1. 确认 `.env.local` 文件在项目根目录
2. 重启开发服务器（`Ctrl+C` 然后 `npm run dev`）
3. 检查浏览器控制台是否有错误信息

### 问题 4: "access_denied" 错误

**原因**: Google OAuth 同意屏幕配置问题

**解决方案**:
1. 确保你的 Google 账号已添加到 Test users
2. 如果是在生产环境，需要将应用状态从 "Testing" 改为 "In production"

## 📚 相关文档

- [Supabase Auth 文档](https://supabase.com/docs/guides/auth)
- [Supabase Google OAuth 指南](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Supabase 服务器端认证](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Google OAuth 2.0 文档](https://developers.google.com/identity/protocols/oauth2)

## 🎉 完成

恭喜！你已经成功配置了 Supabase Google 登录功能。现在用户可以使用 Google 账号登录你的应用了。

## 🔐 安全提示

1. ✅ 永远不要将 `.env.local` 提交到 Git
2. ✅ 定期轮换 API keys 和 secrets
3. ✅ 在生产环境使用 HTTPS
4. ✅ 启用 Supabase 的 RLS (Row Level Security) 保护数据
5. ✅ 监控 Supabase 的用量和日志
