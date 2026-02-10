# D-ID API 迁移指南

## 迁移完成状态 ✅

已成功将数字人后端从百度云API迁移到D-ID API。

## 已完成的工作

### 1. 代码迁移
- ✅ 创建 D-ID API 服务封装层 (`lib/services/did.service.ts`)
- ✅ 更新图片克隆API (`app/api/digital-human/clone-image/route.ts`)
- ✅ 更新视频克隆API (`app/api/digital-human/clone-video/route.ts`)
- ✅ 更新视频生成API (`app/api/digital-human/create-video/route.ts`)
- ✅ 更新任务轮询服务 (`lib/services/task-polling.ts`)
- ✅ 配置环境变量 (`.env.local`)

### 2. 数据库准备
- ✅ 创建数据库迁移脚本 (`database/migrate-to-did.sql`)
- ⚠️ **需要执行**：在 Supabase 中运行迁移脚本

### 3. 环境配置
- ✅ D-ID API Key 已配置
- ✅ Supabase 配置已存在

## 下一步操作

### 步骤 1: 执行数据库迁移

在 Supabase SQL Editor 中执行以下脚本：

```bash
# 文件位置
database/migrate-to-did.sql
```

该脚本将：
- 添加 `presenter_id` 字段到 `digital_humans` 和 `video_works` 表
- 确保 `did_talk_id` 字段存在
- 创建索引以提高查询性能

### 步骤 2: 重启开发服务器

```bash
npm run dev
```

### 步骤 3: 测试功能

#### 测试 1: 图片克隆数字人
1. 访问克隆形象页面
2. 上传一张人物图片
3. 填写数字人名称
4. 点击"创建数字人"
5. 检查控制台日志，应该看到 "D-ID 图片克隆 API 调用成功"

#### 测试 2: 视频克隆数字人
1. 访问克隆形象页面
2. 上传一段人物视频
3. 填写数字人名称
4. 点击"创建数字人"
5. 检查控制台日志，应该看到 "D-ID 视频克隆 API 调用成功"

#### 测试 3: 视频生成
1. 选择已创建的数字人
2. 输入口播文本
3. 调整语音参数（可选）
4. 点击"生成视频"
5. 等待后台轮询完成（约3-5秒/次）
6. 检查视频是否成功生成并保存到 Supabase

## 技术变更对比

| 项目 | 百度云 API | D-ID API |
|------|-----------|----------|
| 认证方式 | OAuth 2.0 AccessToken | Basic Auth |
| Token 管理 | 需要缓存和刷新 | 无需管理 |
| 任务ID字段 | `xfyun_task_id` | `did_talk_id` |
| 轮询间隔 | 5秒 | 3秒 |
| 生成速度 | 较慢 | 较快 |
| 数字人效果 | 一般 | 更自然 |

## API 端点映射

### 百度云 → D-ID

| 功能 | 百度云端点 | D-ID端点 |
|------|-----------|---------|
| 图片克隆 | `/avatar/v1/clone/image` | `/clips` |
| 视频克隆 | `/avatar/v1/clone/video` | `/agents` |
| 视频生成 | `/digitalHuman/video/create` | `/talks` |
| 状态查询 | `/digitalHuman/video/query` | `/talks/{id}` |

## 环境变量配置

### 当前配置 (D-ID)
```env
D_ID_API_KEY=enp6aGlhb3lhbmdAZ21haWwuY29t:NTsMRhLQTUQrVDp2pXoBZ
D_ID_BASE_URL=https://api.d-id.com
```

### 已弃用配置 (百度云)
```env
# BAIDU_API_KEY=0mfkQXEgwwRqOepPeDFDj6lU
# BAIDU_SECRET_KEY=eH8lyyEoReBKhn6ET7yT5OGeV7lhb8Oy
```

## 故障排查

### 问题 1: API 调用失败
**症状**: 控制台显示 "D-ID API 调用失败"

**解决方案**:
1. 检查 D-ID API Key 是否正确配置
2. 验证图片/视频 URL 是否公开可访问
3. 检查 D-ID 账户余额是否充足

### 问题 2: 任务轮询超时
**症状**: 视频生成状态一直显示 "processing"

**解决方案**:
1. 检查后台轮询日志
2. 手动查询 D-ID 任务状态
3. 增加轮询最大次数（默认120次）

### 问题 3: 视频上传到 Supabase 失败
**症状**: 视频生成成功但无法保存

**解决方案**:
1. 检查 Supabase Service Role Key 是否配置
2. 验证 Storage Bucket 权限设置
3. 检查网络连接和防火墙设置

## D-ID API 文档

- 官方文档: https://docs.d-id.com/
- Talks API: https://docs.d-id.com/reference/talks
- Clips API: https://docs.d-id.com/reference/clips
- Agents API: https://docs.d-id.com/reference/agents

## 支持的语音列表

D-ID 支持多种语音提供商，默认使用 Microsoft Azure TTS：

### 中文语音
- `zh-CN-XiaoxiaoNeural` (女声，默认)
- `zh-CN-YunxiNeural` (男声)
- `zh-CN-YunyangNeural` (男声)
- `zh-CN-XiaoyiNeural` (女声)

### 英文语音
- `en-US-JennyNeural` (女声)
- `en-US-GuyNeural` (男声)
- `en-GB-SoniaNeural` (女声，英式)

更多语音选项请参考: https://docs.d-id.com/reference/microsoft-azure

## 性能优化建议

1. **图片优化**: 上传前压缩图片到 1MB 以下
2. **视频优化**: 视频时长控制在 30 秒以内
3. **文本优化**: 口播文本控制在 500 字以内
4. **并发控制**: 避免同时生成过多视频

## 成本估算

D-ID API 按使用量计费：
- 图片克隆: 约 $0.05/次
- 视频克隆: 约 $0.10/次
- 视频生成: 约 $0.03/秒

建议设置使用限额和监控机制。

## 回滚方案

如需回滚到百度云 API：

1. 恢复 `.env.local` 中的百度云配置
2. 使用 Git 回滚代码：
   ```bash
   git revert HEAD
   ```
3. 重启服务器

## 联系支持

如遇到问题，请：
1. 查看控制台日志
2. 检查 Supabase 数据库状态
3. 参考 D-ID 官方文档
4. 提交 GitHub Issue

---

**迁移完成日期**: 2026-02-10
**迁移版本**: v1.0.0
**状态**: ✅ 已完成，待测试
