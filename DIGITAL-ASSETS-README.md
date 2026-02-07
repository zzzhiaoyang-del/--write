# 数字资产功能说明

## 功能概述

在秒懂AI超级员工应用中新增了"数字资产"模块，与"智能广场"同级，包含以下两个核心功能：

### 1. 克隆形象
- **路径**: `/digital-assets/clone-avatar`
- **功能**: 上传视频一键打造专属数字分身
- **特点**:
  - 支持1-4分钟视频上传（最大500MB）
  - AI自动提取面部特征和表情
  - 生成可驱动的数字人形象
  - 内置教程弹窗指导用户正确录制

### 2. 克隆声音
- **路径**: `/digital-assets/clone-voice`
- **功能**: 上传音频快速克隆专属声音
- **特点**:
  - 支持30秒-3分钟音频（最大100MB）
  - AI智能分析音色特征
  - 支持多语言（中文、英文、日语、韩语等）
  - 提供高级设置（音色优化、降噪处理）

## 文件结构

```
app/
├── digital-assets/              # 数字资产主目录
│   ├── page.tsx                # 数字资产主页
│   ├── clone-avatar/           # 克隆形象
│   │   └── page.tsx
│   └── clone-voice/            # 克隆声音
│       └── page.tsx
└── api/
    └── voice/                  # 声音克隆API
        ├── upload/
        │   └── route.ts
        └── clone/
            └── route.ts

components/
└── digital-asset-card.tsx      # 数字资产卡片组件

lib/
└── digital-assets-data.ts      # 数字资产数据定义
```

## 导航更新

已在主导航栏 (`components/navbar.tsx`) 添加"数字资产"入口，位于"智能广场"和"AI员工"之间。

## UI设计参考

### 主页面
- 使用卡片布局展示克隆形象和克隆声音
- 参考智能广场的员工卡片设计
- 渐变背景和图标设计

### 表单页面
- 分步骤引导（1.上传文件 → 2.设置名称 → 3.选择分类/语言）
- 实时提示和验证
- 教程弹窗（参考提供的截图）
- 错误示例展示

## 待完成事项

### 后端集成
1. **文件上传**
   - [ ] 集成Supabase Storage或其他云存储
   - [ ] 实现文件上传进度跟踪
   - [ ] 添加文件格式和大小验证

2. **数字人克隆**
   - [ ] 集成数字人克隆服务API（已有 `/api/digital-human/clone`）
   - [ ] 完善错误处理和重试机制

3. **声音克隆**
   - [ ] 集成声音克隆服务（如 ElevenLabs, Azure TTS等）
   - [ ] 实现音频预处理（降噪、标准化）
   - [ ] 保存克隆结果到数据库

4. **数据库表**
   ```sql
   -- 数字人表（可能已存在）
   create table digital_humans (
     id uuid primary key,
     user_id uuid references auth.users,
     name text not null,
     category text not null,
     video_url text not null,
     avatar_id text,
     created_at timestamp default now()
   );

   -- 声音表（需要新建）
   create table voices (
     id uuid primary key,
     user_id uuid references auth.users,
     name text not null,
     language text not null,
     audio_url text not null,
     voice_id text,
     created_at timestamp default now()
   );
   ```

5. **列表页面**
   - [ ] 创建数字人列表页（`/digital-human/list`）
   - [ ] 创建声音列表页（`/digital-assets/voice-list`）
   - [ ] 实现查看、编辑、删除功能

### 功能增强
- [ ] 添加录音功能（浏览器录音API）
- [ ] 实时预览功能
- [ ] 批量上传支持
- [ ] 进度条优化
- [ ] 音频播放器组件

## 使用流程

### 克隆形象
1. 点击导航栏"数字资产"
2. 选择"克隆形象"卡片
3. 查看教程（可选）
4. 上传1-4分钟视频（单人出镜，正脸，无遮挡）
5. 输入数字人名称
6. 选择分类
7. 同意协议并提交
8. 等待处理，跳转到列表页

### 克隆声音
1. 点击导航栏"数字资产"
2. 选择"克隆声音"卡片
3. 查看教程（可选）
4. 上传30秒-3分钟音频（清晰，无噪音）或直接录音
5. 输入声音名称
6. 选择语言
7. 配置高级设置（可选）
8. 同意协议并提交
9. 等待处理，跳转到列表页

## 技术栈

- **前端**: Next.js 14 (App Router), React, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **图标**: Lucide React
- **表单**: React Hook Form (可选)
- **文件上传**: FormData API
- **状态管理**: React useState

## 注意事项

1. 文件大小限制：视频500MB，音频100MB
2. 格式限制：视频（video/*），音频（audio/*）
3. 需要用户登录才能使用（集成Supabase Auth）
4. 处理时间较长，需要良好的加载状态提示
5. 确保用户同意使用协议（涉及肖像权和声音权）

## 相关API端点

- `POST /api/digital-human/upload` - 上传数字人视频
- `POST /api/digital-human/clone` - 创建数字人
- `POST /api/voice/upload` - 上传音频文件
- `POST /api/voice/clone` - 克隆声音
- `GET /api/digital-human/list` - 获取数字人列表
- `GET /api/voice/list` - 获取声音列表（待创建）
