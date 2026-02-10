# Vercel 部署 D-ID API 配置指南

## 网站地址
https://write-sigma.vercel.app/digital-assets/clone-avatar

## 环境变量配置

### 步骤 1: 登录 Vercel 控制台

1. 访问 https://vercel.com/dashboard
2. 选择你的项目（write-sigma）
3. 进入 **Settings** → **Environment Variables**

### 步骤 2: 添加 D-ID API 环境变量

在 Vercel 环境变量页面添加以下变量：

#### 必需的环境变量

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `D_ID_API_KEY` | `enp6aGlhb3lhbmdAZ21haWwuY29t:NTsMRhLQTUQrVDp2pXoBZ` | Production, Preview, Development |
| `D_ID_BASE_URL` | `https://api.d-id.com` | Production, Preview, Development |

#### 已有的环境变量（确认存在）

| 变量名 | 说明 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务角色密钥 |
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 |
| `APIFY_API_TOKEN` | Apify API Token |

### 步骤 3: 删除或禁用旧的百度云环境变量

如果存在以下变量，可以删除或保留（已不再使用）：

- `BAIDU_API_KEY`
- `BAIDU_SECRET_KEY`

### 步骤 4: 重新部署

添加环境变量后，需要重新部署才能生效：

#### 方法 1: 通过 Vercel 控制台
1. 进入 **Deployments** 页面
2. 找到最新的部署
3. 点击右侧的 **...** 菜单
4. 选择 **Redeploy**

#### 方法 2: 通过 Git 推送
```bash
# 创建一个空提交触发重新部署
git commit --allow-empty -m "触发 Vercel 重新部署以应用 D-ID 环境变量"
git push origin master
```

## 测试步骤

### 1. 等待部署完成

在 Vercel 控制台查看部署状态，等待显示 "Ready"。

### 2. 测试图片克隆

1. 访问 https://write-sigma.vercel.app/digital-assets/clone-avatar
2. 选择"图片克隆"
3. 上传一张人物图片
4. 填写数字人名称
5. 点击"创建数字人"
6. 打开浏览器开发者工具（F12）查看控制台日志
7. 应该看到 "D-ID 图片克隆 API 调用成功"

### 3. 测试视频克隆

1. 选择"视频克隆"
2. 上传一段人物视频
3. 填写数字人名称
4. 点击"创建数字人"
5. 检查控制台日志

### 4. 测试视频生成

1. 选择已创建的数字人
2. 输入口播文本（例如："大家好，我是AI数字人"）
3. 点击"生成视频"
4. 等待后台处理（约30秒-2分钟）
5. 刷新页面查看生成的视频

## 故障排查

### 问题 1: API 调用失败 - 401 Unauthorized

**症状**: 控制台显示 "D-ID API 调用失败: 401"

**解决方案**:
1. 检查 Vercel 环境变量中的 `D_ID_API_KEY` 是否正确
2. 确认 API Key 格式正确（应该是 `username:password` 格式）
3. 重新部署项目

### 问题 2: 环境变量未生效

**症状**: 控制台显示 "未配置 D-ID API，使用模拟数据"

**解决方案**:
1. 确认环境变量已添加到 **Production** 环境
2. 检查变量名是否完全匹配（区分大小写）
3. 重新部署项目（添加环境变量后必须重新部署）

### 问题 3: CORS 错误

**症状**: 浏览器控制台显示 CORS 相关错误

**解决方案**:
- D-ID API 调用是在服务端进行的，不应该有 CORS 问题
- 如果出现 CORS 错误，可能是前端直接调用了 API
- 确保所有 D-ID API 调用都通过 Next.js API 路由进行

### 问题 4: 图片/视频 URL 无法访问

**症状**: D-ID API 返回错误 "Unable to access image/video URL"

**解决方案**:
1. 确保上传的图片/视频已成功保存到 Supabase Storage
2. 检查 Supabase Storage Bucket 的公开访问权限
3. 验证 URL 是否可以在浏览器中直接访问

## Vercel 部署配置检查

### vercel.json（如果存在）

确保没有限制 API 路由的配置：

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["hkg1"]
}
```

### 函数超时设置

D-ID API 调用可能需要较长时间，确保函数超时设置足够：

1. 在 Vercel 控制台进入 **Settings** → **Functions**
2. 检查 **Function Max Duration**
3. 建议设置为 60 秒或更长（Pro 计划支持）

## 监控和日志

### 查看实时日志

1. 在 Vercel 控制台进入 **Deployments**
2. 点击最新的部署
3. 选择 **Functions** 标签
4. 查看 API 路由的执行日志

### 常见日志信息

**成功的日志**:
```
=== 开始处理视频生成请求 ===
环境变量检查:
- D_ID_API_KEY: 已设置
D-ID API 调用成功，任务ID: xxx
已启动后台轮询: 作品ID xxx, 任务ID xxx
```

**失败的日志**:
```
D-ID API 调用失败: [错误信息]
```

## 数据库迁移

### 在 Supabase 中执行迁移脚本

1. 登录 Supabase 控制台: https://supabase.com/dashboard
2. 选择你的项目
3. 进入 **SQL Editor**
4. 复制 `database/migrate-to-did.sql` 的内容
5. 点击 **Run** 执行脚本
6. 确认执行成功

## 性能优化建议

### 1. 启用 Edge Functions（可选）

如果需要更快的响应速度，可以考虑将 API 路由迁移到 Edge Functions。

### 2. 配置 CDN 缓存

对于生成的视频，可以配置 Vercel CDN 缓存：

```typescript
// 在 API 路由中添加缓存头
export const config = {
  runtime: 'nodejs',
}
```

### 3. 监控 API 使用量

定期检查 D-ID API 的使用量和成本：
- 访问 D-ID 控制台查看 API 调用统计
- 设置使用限额和预算提醒

## 安全建议

### 1. 保护敏感环境变量

- ✅ 使用 Vercel 环境变量（已加密）
- ❌ 不要在代码中硬编码 API Key
- ❌ 不要将 `.env.local` 提交到 Git

### 2. 实施速率限制

考虑在 API 路由中添加速率限制：

```typescript
// 示例：限制每个用户每分钟最多 10 次请求
import rateLimit from 'express-rate-limit'
```

### 3. 验证用户权限

确保所有 API 路由都验证用户登录状态：

```typescript
const { data: { user }, error: authError } = await supabase.auth.getUser()
if (authError || !user) {
  return NextResponse.json({ error: '未登录' }, { status: 401 })
}
```

## 成本估算

### D-ID API 定价（参考）

- 图片克隆: ~$0.05/次
- 视频克隆: ~$0.10/次
- 视频生成: ~$0.03/秒

### Vercel 定价

- Hobby 计划: 免费（有限制）
- Pro 计划: $20/月（更长的函数执行时间）

### 建议

- 在测试阶段控制 API 调用次数
- 设置 D-ID 账户的使用限额
- 监控 Vercel 的函数执行时间

## 联系支持

如遇到问题：

1. **Vercel 支持**: https://vercel.com/support
2. **D-ID 支持**: https://www.d-id.com/contact/
3. **Supabase 支持**: https://supabase.com/support

## 快速检查清单

部署前确认：

- [ ] D-ID API Key 已添加到 Vercel 环境变量
- [ ] Supabase 环境变量已配置
- [ ] 数据库迁移脚本已执行
- [ ] 代码已推送到 GitHub
- [ ] Vercel 已重新部署
- [ ] 浏览器控制台无错误
- [ ] 测试图片克隆功能
- [ ] 测试视频生成功能

---

**配置完成后，访问**: https://write-sigma.vercel.app/digital-assets/clone-avatar

**预计配置时间**: 5-10 分钟
**状态**: 待配置
