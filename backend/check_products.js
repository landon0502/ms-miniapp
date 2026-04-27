import { initDatabase, getPool } from './db/index.js';

(async () => {
  try {
    // 初始化数据库
    await initDatabase();
    
    const pool = getPool();
    const [rows] = await pool.execute('SELECT id, name FROM products');
    
    await pool.end();
  } catch (error) {
    
  }
})();