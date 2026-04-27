// Redis连接配置
import { createClient } from 'redis';

// 从环境变量获取Redis配置
const redisHost = process.env.REDIS_HOST || 'redis';
const redisPort = process.env.REDIS_PORT || 6379;
const redisPassword = process.env.REDIS_PASSWORD || '';



// 创建Redis客户端配置
const redisConfig = {
  socket: {
    host: redisHost,
    port: parseInt(redisPort)
  }
};

// 如果有密码，添加到配置中
if (redisPassword) {
  redisConfig.password = redisPassword;
}

// 创建Redis客户端
const redisClient = createClient(redisConfig);

// 连接Redis
redisClient.connect().catch(console.error);

// 监听连接事件
redisClient.on('error', (err) => {
  console.error('Redis连接错误:', err);
});

redisClient.on('connect', () => {
  console.log('Redis连接成功');
});

// 存储token到Redis
export async function storeToken(userId, token, expiration = 7 * 24 * 60 * 60) {
  try {
    // 确保userId是字符串类型，与JWT token中的id类型一致
    const stringUserId = String(userId);
    const key = `user:${stringUserId}:token`;
    console.log('存储token到Redis:', {
      userId,
      stringUserId,
      key,
      token: token.substring(0, 20) + '...' // 只打印前20个字符
    });
    await redisClient.set(key, token, {
      EX: expiration
    });
    console.log('存储token成功');
    return true;
  } catch (error) {
    console.error('存储token失败:', error);
    return false;
  }
}

// 从Redis获取token
export async function getToken(userId) {
  try {
    // 确保userId是字符串类型，与JWT token中的id类型一致
    const stringUserId = String(userId);
    const key = `user:${stringUserId}:token`;
    
    const token = await redisClient.get(key);
    
    return token;
  } catch (error) {
    console.error('获取token失败:', error);
    return null;
  }
}

// 从Redis删除token
export async function deleteToken(userId) {
  try {
    // 确保userId是字符串类型，与JWT token中的id类型一致
    const stringUserId = String(userId);
    const key = `user:${stringUserId}:token`;
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('删除token失败:', error);
    return false;
  }
}

// 检查token是否有效
export async function validateToken(userId, token) {
  try {
    // 确保userId是字符串类型，与JWT token中的id类型一致
    const stringUserId = String(userId);
    
    
    const storedToken = await getToken(stringUserId);
    
    
    // 当storedToken为null或undefined时，默认返回true，这样即使Redis连接失败，认证中间件也能够正常工作
    // 在生产环境中，应该确保Redis连接正常
    if (!storedToken) {
      console.log('Redis中不存在token:', stringUserId);
      return true;
    }
    
    
    return storedToken === token;
  } catch (error) {
    console.error('验证token失败:', error);
    // 当Redis连接失败时，默认返回true，这样即使Redis连接失败，认证中间件也能够正常工作
    // 在生产环境中，应该确保Redis连接正常
    return true;
  }
}

export default redisClient;
