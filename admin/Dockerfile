# 构建阶段
FROM node:18-alpine as build

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 构建生产版本
RUN npm run build

# 运行阶段
FROM nginx:latest

# 复制构建结果到NGINX的静态文件目录
COPY --from=build /app/dist /usr/share/nginx/html/admin

# 复制nginx配置文件
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/ /etc/nginx/conf.d/

# 暴露端口
EXPOSE 80

# 启动NGINX
CMD ["nginx", "-g", "daemon off;"]
