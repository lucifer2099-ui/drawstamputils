@echo off
chcp 65001 >nul
title DrawStamp 电子印章编辑器一键启动器

echo ==================================================
echo         DrawStamp 电子印章编辑器一键启动
echo ==================================================
echo.

:: 1. 检测 node_modules 目录是否存在
if not exist node_modules (
    echo [提示] 未检测到依赖库，正在为您自动执行 npm install 安装依赖...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [错误] 依赖安装失败，请检查网络或 Node.js 环境。
        pause
        exit /b %errorlevel%
    )
    echo.
    echo [成功] 依赖库安装完成！
    echo.
)

:: 2. 启动服务并自动打开浏览器页面
echo [启动] 正在启动 Vite 开发服务器，并自动在浏览器中打开编辑器页面...
echo.
call npx vite --open

pause
