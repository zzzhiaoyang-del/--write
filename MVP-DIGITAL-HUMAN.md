# 🚀 数字人克隆功能 - 最小MVP方案

## 🎯 MVP特点

- ✅ **零成本**：不需要任何付费API
- ✅ **10分钟**：完整功能跑通
- ✅ **可演示**：UI完全可用，流程完整
- ✅ **易升级**：后续1分钟升级到真实API

## 📋 快速启动（3步）

### 第1步：创建数据库表（2分钟）

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard)
2. 左侧菜单 → **SQL Editor** → **New query**
3. 复制粘贴以下SQL，点击 **Run**

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

-- 启用行级安全
ALTER TABLE digital_humans ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的数字人
CREATE POLICY "Users can view own digital humans"
  ON digital_humans FOR SELECT
  USING (auth.uid() = user_id);

-- 用户可以创建自己的数字人
CREATE POLICY "Users can insert own digital humans"
  ON digital_humans FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 第2步：创建存储桶（2分钟）

1. Supabase Dashboard → 左侧菜单 → **Storage**
2. 点击 **New bucket**
3. 填写：
   - **Bucket name**: `digital-human-videos`
   - **勾选** "Public bucket"
4. 点击 **Create bucket**

### 第3步：测试功能（5分钟）

```bash
# 启动开发服务器
npm run dev
```

访问页面：
- **创建数字人**: http://localhost:3000/digital-human
- **数字人列表**: http://localhost:3000/digital-human/list

## 🎬 MVP工作流程

1. **用户上传视频** → 保存到 Supabase Storage
2. **创建数字人** → 保存到数据库（状态: processing）
3. **3秒后自动完成** → 状态更新为 completed
4. **列表页查看** → 显示"已完成"状态

> 💡 **MVP说明**：当前使用模拟数据，不调用真实API，但完整流程可演示。

## 🎯 测试检查清单

- [ ] 可以访问创建页面
- [ ] 可以上传视频（任意视频文件）
- [ ] 可以填写名称和选择分类
- [ ] 点击提交后显示成功
- [ ] 列表页可以看到新创建的数字人
- [ ] 3秒后刷新页面，状态变为"已完成"

## 🔧 遇到问题？

### 问题1: 上传失败
**原因**: Storage bucket 未创建或非public
**解决**: 检查第2步，确保勾选了 "Public bucket"

### 问题2: 保存失败
**原因**: 数据库表未创建或RLS策略有问题
**解决**: 重新执行第1步的SQL

### 问题3: 未登录错误
**原因**: 用户未登录
**解决**: 先访问你的登录页面登录

## 🚀 升级到生产环境（1分钟）

当MVP验证通过，需要真实数字人功能时：

### 方案A: HeyGen（推荐，效果最好）

1. 注册 HeyGen: https://app.heygen.com/
2. 获取 API Key
3. 在 `.env.local` 添加:
   ```bash
   HEYGEN_API_KEY=your_api_key_here
   ```
4. 编辑 `app/api/digital-human/clone/route.ts`
5. 取消注释第24-37行（HeyGen API调用）
6. 注释掉第53行（模拟数据）

### 方案B: D-ID（性价比高）

1. 注册 D-ID: https://www.d-id.com/
2. 获取 API Key
3. 在 `.env.local` 添加:
   ```bash
   DID_API_KEY=your_api_key_here
   ```
4. 取消注释第40-50行（D-ID API调用）

## 💰 成本对比

| 方案 | MVP成本 | 生产成本 | 效果 |
|------|---------|----------|------|
| MVP模式 | **$0** | - | 仅演示 |
| HeyGen | - | $30-50/分身 | ⭐⭐⭐⭐⭐ |
| D-ID | - | $10-20/分身 | ⭐⭐⭐⭐ |
| 腾讯智影 | - | 按量计费 | ⭐⭐⭐⭐ |

## 📝 下一步优化

1. **Webhook回调**: 监听数字人创建状态
2. **进度条**: 实时显示处理进度
3. **视频预览**: 上传前预览视频
4. **批量创建**: 一次上传多个视频
5. **使用数字人**: 文字转视频功能

---

**当前状态**: ✅ MVP模式（模拟数据）
**升级耗时**: 1分钟
**适用场景**: 快速验证产品、演示给客户、测试流程
