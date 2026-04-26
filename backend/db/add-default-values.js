// 为线上数据库的 stock 字段添加默认值
import mysql from 'mysql2/promise';

// 线上数据库配置
const config = {
  host: '8.134.59.165',
  port: 3306,
  user: 'root',
  password: '00000000',
  database: 'duty_free_shopping',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

async function addDefaultValues() {
  let connection;
  try {
    // 建立数据库连接
    connection = await mysql.createConnection(config);
    console.log('连接线上数据库成功');
    
    // 为 products 表的 stock 字段添加默认值
    console.log('为 products 表的 stock 字段添加默认值...');
    await connection.execute('ALTER TABLE products MODIFY COLUMN stock INT NOT NULL DEFAULT 0 COMMENT "商品库存"');
    console.log('products 表的 stock 字段默认值添加成功');
    
    // 为 product_skus 表的 stock 字段添加默认值
    console.log('为 product_skus 表的 stock 字段添加默认值...');
    await connection.execute('ALTER TABLE product_skus MODIFY COLUMN stock INT NOT NULL DEFAULT 0 COMMENT "规格库存"');
    console.log('product_skus 表的 stock 字段默认值添加成功');
    
    console.log('所有操作完成！');
  } catch (error) {
    console.error('操作失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 执行操作
addDefaultValues();