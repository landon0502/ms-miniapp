// 主服务器文件
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase, getPool } from './db/index.js';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import miniappOrdersRouter from './routes/miniapp-orders.js';
import miniappProductsRouter from './routes/miniapp-products.js';
import uploadRouter from './routes/upload.js';
import flashSalesRouter from './routes/flash-sales.js';
import promotionsRouter from './routes/promotions.js';
import couponsRouter from './routes/coupons.js';
import authRouter from './routes/auth.js';
import authMiddleware from './middleware/auth.js';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;
const docPort = 8080;

// Swagger 配置
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API 文档',
      version: '1.0.0',
      description: '后台管理系统 API 文档',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: '开发服务器',
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// 配置 CORS
app.use(cors());
app.use(express.json());

// 确保上传目录存在
import fs from 'fs';
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
}

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 注册 miniapp 专用路由（不需要验证token）
app.use('/api/miniapp/orders', miniappOrdersRouter);
app.use('/api/miniapp/products', miniappProductsRouter);

// 注册认证路由（不需要验证token）
app.use('/api/auth', authRouter);

// 注册需要保护的路由
app.use('/api/products', authMiddleware, productsRouter);
app.use('/api/orders', authMiddleware, ordersRouter);
app.use('/api/upload', authMiddleware, uploadRouter);
app.use('/api/flash-sales', authMiddleware, flashSalesRouter);
app.use('/api/promotions', authMiddleware, promotionsRouter);
app.use('/api/coupons', authMiddleware, couponsRouter);

// 初始化数据库并启动服务器
async function startServer() {
  try {
    await initDatabase();
    
    // 检查数据库连接池是否创建成功
    const pool = getPool();
    if (!pool) {
      throw new Error('数据库连接池创建失败');
    }
    
    // 测试数据库连接
    const [rows] = await pool.execute('SELECT 1');
    console.log('数据库连接测试成功:', rows);
    
    // 启动主服务器
    app.listen(port, () => {
      console.log(`服务器运行在 http://localhost:${port}`);
    });
    
    // 创建 API 文档服务器
    const docApp = express();
    // 根路径重定向到 /api-docs
    docApp.get('/', (req, res) => {
      res.redirect('/api-docs');
    });
    docApp.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
    
    // 启动 API 文档服务器
    docApp.listen(docPort, () => {
      console.log(`API 文档运行在 http://localhost:${docPort}/api-docs`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
}

// 启动服务器
startServer();