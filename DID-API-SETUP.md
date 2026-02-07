# D-ID API 接入指南

## 🎯 目标
将数字人克隆功能接入 D-ID API，实现真实的数字人创建（最便宜方案，约 $10-20/分身）

---

## 📋 完整步骤

### 第1步：注册 D-ID 账号

1. **访问 D-ID 官网**：https://studio.d-id.com/
2. **注册账号**：
   - 点击右上角 **Sign Up** 按钮
   - 可以用 **Google 账号快速登录**（推荐）
   - 或者用邮箱注册

3. **验证邮箱**（如果用邮箱注册）

---

### 第2步：获取 API Key

登录 D-ID 后：

1. **进入 API 设置**：
   - 方式1：点击左侧菜单 → **API**
   - 方式2：点击右上角头像 → **Settings** → **API**

2. **创建 API Key**：
   - 点击 **Create API Key** 或 **Generate New Key**
   - 可选：给 Key 起个名字（如 "数字人克隆"）
   - 点击 **Create**

3. **复制 API Key**：
   - ⚠️ **重要**：API Key 只显示一次！立即复制保存
   - 格式示例：`Basic dGVzdDp0ZXN0...`（长字符串）
   - 保存到安全的地方（密码管理器或记事本）

---

### 第3步：配置项目环境变量

1. **打开项目根目录的 `.env.local` 文件**

2. **找到这一行**：
   ```bash
   DID_API_KEY=YOUR_DID_API_KEY
   ```

3. **替换为你的真实 API Key**：
   ```bash
   DID_API_KEY=Basic dGVzdDp0ZXN0...你的实际Key
   ```

4. **保存文件**（Ctrl + S）

---

### 第4步：重启开发服务器

在终端中：

1. **停止当前服务器**：按 `Ctrl + C`
2. **重新启动**：
   ```bash
   npm run dev
   ```

---

### 第5步：测试真实 API

1. **访问**：http://localhost:3000/digital-assets/clone-avatar
2. **上传视频**（建议先用小视频测试，< 10MB）
3. **填写信息并提交**
4. **查看结果**：
   - 成功：显示 "🎉 数字人创建成功！（使用 D-ID API）"
   - 失败：会自动降级到 MVP 模式

---

## 💰 D-ID 定价

### 免费试用
- 通常提供 **$5-10 免费额度**
- 可以测试 1-2 个数字人

### 付费价格
- **Starter Plan**：$49/月（包含约 60 分钟视频生成）
- **Pay-as-you-go**：约 $0.30-0.80/分钟视频
- **创建数字人分身**：约 $10-20/个

### 查看余额
登录 D-ID → 左侧菜单 → **Credits** 或 **Billing**

---

## 🔍 如何验证 API 是否工作

### 检查列表

✅ **环境变量正确**：
```bash
# 在 .env.local 中检查
DID_API_KEY=Basic xxx...（不是 YOUR_DID_API_KEY）
```

✅ **服务器已重启**：
- 停止服务器（Ctrl + C）
- 重新运行 `npm run dev`
- 看到 "Ready" 提示

✅ **API Key 有效**：
- 登录 D-ID 检查 Key 是否存在
- 检查账户是否有余额

✅ **上传测试**：
- 上传视频后，查看浏览器 Console（F12）
- 如果看到 "D-ID API error"，说明 API 被调用但失败
- 如果没有错误，说明工作正常

---

## 🐛 常见问题

### 问题1：显示 "MVP 模式"
**原因**：API Key 未配置或配置错误
**解决**：
1. 检查 `.env.local` 中的 `DID_API_KEY`
2. 确保已重启服务器
3. 确保 Key 格式正确（以 `Basic` 开头）

### 问题2：上传后报错
**原因**：API Key 无效或余额不足
**解决**：
1. 登录 D-ID 检查 API Key 状态
2. 检查账户余额
3. 重新生成 API Key

### 问题3：视频太大上传失败
**原因**：文件超过限制
**解决**：
- 使用 < 100MB 的视频
- 压缩视频再上传

---

## 📊 工作流程

```
用户上传视频
    ↓
上传到 Supabase Storage
    ↓
获取视频 URL
    ↓
调用 D-ID API（如果配置了 Key）
    ├─ 成功 → 使用 D-ID 返回的 ID
    └─ 失败 → 降级到 MVP 模式（模拟数据）
    ↓
保存到数据库
    ↓
显示成功消息
```

---

## 🎯 下一步优化

1. **Webhook 集成**：监听 D-ID 处理状态
2. **视频预览**：上传前预览视频
3. **批量处理**：一次创建多个数字人
4. **使用数字人**：用数字人生成视频

---

## 📚 参考资料

- **D-ID 官网**：https://www.d-id.com/
- **D-ID API 文档**：https://docs.d-id.com/
- **D-ID Studio**：https://studio.d-id.com/
- **价格页面**：https://www.d-id.com/pricing/

---

## ✅ 配置完成检查

- [ ] 已注册 D-ID 账号
- [ ] 已获取 API Key
- [ ] 已添加到 `.env.local`
- [ ] 已重启开发服务器
- [ ] 已测试上传功能
- [ ] 显示 "使用 D-ID API" 消息

全部完成后，你的数字人克隆功能就接入真实 API 了！🎉
