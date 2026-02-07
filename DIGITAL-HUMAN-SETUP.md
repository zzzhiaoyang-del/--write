# 数字人克隆功能 - 部署指南

## 已创建的文件

1. **前端页面**
   - `app/digital-human/page.tsx` - 创建数字人页面
   - `app/digital-human/list/page.tsx` - 数字人列表页面

2. **API路由**
   - `app/api/digital-human/upload/route.ts` - 视频上传
   - `app/api/digital-human/clone/route.ts` - 数字人克隆
   - `app/api/digital-human/list/route.ts` - 数字人列表

## 快速开始

### 1. 创建 Supabase 表

在 Supabase SQL Editor 中执行：

```sql
-- 创建数字人表
CREATE TABLE digital_humans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  avatar_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  video_url TEXT NOT NULL,
  status TEXT DEFAULT 'processing',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 添加索引
CREATE INDEX idx_digital_humans_user_id ON digital_humans(user_id);
CREATE INDEX idx_digital_humans_status ON digital_humans(status);

-- 启用 RLS
ALTER TABLE digital_humans ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看自己的数字人
CREATE POLICY "Users can view own digital humans"
  ON digital_humans FOR SELECT
  USING (auth.uid() = user_id);

-- 创建策略：用户可以插入自己的数字人
CREATE POLICY "Users can insert own digital humans"
  ON digital_humans FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 2. 创建 Supabase Storage Bucket

在 Supabase Storage 中创建一个新的 bucket：

1. 进入 Storage 页面
2. 点击 "New bucket"
3. 名称: `digital-human-videos`
4. 勾选 "Public bucket" (或配置适当的权限策略)
5. 点击 "Create bucket"

### 3. 选择数字人API服务

#### 选项A: HeyGen (推荐)

**优点：** 效果最好，API稳定
**费用：** 约 $30/分身 起

1. 注册 HeyGen: https://app.heygen.com/
2. 获取 API Key: https://app.heygen.com/settings/api
3. 在 `.env.local` 添加:
   ```bash
   HEYGEN_API_KEY=your_api_key_here
   ```

4. 取消注释 `app/api/digital-human/clone/route.ts` 中的 HeyGen 代码 (第16-25行)

**API文档:** https://docs.heygen.com/reference/create-an-avatar

#### 选项B: D-ID

**优点：** 价格较低
**费用：** 约 $10-20/分身

1. 注册 D-ID: https://www.d-id.com/
2. 获取 API Key
3. 在 `.env.local` 添加:
   ```bash
   DID_API_KEY=your_api_key_here
   ```

4. 取消注释 `app/api/digital-human/clone/route.ts` 中的 D-ID 代码 (第27-36行)

#### 选项C: 腾讯智影 (国内用户)

**优点：** 国内访问快，中文支持好
**费用：** 按量计费

1. 开通智影服务: https://cloud.tencent.com/product/ivld
2. 获取密钥
3. 安装腾讯云 SDK:
   ```bash
   npm install tencentcloud-sdk-nodejs
   ```

#### 选项D: 剪映开放平台

1. 申请开通: https://developer.capcut.cn/
2. 获取 API 凭证

### 4. 安装依赖（如需要）

```bash
npm install
```

### 5. 运行开发服务器

```bash
npm run dev
```

访问: http://localhost:3000/digital-human

## 功能说明

### 用户流程

1. **上传视频** (`/digital-human`)
   - 选择 1-4 分钟的人物视频
   - 输入数字人名称
   - 选择分类
   - 点击提交

2. **处理中**
   - 视频上传到 Supabase Storage
   - 调用数字人API进行克隆
   - 状态保存到数据库

3. **查看列表** (`/digital-human/list`)
   - 显示所有数字人
   - 查看处理状态
   - 使用已完成的数字人

### 技术架构

```
用户上传视频
    ↓
Supabase Storage (视频存储)
    ↓
数字人API (HeyGen/D-ID/智影)
    ↓
Supabase Database (记录状态)
    ↓
用户查看列表
```

## 成本估算

### 最小预算方案 (约 $50/月)

- Supabase: 免费版 (500MB 存储)
- 数字人API: D-ID ($10-20/分身)
- Vercel: 免费版

### 推荐方案 (约 $100/月)

- Supabase: Pro ($25/月, 8GB 存储)
- 数字人API: HeyGen ($30-50/分身)
- Vercel: Pro ($20/月)

## 下一步优化

1. **添加视频预处理**
   - 视频格式转换
   - 视频质量检测
   - 人脸检测

2. **Webhook 回调**
   - 监听数字人创建状态
   - 自动更新数据库

3. **使用数字人**
   - 文字转视频
   - 数字人直播
   - 批量生成视频

4. **付费功能**
   - 限制免费用户创建数量
   - 高级功能需要付费

## 常见问题

### Q: 视频上传失败？
A: 检查 Supabase Storage bucket 是否创建，权限是否正确

### Q: 数字人创建失败？
A: 检查 API Key 是否正确，账户余额是否充足

### Q: 如何监控处理进度？
A: 实现 webhook 回调，或定期轮询 API 状态

## 参考资料

- HeyGen API 文档: https://docs.heygen.com/
- D-ID API 文档: https://docs.d-id.com/
- Supabase 文档: https://supabase.com/docs
- 腾讯智影: https://cloud.tencent.com/product/ivld
