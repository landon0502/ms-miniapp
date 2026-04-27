// 认证中间件
import jwt from 'jsonwebtoken';
import { validateToken } from '../db/redis.js';

const JWT_SECRET = 'your-secret-key'; // 实际生产环境中应该使用环境变量

export function authMiddleware(req, res, next) {
  try {
    // 从请求头获取token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        code: 401,
        message: '请提供token',
        data: null
      });
    }
    
    // 提取token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        code: 401,
        message: '请提供有效的token',
        data: null
      });
    }
    
    // 验证token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 检查token是否与Redis中存储的最新token匹配
    
    validateToken(decoded.id, token).then(isValid => {
      
      if (!isValid) {
        return res.status(401).json({
          success: false,
          code: 401,
          message: 'token已失效，用户已在其他设备登录',
          data: null
        });
      }
      
      // 将用户信息添加到请求对象中
      req.user = decoded;
      next();
    }).catch(error => {
      
      return res.status(401).json({
        success: false,
        code: 401,
        message: 'token无效',
        data: null
      });
    });
  } catch (error) {
    
    return res.status(401).json({
      success: false,
      code: 401,
      message: 'token无效',
      data: null
    });
  }
}

export default authMiddleware;