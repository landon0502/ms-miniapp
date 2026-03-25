// 数据库配置
const config = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '00000000',
  database: process.env.MYSQL_DATABASE || 'duty_free_shopping',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

export default config;