"""
环境检查脚本

检查部署前的必要配置
"""

import os
import sys
from dotenv import load_dotenv

def check_env():
    """检查环境变量配置"""
    print("=" * 60)
    print("环境配置检查")
    print("=" * 60)

    # 加载 .env 文件
    load_dotenv()

    # 检查项
    checks = {
        "DEEPSEEK_API_KEY": os.getenv("DEEPSEEK_API_KEY"),
        "APIFY_API_TOKEN": os.getenv("APIFY_API_TOKEN")
    }

    all_ok = True

    for key, value in checks.items():
        if value:
            masked = value[:10] + "..." if len(value) > 10 else value
            print(f"✅ {key}: {masked}")
        else:
            print(f"❌ {key}: 未设置")
            all_ok = False

    print("\n" + "=" * 60)

    if all_ok:
        print("✅ 所有环境变量已正确配置")
        print("\n下一步:")
        print("  1. 本地测试: python railway-server.py")
        print("  2. 运行测试: python test_api.py")
    else:
        print("❌ 缺少必要的环境变量")
        print("\n请执行以下步骤:")
        print("  1. 复制 .env.example 为 .env")
        print("  2. 编辑 .env 文件，填入你的 API Keys")
        print("\n获取 API Keys:")
        print("  - DeepSeek: https://platform.deepseek.com/")
        print("  - Apify: https://console.apify.com/account/integrations")
        sys.exit(1)

    print("=" * 60)


def check_dependencies():
    """检查依赖包"""
    print("\n检查 Python 依赖包...")

    required_packages = [
        "fastapi",
        "uvicorn",
        "apify_client",
        "openai",
        "pydantic",
        "python_dotenv"
    ]

    missing = []
    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package} - 未安装")
            missing.append(package)

    if missing:
        print(f"\n⚠️  缺少依赖包，请运行:")
        print("  pip install -r requirements.txt")
        sys.exit(1)
    else:
        print("\n✅ 所有依赖包已安装")


if __name__ == "__main__":
    check_dependencies()
    check_env()
