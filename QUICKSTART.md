# 抖音账号拆解 API - 快速开始指南

## 第一步：准备 API Keys

### 1. DeepSeek API Key

1. 访问 https://platform.deepseek.com/
2. 注册并登录
3. 点击右上角头像 → API Keys
4. 点击「创建新密钥」
5. 复制以 `sk-` 开头的密钥

### 2. Apify API Token

1. 访问 https://apify.com/
2. 注册并登录
3. 点击 Settings → Integrations → API Tokens
4. 复制以 `apify_api_` 开头的 Token
5. 免费账户有每月 $5 的免费额度

## 第二步：配置环境变量

1. 复制环境变量模板：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，填入你的密钥：
```bash
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
APIFY_API_TOKEN=apify_api_xxxxxxxxxxxxxxxx
```

## 第三步：安装依赖

```bash
pip install -r requirements.txt
```

## 第四步：检查配置

```bash
python check_env.py
```

如果显示 ✅ 表示配置正确。

## 第五步：启动服务

```bash
python railway-server.py
```

服务将在 `http://localhost:8000` 启动。

## 第六步：测试 API

新开一个终端，运行测试脚本：

```bash
python test_api.py
```

或者使用 curl 测试：

```bash
# 健康检查
curl http://localhost:8000/

# 分析账号（替换为真实的抖音链接）
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.douyin.com/user/MS4wLjABAAAA..."}'
```

## 部署到 Railway

1. 将代码推送到 GitHub
2. 访问 https://railway.app/
3. 点击「New Project」→「Deploy from GitHub repo」
4. 选择你的仓库
5. 添加环境变量：
   - `DEEPSEEK_API_KEY`
   - `APIFY_API_TOKEN`
6. 部署完成后会获得一个公网 URL

## 常见问题

### Q: 运行报错 "DEEPSEEK_API_KEY 未在环境变量中设置"

A: 确保已创建 `.env` 文件并正确填写 API Key

### Q: Apify 抓取失败

A: 检查以下几点：
- 抖音链接格式是否正确（需要完整的用户主页链接）
- Apify Token 是否有效
- 账户余额是否充足

### Q: 分析返回空结果

A: 检查 DeepSeek API Key 是否正确，账户余额是否充足

## 项目文件说明

- `railway-server.py` - 主服务文件
- `requirements.txt` - Python 依赖
- `.env` - 环境变量配置（需自行创建）
- `test_api.py` - API 测试脚本
- `check_env.py` - 环境检查脚本
- `Procfile` - Railway 部署配置
- `DOUYIN-API-README.md` - 详细文档

## 获取帮助

如有问题，请查看 `DOUYIN-API-README.md` 详细文档。
