# 环境变量配置指南

## 当前状态

### ✅ DeepSeek API Key (已提供)
```
DEEPSEEK_API_KEY=sk-c20f2c723cfb4395b896442fc46ff0e2
```

### ❌ Apify API Token (待获取)
```
APIFY_API_TOKEN=需要替换为真实的 Token
```

## 获取 Apify API Token

### 方法 1: 从控制台获取

1. 访问 https://console.apify.com/account/integrations
2. 登录你的 Apify 账号
3. 在「Personal API tokens」部分找到默认 Token
4. 复制以 `apify_api_` 开头的 Token

### 方法 2: 创建新 Token

1. 在同一页面点击「Create new token」
2. 输入名称（如：douyin-analyzer）
3. 复制生成的 Token

## 配置步骤

### 本地开发

创建 `.env` 文件：

```bash
# DeepSeek API Key
DEEPSEEK_API_KEY=sk-c20f2c723cfb4395b896442fc46ff0e2

# Apify API Token (替换为你的实际 Token)
APIFY_API_TOKEN=apify_api_xxxxxxxxxxxxxxxx
```

### Railway 部署

在 Railway 项目设置中添加环境变量：

1. 打开你的 Railway 项目
2. 点击「Variables」标签
3. 添加以下变量：
   - Name: `DEEPSEEK_API_KEY`
     Value: `sk-c20f2c723cfb4395b896442fc46ff0e2`

   - Name: `APIFY_API_TOKEN`
     Value: `apify_api_xxxxxxxxxxxxxxxx` (你的实际 Token)

## 注意事项

⚠️ **安全警告**:
- DeepSeek API Key 已在此对话中暴露
- 建议使用后立即在 DeepSeek 平台重新生成新的 Key
- 不要将包含真实密钥的 .env 文件提交到 Git

🔒 **最佳实践**:
- 本地开发使用 `.env` 文件（已在 .gitignore 中）
- 云端部署使用平台的环境变量功能
- 定期轮换 API Keys

## 测试配置

获取 Apify Token 后，运行以下命令测试：

```bash
# 1. 检查环境变量
python check_env.py

# 2. 启动服务
python railway-server.py

# 3. 测试 API
python test_api.py
```

## 临时解决方案

如果暂时无法获取 Apify Token，可以：
1. 先部署服务（会报错但不影响代码结构）
2. 稍后在 Railway 控制台添加环境变量
3. 服务会自动重启并生效

---

下一步：请提供你的 Apify API Token，我帮你完成配置。
