// 认证相关路由
import express from 'express';
import { getPool } from '../db/index.js';
import { storeToken, validateToken } from '../db/redis.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = 'your-secret-key'; // 实际生产环境中应该使用环境变量

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 注册用户
 *     description: 注册新用户
 *     tags: [认证管理]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: 
 *                 type: string
 *                 description: 用户名
 *               password: 
 *                 type: string
 *                 description: 密码
 *               nickname: 
 *                 type: string
 *                 description: 昵称
 *     responses:
 *       200: 
 *         description: 成功
 *       400: 
 *         description: 请求参数错误
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password, nickname } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: '用户名和密码不能为空',
        data: null
      });
    }
    
    const pool = getPool();
    
    // 检查用户名是否已存在
    const [existingUsers] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: '用户名已存在',
        data: null
      });
    }
    
    // 插入新用户
    const [result] = await pool.execute(
      'INSERT INTO users (username, password, nickname, role) VALUES (?, ?, ?, ?)',
      [username, password, nickname || username, 'user']
    );
    
    res.json({
      success: true,
      code: 200,
      message: '注册成功',
      data: {
        id: result.insertId,
        username,
        nickname: nickname || username,
        role: 'user'
      }
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: '注册失败',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 用户登录
 *     description: 用户登录并获取token
 *     tags: [认证管理]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: 
 *                 type: string
 *                 description: 用户名
 *               password: 
 *                 type: string
 *                 description: 密码
 *     responses:
 *       200: 
 *         description: 成功
 *       401: 
 *         description: 用户名或密码错误
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: '用户名和密码不能为空',
        data: null
      });
    }
    
    const pool = getPool();
    
    
    
    
    // 查看当前数据库
    const [databases] = await pool.execute('SHOW DATABASES');
    
    
    // 查看当前使用的数据库
    const [currentDb] = await pool.execute('SELECT DATABASE()');
    
    
    // 查看users表结构
    const [tableStructure] = await pool.execute('DESCRIBE users');
    
    
    // 查看所有用户
    const [allUsers] = await pool.execute('SELECT * FROM users');
    
    
    // 查询用户
    const [users] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        code: 401,
        message: '用户名或密码错误',
        data: null
      });
    }
    
    const user = users[0];
    
    
    
    
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        code: 401,
        message: '用户名或密码错误',
        data: null
      });
    }
    
    // 生成JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' } // 7天过期
    );
    
    // 存储token到Redis，实现单点登录
    await storeToken(user.id, token, 7 * 24 * 60 * 60);
    
    res.json({
      success: true,
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          avatar: user.avatar,
          role: user.role
        }
      }
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      code: 500,
      message: '登录失败',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/auth/sso:
 *   post:
 *     summary: 单点登录
 *     description: 单点登录接口，用于第三方应用集成
 *     tags: [认证管理]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: 
 *                 type: string
 *                 description: 用户名
 *               password: 
 *                 type: string
 *                 description: 密码
 *               app_id: 
 *                 type: string
 *                 description: 应用ID
 *     responses:
 *       200: 
 *         description: 成功
 *       401: 
 *         description: 用户名或密码错误
 */
router.post('/sso', async (req, res) => {
  try {
    const { username, password, app_id } = req.body;
    
    if (!username || !password || !app_id) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: '用户名、密码和应用ID不能为空',
        data: null
      });
    }
    
    const pool = getPool();
    
    // 查询用户
    const [users] = await pool.execute('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        code: 401,
        message: '用户名或密码错误',
        data: null
      });
    }
    
    const user = users[0];
    
    // 生成SSO token（可以根据需要添加app_id等信息）
    const ssoToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        app_id,
        sso: true
      },
      JWT_SECRET,
      { expiresIn: '24h' } // 24小时过期
    );
    
    // 存储token到Redis，实现单点登录
    await storeToken(user.id, ssoToken, 24 * 60 * 60);
    
    res.json({
      success: true,
      code: 200,
      message: '单点登录成功',
      data: {
        sso_token: ssoToken,
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          role: user.role
        }
      }
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      code: 500,
      message: '单点登录失败',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     summary: 验证token
 *     description: 验证token是否有效
 *     tags: [认证管理]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token: 
 *                 type: string
 *                 description: JWT token
 *     responses:
 *       200: 
 *         description: 成功
 *       401: 
 *         description: token无效
 */
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: 'token不能为空',
        data: null
      });
    }
    
    // 验证token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 检查token是否与Redis中存储的最新token匹配
    const isValid = await validateToken(decoded.id, token);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        code: 401,
        message: 'token已失效，用户已在其他设备登录',
        data: null
      });
    }
    
    res.json({
      success: true,
      code: 200,
      message: 'token有效',
      data: {
        user: {
          id: decoded.id,
          username: decoded.username,
          role: decoded.role
        }
      }
    });
  } catch (error) {
    
    res.status(401).json({
      success: false,
      code: 401,
      message: 'token无效',
      data: null
    });
  }
});

export default router;