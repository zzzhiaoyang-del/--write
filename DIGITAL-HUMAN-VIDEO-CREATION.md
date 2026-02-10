# 数字人视频创作功能

## 功能概述

这个功能允许用户使用已创建的数字人形象来生成口播视频。用户可以输入文本内容，选择音色，调整语速、音量和音调等参数，系统将调用百度智能云数字人 API 生成视频。

## 功能特点

### 1. 创作界面
- **左侧创作区域**：
  - 数字人预览
  - 文本输入框（支持最多 5000 字）
  - 音色选择（播音女声、播音男声、甜美女声、磁性男声）
  - 试听功能
  - 高级设置（语速、音量、音调）

- **右侧历史作品列表**：
  - 显示最新创作的视频作品
  - 实时显示生成状态
  - 支持在线预览和下载

### 2. 核心功能
- ✅ 文本输入和字数统计
- ✅ 预计时长计算
- ✅ 音色选择
- ✅ 高级参数调整（语速、音量、音调）
- ✅ 异步任务处理
- ✅ 自动状态轮询（每 5 秒检查一次）
- ✅ 历史作品管理
- ✅ 视频在线预览和下载

## 技术架构

### 前端
- **页面路径**: `/app/digital-human/create-video/page.tsx`
- **技术栈**: Next.js 16 + React 19 + TypeScript
- **UI 组件**: shadcn/ui + Radix UI + Tailwind CSS
- **状态管理**: React Hooks
- **通知系统**: Sonner Toast

### 后端 API

#### 1. 创建视频 API
- **路径**: `/api/digital-human/create-video`
- **方法**: POST
- **参数**:
  ```json
  {
    "avatarId": "数字人ID",
    "text": "口播内容",
    "voice": "音色ID",
    "speed": 1.0,
    "volume": 1.0,
    "pitch": 1.0
  }
  ```
- **返回**:
  ```json
  {
    "success": true,
    "work": { /* 作品信息 */ },
    "taskId": "任务ID"
  }
  ```

#### 2. 获取作品列表 API
- **路径**: `/api/digital-human/video-works?avatarId={avatarId}`
- **方法**: GET
- **返回**:
  ```json
  {
    "works": [
      {
        "id": "作品ID",
        "name": "作品名称",
        "text": "口播内容",
        "status": "processing|completed|failed",
        "video_url": "视频URL",
        "created_at": "创建时间"
      }
    ]
  }
  ```

#### 3. 检查视频状态 API
- **路径**: `/api/digital-human/check-video-status`
- **方法**: POST
- **参数**:
  ```json
  {
    "workId": "作品ID"
  }
  ```
- **返回**:
  ```json
  {
    "status": "processing|completed|failed",
    "video_url": "视频URL",
    "duration": 视频时长（秒）
  }
  ```

### 数据库

#### video_works 表结构
```sql
CREATE TABLE video_works (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  avatar_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  name TEXT NOT NULL,
  text TEXT NOT NULL,
  voice TEXT NOT NULL,
  speed DECIMAL(3,2),
  volume DECIMAL(3,2),
  pitch DECIMAL(3,2),
  status TEXT NOT NULL,
  video_url TEXT,
  duration INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## 使用流程

### 1. 用户操作流程
1. 在数字人列表页面，点击已完成的数字人卡片上的"去创作"按钮
2. 进入创作页面，输入口播内容
3. 选择音色和调整参数（可选）
4. 点击"提交生成"按钮
5. 系统提交任务，开始生成视频
6. 在右侧历史作品列表中查看生成进度
7. 生成完成后，可以在线预览或下载视频

### 2. 系统处理流程
1. 前端提交生成请求到 `/api/digital-human/create-video`
2. 后端验证参数并调用百度数字人 API
3. 百度 API 返回任务 ID
4. 后端将任务信息保存到数据库
5. 前端开始轮询任务状态（每 5 秒一次）
6. 后端调用百度 API 查询任务状态
7. 任务完成后，更新数据库中的视频 URL
8. 前端显示生成的视频

## 百度智能云 API 集成

### API 文档
- **数字人视频生成**: https://cloud.baidu.com/doc/VCA/s/Hlwvz8wd6

### 配置要求
在 `.env.local` 文件中配置以下环境变量：
```env
BAIDU_API_KEY=your_api_key
BAIDU_SECRET_KEY=your_secret_key
```

### MVP 模式
如果未配置百度 API 密钥，系统将使用模拟数据：
- 自动生成模拟任务 ID
- 5 秒后自动标记为完成
- 返回模拟视频 URL

这样可以在开发阶段测试功能，无需实际调用百度 API。

## 数据库设置

### 1. 创建表
在 Supabase 控制台中执行 `database/video_works.sql` 文件中的 SQL 语句。

### 2. RLS 策略
表已启用行级安全策略（RLS），确保用户只能访问自己的作品。

## 部署说明

### 1. 环境变量
确保在部署环境中配置以下环境变量：
- `BAIDU_API_KEY`: 百度 API Key
- `BAIDU_SECRET_KEY`: 百度 Secret Key
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anon Key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase Service Role Key

### 2. 数据库迁移
在生产环境的 Supabase 中执行数据库迁移脚本。

### 3. 测试
- 测试创建视频功能
- 测试状态轮询
- 测试视频预览和下载

## 未来优化方向

1. **性能优化**
   - 实现 Access Token 缓存（避免频繁获取）
   - 优化轮询策略（使用 WebSocket 或 Server-Sent Events）

2. **功能增强**
   - 支持批量生成
   - 支持视频编辑和剪辑
   - 支持添加背景音乐
   - 支持字幕生成

3. **用户体验**
   - 添加视频预览功能
   - 支持作品重命名和删除
   - 添加作品分类和标签
   - 支持作品分享

4. **监控和日志**
   - 添加任务失败重试机制
   - 记录详细的错误日志
   - 添加性能监控

## 常见问题

### Q: 视频生成需要多长时间？
A: 通常需要 30 秒到 5 分钟，具体取决于文本长度和百度 API 的处理速度。

### Q: 支持哪些音色？
A: 目前支持播音女声、播音男声、甜美女声、磁性男声。更多音色可以通过配置添加。

### Q: 文本长度有限制吗？
A: 是的，单次生成最多支持 5000 字。

### Q: 如何处理生成失败的情况？
A: 系统会自动标记失败状态，用户可以重新提交生成请求。

## 联系方式

如有问题或建议，请提交 Issue 或 Pull Request。
