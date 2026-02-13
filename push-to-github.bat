@echo off
chcp 65001 >nul
echo ========================================
echo 正在推送代码到 GitHub...
echo ========================================
echo.

git push origin master

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✓ 推送成功！
    echo ========================================
    echo.
    echo 接下来：
    echo 1. 等待 Vercel 自动部署（约 2-3 分钟）
    echo 2. 访问你的生产环境测试视频上传
    echo 3. 打开浏览器控制台（F12）查看详细日志
    echo.
) else (
    echo.
    echo ========================================
    echo ✗ 推送失败
    echo ========================================
    echo.
    echo 可能的原因：
    echo 1. 网络连接问题
    echo 2. 需要配置代理或 VPN
    echo 3. GitHub 访问受限
    echo.
    echo 解决方案：
    echo 1. 检查网络连接
    echo 2. 使用 VPN 或代理
    echo 3. 使用 GitHub Desktop 推送
    echo.
)

pause
