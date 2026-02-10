# 克隆形象后端 API 配置说明（百度智能云版本）

## 修改说明

本项目已从讯飞开放平台切换到百度智能云数字人API：

### 主要修改点：
1. **鉴权方式**：讯飞 HMAC-SHA256 签名 → 百度 OAuth 2.0 AccessToken
2. **API 端点**：讯飞 API → 百度智能云 API
3. **环境变量**：`XFYUN_*` → `BAIDU_*`
4. **前端接口**：保持不变，完全兼容

---

## 百度智能云配置

### 1. 获取百度 API 凭证

您需要提供以下两个凭证：

```bash
# 百度智能云配置
BAIDU_API_KEY=your_api_key_here
BAIDU_SECRET_KEY=your_secret_key_here
```

### 2. 如何获取凭证

1. 访问百度智能云控制台：https://console.bce.baidu.com/
2. 注册/登录账号
3. 进入"产品服务" → "人工智能" → "数字人"
4. 创建应用，获取 `API Key` 和 `Secret Key`
5. 将这些值配置到 `.env.local` 文件中

### 3. 开通服务

确保在百度智能云控制台中开通以下服务：
- **数字人克隆服务**（图片克隆）
- **数字人克隆服务**（视频克隆）

---

## API 端点说明

### 1. 视频上传 API
- **路径**: `/api/digital-human/upload-video`
- **方法**: POST
- **参数**: FormData { video: File }
- **返回**: { videoUrl: string, fileName: string }
- **说明**: 未修改，仍使用 Supabase Storage

### 2. 视频克隆 API
- **路径**: `/api/digital-human/clone-video`
- **方法**: POST
- **参数**: { videoUrl: string }
- **返回**: { success: boolean, avatarId: string, message: string }
- **修改**:
  - 鉴权：讯飞签名 → 百度 AccessToken
  - 端点：`https://api.xf-yun.com/...` → `https://aip.baidubce.com/rpc/2.0/avatar/v1/clone/video`

### 3. 图片上传 API
- **路径**: `/api/digital-human/upload-image`
- **方法**: POST
- **参数**: FormData { image: File, name: string, model: string }
- **返回**: { imageUrl: string, fileName: string, name: string, model: string }
- **说明**: 未修改，仍使用 Supabase Storage

### 4. 图片克隆 API
- **路径**: `/api/digital-human/clone-image`
- **方法**: POST
- **参数**: { imageUrl: string, name: string, model: string }
- **返回**: { success: boolean, avatarId: string, message: string }
- **修改**:
  - 鉴权：讯飞签名 → 百度 AccessToken
  - 端点：`https://api.xf-yun.com/...` → `https://aip.baidubce.com/rpc/2.0/avatar/v1/clone/image`

---

## 鉴权机制

### 百度 AccessToken 获取流程

```typescript
// 自动获取并缓存 AccessToken
const accessToken = await getBaiduAccessToken()

// AccessToken 有效期 30 天，自动缓存
// 过期前 5 分钟自动刷新
```

### 工具函数位置
- 文件：`lib/baidu-auth.ts`
- 函数：`getBaiduAccessToken()`
- 缓存：自动管理，无需手动处理

---

## MVP 模式

如果未配置百度 API 密钥，系统将以 MVP 模式运行：
- 文件上传功能正常工作（使用 Supabase Storage）
- 克隆功能使用模拟数据，直接标记为 `completed` 状态
- 适合开发和测试阶段使用

---

## 数据库字段说明

在 `digital_humans` 表中使用以下字段：
- `clone_type`: 'video' | 'image' - 标记克隆类型
- `xfyun_task_id`: string - 存储百度 task_id（复用字段名）
- `model_version`: string - 模型版本（仅图片克隆）
- `status`: 'processing' | 'completed' | 'failed' - 任务状态

---

## 前端兼容性

✅ **前端无需修改**

- 接口路径保持不变
- 返回参数格式保持不变
- 前端代码完全兼容

---

## 注意事项

1. **百度 API 文档**: 请根据实际的百度智能云 API 文档调整接口地址和参数
   - 官方文档：https://cloud.baidu.com/doc/VCA/s/Hlkql5yx8

2. **AccessToken 缓存**: 系统自动管理 AccessToken 缓存，有效期 30 天

3. **错误处理**: 已添加完整的错误处理和日志记录

4. **状态轮询**: 对于异步任务，建议实现状态轮询机制

5. **Webhook**: 建议配置百度的 Webhook 回调来更新任务状态

---

## 环境变量配置示例

```bash
# 百度智能云配置（新）
BAIDU_API_KEY=your_baidu_api_key
BAIDU_SECRET_KEY=your_baidu_secret_key

# 讯飞配置（已弃用，可删除）
# XFYUN_APP_ID=...
# XFYUN_API_KEY=...
# XFYUN_API_SECRET=...
```

---

## 迁移检查清单

- [x] 创建百度鉴权工具函数 (`lib/baidu-auth.ts`)
- [x] 更新图片克隆 API (`app/api/digital-human/clone-image/route.ts`)
- [x] 更新视频克隆 API (`app/api/digital-human/clone-video/route.ts`)
- [x] 更新配置文档 (`CLONE-AVATAR-API-CONFIG.md`)
- [ ] 配置百度 API 凭证到 `.env.local`
- [ ] 测试图片克隆功能
- [ ] 测试视频克隆功能
- [ ] 验证前端兼容性

---

## 技术支持

如有问题，请参考：
- 百度智能云官方文档：https://cloud.baidu.com/doc/VCA/index.html
- 百度智能云控制台：https://console.bce.baidu.com/
