# 🚀 启动步骤清单

## ✅ 已完成的配置

1. ✅ 视频存储服务已创建 (lib/services/video-storage.ts)
2. ✅ 后台轮询服务已创建 (lib/services/task-polling.ts)
3. ✅ API 已集成后台轮询功能
4. ✅ 存储桶设置脚本已准备好

## 📋 你需要完成的步骤

### 步骤 1: 配置 Supabase Service Role Key ⚠️ 重要

1. 打开 Supabase 控制台: https://supabase.com/dashboard
2. 选择你的项目: rsudtvmqwuyawhvyyvce
3. 进入 **Settings** → **API**
4. 找到 **Service Role Key** (secret)
5. 复制这个 key
6. 打开 `.env.local` 文件
7. 将 `YOUR_SERVICE_ROLE_KEY_HERE` 替换为你复制的 key

### 步骤 2: 创建 Supabase 存储桶

1. 在 Supabase 控制台，进入 **SQL Editor**
2. 点击 **New Query**
3. 复制 `database/setup-storage-bucket.sql` 的全部内容
4. 粘贴到编辑器
5. 点击 **Run** 按钮
6. 看到 "✅ 存储桶设置完成！" 表示成功

### 步骤 3: 重启开发服务器

在终端中执行：

```bash
# 停止当前服务器（如果正在运行）
# 按 Ctrl + C

# 重新启动
npm run dev
```

### 步骤 4: 测试功能

1. 打开浏览器，访问 http://localhost:3000
2. 登录你的账号
3. 进入数字人资产列表
4. 点击某个数字人的"去创作"按钮
5. 输入口播内容
6. 点击"提交生成"
7. 打开浏览器开发者工具（F12）查看控制台日志

## 🔍 预期的日志输出

成功时你会看到：

```
开始提交视频生成请求... {avatarId: "...", text: "...", voice: "..."}
API响应状态: 200
API响应数据: {success: true, work: {...}, taskId: "..."}
已启动后台轮询: 作品ID xxx, 任务ID xxx
获取作品列表... {avatarId: "..."}
作品列表响应状态: 200
作品列表数据: {works: [...]}
```

后台日志（服务器终端）：

```
开始轮询任务 xxx，作品ID: xxx
轮询第 1 次，任务 xxx 状态: 0
轮询第 2 次，任务 xxx 状态: 0
...
任务 xxx 生成成功，开始下载和上传视频
开始下载视频: https://...
开始上传到 Supabase: videos/xxx.mp4
视频上传成功: https://rsudtvmqwuyawhvyyvce.supabase.co/storage/v1/object/public/avatar-videos/videos/xxx.mp4
任务 xxx 完成，视频已保存到 Supabase
```

## ❌ 常见问题

### 问题 1: "unknown client id" 错误
**原因**: 环境变量未加载
**解决**: 重启开发服务器

### 问题 2: "未授权访问" (401)
**原因**: 用户未登录
**解决**: 先登录系统

### 问题 3: 存储桶策略错误
**原因**: 策略已存在
**解决**: 脚本已自动处理，重新运行即可

### 问题 4: Service Role Key 无效
**原因**: 复制了错误的 key（可能是 anon key）
**解决**: 确保复制的是 **Service Role Key**，不是 anon key

## 📞 需要帮助？

如果遇到问题，请：
1. 检查浏览器控制台的错误信息
2. 检查服务器终端的日志
3. 截图发给我，我会帮你诊断
