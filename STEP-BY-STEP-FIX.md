# 数字人克隆功能修复指南（一步一步操作）

## 📋 准备工作

在开始之前，请确保：
- ✅ 已安装 Node.js
- ✅ 项目已经运行（`npm run dev`）
- ✅ 浏览器已打开开发者工具（按 F12）

---

## 第一步：检查 Supabase Storage 配置

这是最关键的一步！视频上传需要 Storage 存储桶。

### 1.1 登录 Supabase 控制台

1. 打开浏览器，访问：https://supabase.com
2. 点击右上角 "Sign in" 登录
3. 找到你的项目：`rsudtvmqwuyawhvyyvce`
4. 点击进入项目

### 1.2 检查 Storage 存储桶

1. 在左侧菜单中，点击 **"Storage"** 图标（看起来像一个文件夹）
2. 查看是否存在名为 `digital-human-videos` 的存储桶

### 1.3 如果存储桶不存在，创建它

1. 点击右上角的 **"New bucket"** 按钮
2. 填写信息：
   - **Name**: `digital-human-videos`
   - **Public bucket**: ✅ **勾选这个选项**（非常重要！）
3. 点击 **"Create bucket"**

### 1.4 设置存储桶为公开访问

如果存储桶已存在但不是公开的：

1. 点击存储桶名称旁边的 **"..."** 菜单
2. 选择 **"Edit bucket"**
3. 确保 **"Public bucket"** 已勾选
4. 点击 **"Save"**

---

## 第二步：检查数据库表结构

### 2.1 打开 SQL Editor

1. 在 Supabase 控制台左侧菜单，点击 **"SQL Editor"**
2. 点击 **"New query"**

### 2.2 检查表是否存在

复制并运行以下 SQL：

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'digital_humans'
ORDER BY ordinal_position;
```

### 2.3 如果表不存在或字段不完整，创建/更新表

复制并运行以下 SQL：

```sql
-- 创建 digital_humans 表（如果不存在）
CREATE TABLE IF NOT EXISTS digital_humans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  avatar_id TEXT NOT NULL,
  video_url TEXT,
  status TEXT NOT NULL DEFAULT 'processing',
  did_talk_id TEXT,
  result_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_digital_humans_user_id ON digital_humans(user_id);
CREATE INDEX IF NOT EXISTS idx_digital_humans_status ON digital_humans(status);

-- 启用行级安全策略（RLS）
ALTER TABLE digital_humans ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看自己的数字人
CREATE POLICY IF NOT EXISTS "Users can view own digital humans"
  ON digital_humans FOR SELECT
  USING (auth.uid() = user_id);

-- 创建策略：用户只能插入自己的数字人
CREATE POLICY IF NOT EXISTS "Users can insert own digital humans"
  ON digital_humans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 创建策略：用户只能更新自己的数字人
CREATE POLICY IF NOT EXISTS "Users can update own digital humans"
  ON digital_humans FOR UPDATE
  USING (auth.uid() = user_id);
```

点击 **"Run"** 按钮执行。

---

## 第三步：启动项目并登录

### 3.1 启动开发服务器

打开终端，运行：

```bash
npm run dev
```

等待服务器启动，通常会显示：
```
✓ Ready in 2.3s
○ Local: http://localhost:3000
```

### 3.2 在浏览器中打开应用

1. 打开浏览器
2. 访问：http://localhost:3000
3. **按 F12 打开开发者工具**（非常重要！）

### 3.3 登录应用

1. 如果还没有账号，先注册一个
2. 使用邮箱和密码登录
3. 确保登录成功（通常会跳转到首页）

### 3.4 验证登录状态

在浏览器的 **Console（控制台）** 标签中，输入并运行：

```javascript
fetch('/api/digital-human/list')
  .then(r => r.json())
  .then(data => console.log('登录状态:', data))
```

**预期结果**：
- ✅ 如果返回 `{ humans: [] }`，说明登录成功
- ❌ 如果返回 `{ error: '未登录' }`，说明需要重新登录

---

## 第四步：测试创建数字人

### 4.1 准备测试视频

准备一个小视频文件（建议 < 10MB），要求：
- 格式：MP4、MOV、AVI 等常见视频格式
- 时长：1-4 分钟
- 内容：单人出镜，正面，无遮挡

### 4.2 访问创建页面

1. 在浏览器中访问：http://localhost:3000/digital-human
2. 确保开发者工具仍然打开（F12）
3. 切换到 **Network（网络）** 标签

### 4.3 上传视频并创建

1. 点击 **"上传视频"** 区域
2. 选择你准备的测试视频
3. 填写 **"数字人名称"**，例如：`测试数字人`
4. 选择 **"数字人分类"**，例如：`其他`
5. 点击 **"提交"** 按钮

### 4.4 观察 Network 标签

在 Network 标签中，你应该看到两个请求：

**请求 1: upload**
- URL: `/api/digital-human/upload`
- Method: POST
- Status: 应该是 **200 OK**

点击这个请求，查看 **Response（响应）** 标签：
```json
{
  "videoUrl": "https://...",
  "fileName": "..."
}
```

**请求 2: clone**
- URL: `/api/digital-human/clone`
- Method: POST
- Status: 应该是 **200 OK**

点击这个请求，查看 **Response（响应）** 标签：
```json
{
  "success": true,
  "avatarId": "did_...",
  "message": "🎉 数字人创建成功！（使用 D-ID API）"
}
```

### 4.5 如果出现错误

**错误 1: upload 返回 500**
- 原因：Storage 存储桶不存在或不是公开的
- 解决：回到第一步，检查 Storage 配置

**错误 2: upload 返回 401**
- 原因：用户未登录
- 解决：回到第三步，重新登录

**错误 3: clone 返回 500**
- 原因：D-ID API 调用失败或数据库写入失败
- 解决：查看 Console 标签的错误信息

---

## 第五步：查看数字人列表

### 5.1 访问列表页面

创建成功后，页面会自动跳转到：http://localhost:3000/digital-human/list

### 5.2 观察数字人状态

你应该看到刚创建的数字人卡片，状态显示为 **"处理中"**

### 5.3 等待处理完成

- D-ID API 通常需要 2-5 分钟处理
- 前端会每 5 秒自动检查一次状态
- 当状态变为 **"已完成"** 时，会显示生成的视频

### 5.4 验证数据库记录

在终端运行：

```bash
npx tsx scripts/check-database.ts
```

你应该看到：
```
✅ 成功查询数据库
找到 1 条数字人记录

数字人列表:

1. 测试数字人
   ID: xxx-xxx-xxx
   状态: processing 或 completed
   ...
```

---

## 第六步：常见问题排查

### 问题 1: 上传一直卡住

**检查**：
1. 打开 Network 标签
2. 查看 upload 请求的状态
3. 如果一直 pending，可能是网络问题或文件太大

**解决**：
- 使用更小的视频文件（< 10MB）
- 检查网络连接

### 问题 2: 创建成功但列表为空

**检查**：
1. 确认是否登录
2. 在 Console 运行：
   ```javascript
   fetch('/api/digital-human/list')
     .then(r => r.json())
     .then(console.log)
   ```

**解决**：
- 如果返回空数组，说明数据库中没有记录
- 重新创建一次，观察 Network 标签

### 问题 3: 状态一直是"处理中"

**检查**：
1. 在终端运行：
   ```bash
   npx tsx scripts/check-database.ts
   ```
2. 查看 `did_talk_id` 字段是否有值

**解决**：
- 如果 `did_talk_id` 为空，说明 D-ID API 调用失败
- 检查 D-ID API Key 是否有效：
  ```bash
  node scripts/test-did-api.js
  ```

### 问题 4: D-ID API 积分不足

**检查**：
```bash
node scripts/test-did-api.js
```

查看输出中的 `剩余积分` 数量。

**解决**：
- 如果积分为 0，需要在 D-ID 官网充值
- 访问：https://studio.d-id.com

---

## 第七步：验证完整功能

### 7.1 创建多个数字人

重复第四步，创建 2-3 个数字人，确保：
- 每次都能成功上传
- 每次都能成功创建
- 列表页面能显示所有数字人

### 7.2 测试状态轮询

1. 创建一个数字人
2. 立即访问列表页面
3. 观察状态是否自动更新（每 5 秒）
4. 等待状态变为"已完成"

### 7.3 测试视频播放

当数字人状态为"已完成"时：
1. 列表页面应该显示视频播放器
2. 点击播放，确认视频可以正常播放
3. 点击"在新窗口打开视频"链接，确认可以访问

---

## 🎉 完成！

如果所有步骤都成功，你的数字人克隆功能就完全正常了！

## 📞 如果还有问题

### 运行完整诊断

```bash
node scripts/quick-diagnosis.js
```

### 查看详细日志

1. 打开浏览器 Console 标签
2. 查看红色的错误信息
3. 打开 Network 标签
4. 查看失败请求的 Response

### 提供以下信息寻求帮助

1. 错误截图（Console 和 Network 标签）
2. 诊断脚本的输出
3. 数据库检查脚本的输出
4. 具体的操作步骤

---

## 📚 相关文档

- [D-ID API 文档](https://docs.d-id.com)
- [Supabase Storage 文档](https://supabase.com/docs/guides/storage)
- [详细诊断报告](./DIGITAL-HUMAN-DIAGNOSIS.md)

---

**最后更新**: 2026-02-09
