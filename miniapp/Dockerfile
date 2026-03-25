# 构建阶段
FROM node:18-alpine as build

WORKDIR /wap

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 构建生产版本
RUN npm run build:wap

# 复制构建结果到NGINX的静态文件目录
COPY --from=build /wap/dist /usr/share/nginx/html/wap

