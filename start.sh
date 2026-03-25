#!/bin/bash

# 进入admin目录
cd admin

# 安装依赖
echo "安装依赖..."
npm install

# 构建生产版本
echo "构建生产版本..."
npm run build

# 回到根目录
cd ..

# 启动服务
echo "启动服务..."
docker-compose up -d

echo "服务启动完成！可以通过 http://localhost/admin 访问管理系统"
