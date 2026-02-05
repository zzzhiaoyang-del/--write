# 历史记录功能实现指南

## 功能概述

为 AI 智能体平台实现了完整的历史记录功能，包括：
- ✅ 每个 AI 员工的历史记录独立存储
- ✅ 只有登录用户才能访问历史记录
- ✅ 每个用户的历史记录互不干扰
- ✅ 支持查看、删除历史记录
- ✅ 数据安全（使用 Supabase RLS 行级安全策略）

## 数据库设置

### 步骤 1: 在 Supabase 中执行 SQL 迁移

1. 登录你的 Supabase 控制台: https://app.supabase.com
2. 选择你的项目
3. 点击左侧菜单的 "SQL Editor"
4. 创建一个新查询
5. 复制 `supabase/migrations/20240205_create_agent_history.sql` 文件的内容
6. 粘贴到 SQL Editor 中
7. 点击 "Run" 执行

执行成功后，你将看到：
- ✅ 创建了 `agent_history` 表
- ✅ 创建了必要的索引
- ✅ 启用了行级安全策略 (RLS)
- ✅ 设置了权限策略

### 步骤 2: 验证表创建成功

在 Supabase 控制台：
1. 点击左侧菜单的 "Table Editor"
2. 查看是否有 `agent_history` 表
3. 确认表结构包含以下字段：
   - `id` (UUID, 主键)
   - `user_id` (UUID, 外键)
   - `agent_id` (TEXT)
   - `form_data` (JSONB)
   - `result` (TEXT)
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)

## 代码实现说明

### 1. API 路由

#### `/api/history` (GET)
- 获取用户的历史记录
- 参数：
  - `agentId` (可选): 指定 AI 员工 ID
  - `limit` (可选): 返回记录数量，默认 10
- 返回: `{ history: [...] }`

#### `/api/history` (POST)
- 保存新的历史记录
- 请求体:
  ```json
  {
    "agentId": "ip-positioning-expert",
    "formData": { ... },
    "result": "生成的结果..."
  }
  ```
- 返回: `{ success: true, data: {...} }`

#### `/api/history` (DELETE)
- 删除历史记录
- 参数: `id` (历史记录 ID)
- 返回: `{ success: true }`

#### `/api/auth/session` (GET)
- 获取当前用户会话信息
- 返回: `{ user: {...} }` 或 `{ user: null }`

### 2. 页面集成

在 `app/agent/[id]/page.tsx` 中集成了以下功能：

1. **自动加载历史记录**
   - 页面加载时检查用户登录状态
   - 如果已登录，自动加载该 AI 员工的历史记录

2. **保存历史记录**
   - 每次生成结果后，自动保存到数据库
   - 只有登录用户才会保存

3. **查看历史记录**
   - 点击历史记录项，查看详细内容
   - 未登录用户显示"登录后查看历史记录"

4. **删除历史记录**
   - 鼠标悬停显示删除按钮
   - 点击删除按钮删除该条记录

### 3. 权限控制

使用 Supabase 的行级安全策略 (RLS):
- ✅ 用户只能查看自己的历史记录
- ✅ 用户只能创建自己的历史记录
- ✅ 用户只能删除自己的历史记录
- ✅ 未登录用户无法访问任何历史记录

## 使用方法

### 用户使用流程

1. **未登录用户**
   - 可以使用 AI 员工生成内容
   - 历史记录区域显示"登录后查看历史记录"
   - 点击"立即登录"按钮进行登录

2. **已登录用户**
   - 使用 AI 员工生成内容
   - 内容自动保存到历史记录
   - 可以查看之前的历史记录
   - 可以删除不需要的历史记录

### 开发者集成

如果要在其他 AI 员工中使用历史记录功能，参考以下代码：

```typescript
// 1. 保存历史记录
const saveToHistory = async (formData, result) => {
  await fetch('/api/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agentId: 'your-agent-id',
      formData,
      result
    })
  })
}

// 2. 加载历史记录
const loadHistory = async () => {
  const response = await fetch('/api/history?agentId=your-agent-id&limit=10')
  const data = await response.json()
  return data.history
}

// 3. 删除历史记录
const deleteHistory = async (historyId) => {
  await fetch(`/api/history?id=${historyId}`, {
    method: 'DELETE'
  })
}
```

## 测试清单

- [ ] 在 Supabase 中执行 SQL 迁移
- [ ] 确认 `agent_history` 表创建成功
- [ ] 测试未登录用户访问（应显示"登录后查看"）
- [ ] 测试登录用户生成内容（应自动保存）
- [ ] 测试查看历史记录（应显示之前的记录）
- [ ] 测试删除历史记录（应成功删除）
- [ ] 测试多用户隔离（不同用户看不到彼此的记录）

## 故障排除

### 问题 1: 历史记录保存失败
- 检查用户是否已登录
- 检查数据库表是否创建成功
- 查看浏览器控制台错误信息

### 问题 2: 看不到历史记录
- 确认用户已登录
- 检查 RLS 策略是否正确配置
- 查看网络请求是否成功

### 问题 3: 权限错误
- 确认 Supabase RLS 策略已启用
- 检查用户 token 是否有效
- 重新登录尝试

## 下一步优化

可以考虑的功能增强：
- [ ] 添加历史记录搜索功能
- [ ] 支持历史记录分页加载
- [ ] 添加历史记录标签功能
- [ ] 支持导出历史记录
- [ ] 添加历史记录统计分析
