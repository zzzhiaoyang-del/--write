"""
测试脚本 - 抖音账号拆解 API

运行前确保:
1. 已安装依赖: pip install -r requirements.txt
2. 已配置 .env 文件
"""

import requests
import json
import sys

# 本地测试 URL
BASE_URL = "http://localhost:8000"

def test_health_check():
    """测试健康检查接口"""
    print("\n=== 测试 1: 健康检查 ===")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), ensure_ascii=False, indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ 错误: {e}")
        return False


def test_analyze_account(douyin_url: str):
    """测试账号分析接口"""
    print("\n=== 测试 2: 账号分析 ===")
    print(f"输入 URL: {douyin_url}")

    try:
        response = requests.post(
            f"{BASE_URL}/analyze",
            json={"url": douyin_url},
            timeout=180  # 3 分钟超时
        )

        print(f"\n状态码: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            print("\n✅ 分析成功!")
            print("\n=== AI 分析报告 ===")
            print(result.get("result", "无结果"))
            return True
        else:
            print(f"❌ 请求失败: {response.json()}")
            return False

    except requests.exceptions.Timeout:
        print("❌ 请求超时（超过 3 分钟）")
        return False
    except Exception as e:
        print(f"❌ 错误: {e}")
        return False


def main():
    print("=" * 60)
    print("抖音账号拆解 API - 测试脚本")
    print("=" * 60)

    # 测试 1: 健康检查
    if not test_health_check():
        print("\n⚠️  服务未启动，请先运行: python railway-server.py")
        sys.exit(1)

    # 测试 2: 账号分析
    # 替换为真实的抖音链接进行测试
    test_url = input("\n请输入抖音账号链接（或按回车使用示例）: ").strip()

    if not test_url:
        print("⚠️  未提供 URL，跳过分析测试")
        print("提示: 使用真实抖音链接测试，例如:")
        print("  https://www.douyin.com/user/MS4wLjABAAAA...")
        return

    test_analyze_account(test_url)

    print("\n" + "=" * 60)
    print("测试完成")
    print("=" * 60)


if __name__ == "__main__":
    main()
