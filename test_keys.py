"""
快速测试脚本 - 验证 API Keys 是否有效

无需启动服务器，直接测试 API 连接
"""

import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
APIFY_API_TOKEN = os.getenv("APIFY_API_TOKEN")

print("=" * 60)
print("API 连接测试")
print("=" * 60)

# 测试 1: 环境变量检查
print("\n1️⃣  环境变量检查")
print("-" * 60)

if DEEPSEEK_API_KEY:
    print(f"✅ DEEPSEEK_API_KEY: {DEEPSEEK_API_KEY[:15]}...")
else:
    print("❌ DEEPSEEK_API_KEY 未设置")

if APIFY_API_TOKEN:
    print(f"✅ APIFY_API_TOKEN: {APIFY_API_TOKEN[:15]}...")
else:
    print("❌ APIFY_API_TOKEN 未设置")

if not DEEPSEEK_API_KEY or not APIFY_API_TOKEN:
    print("\n⚠️  请先配置 .env 文件")
    exit(1)

# 测试 2: DeepSeek API
print("\n2️⃣  测试 DeepSeek API 连接")
print("-" * 60)

try:
    from openai import OpenAI

    client = OpenAI(
        api_key=DEEPSEEK_API_KEY,
        base_url="https://api.deepseek.com"
    )

    # 简单测试请求
    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[{"role": "user", "content": "你好"}],
        max_tokens=10
    )

    print("✅ DeepSeek API 连接成功")
    print(f"   响应: {response.choices[0].message.content}")

except Exception as e:
    print(f"❌ DeepSeek API 连接失败: {str(e)}")

# 测试 3: Apify API
print("\n3️⃣  测试 Apify API 连接")
print("-" * 60)

try:
    from apify_client import ApifyClient

    apify_client = ApifyClient(APIFY_API_TOKEN)

    # 获取账户信息
    user = apify_client.user().get()

    print("✅ Apify API 连接成功")
    print(f"   用户: {user.get('username', 'Unknown')}")

    # 检查账户余额
    account = apify_client.account().get()
    if account and 'usageCycle' in account:
        usage = account['usageCycle']
        print(f"   本月使用: ${usage.get('usage', 0):.2f}")
        print(f"   免费额度: ${usage.get('limit', 5):.2f}")

except Exception as e:
    print(f"❌ Apify API 连接失败: {str(e)}")

print("\n" + "=" * 60)
print("测试完成")
print("=" * 60)

print("\n下一步:")
print("  1️⃣  启动服务: python railway-server.py")
print("  2️⃣  运行完整测试: python test_api.py")
print("  3️⃣  部署到 Railway（参考 RAILWAY-DEPLOY.md）")
