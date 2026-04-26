// 秒杀活动相关路由
import express from 'express';
import { getPool } from '../db/index.js';

const router = express.Router();

function formatDateTime(date) {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * @swagger
 * /api/flash-sales: 
 *   get: 
 *     summary: 获取秒杀活动列表
 *     description: 获取秒杀活动列表，支持分页
 *     tags: [秒杀活动管理]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *     responses:
 *       200: 
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     list:
 *                       type: array
 *                       items:
 *                         type: object
 */
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    
    // 获取总数
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM flash_sales');
    const total = countResult[0].total;
    
    // 获取分页数据
    const [rows] = await pool.execute(`
      SELECT fs.*, p.name as product_name, ps.sku_name 
      FROM flash_sales fs
      LEFT JOIN products p ON fs.product_id = p.id
      LEFT JOIN product_skus ps ON fs.sku_id = ps.id
      LIMIT ${pageSize} OFFSET ${offset}
    `);
    
    const formattedRows = rows.map(row => ({
      ...row,
      start_time: formatDateTime(row.start_time),
      end_time: formatDateTime(row.end_time)
    }));
    
    res.json({
      success: true,
      code: 200,
      message: '获取秒杀活动列表成功',
      data: {
        page,
        pageSize,
        total,
        list: formattedRows
      }
    });
  } catch (error) {
    console.error('获取秒杀活动列表失败:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: '获取秒杀活动列表失败',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/flash-sales: 
 *   post: 
 *     summary: 创建秒杀活动
 *     description: 创建新的秒杀活动
 *     tags: [秒杀活动管理]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: integer
 *                 description: 商品 ID
 *               sku_id:
 *                 type: integer
 *                 description: 规格 ID
 *               activity_price:
 *                 type: number
 *                 description: 活动价格
 *               start_time:
 *                 type: string
 *                 format: date-time
 *                 description: 开始时间
 *               end_time:
 *                 type: string
 *                 format: date-time
 *                 description: 结束时间
 *     responses:
 *       200: 
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 */
router.post('/', async (req, res) => {
  try {
    const pool = getPool();
    const { product_id, sku_id, activity_price, start_time, end_time } = req.body;
    
    // 直接使用前端发送的时间字符串，因为前端已经格式化好了
    const formattedStartTime = start_time;
    const formattedEndTime = end_time;
    
    const [result] = await pool.execute(
      'INSERT INTO flash_sales (product_id, sku_id, activity_price, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
      [product_id, sku_id, activity_price, formattedStartTime, formattedEndTime]
    );
    
    res.json({
      success: true,
      code: 200,
      message: '创建秒杀活动成功',
      data: {
        id: result.insertId, 
        product_id, 
        sku_id, 
        activity_price, 
        start_time: formattedStartTime, 
        end_time: formattedEndTime 
      }
    });
  } catch (error) {
    console.error('创建秒杀活动失败:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: '创建秒杀活动失败',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/flash-sales/{id}: 
 *   put: 
 *     summary: 更新秒杀活动
 *     description: 更新指定的秒杀活动
 *     tags: [秒杀活动管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 活动 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: integer
 *                 description: 商品 ID
 *               sku_id:
 *                 type: integer
 *                 description: 规格 ID
 *               activity_price:
 *                 type: number
 *                 description: 活动价格
 *               start_time:
 *                 type: string
 *                 format: date-time
 *                 description: 开始时间
 *               end_time:
 *                 type: string
 *                 format: date-time
 *                 description: 结束时间
 *     responses:
 *       200: 
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       404: 
 *         description: 秒杀活动不存在
 */
router.put('/:id', async (req, res) => {
  try {
    const pool = getPool();
    const { product_id, sku_id, activity_price, start_time, end_time } = req.body;
    
    // 直接使用前端发送的时间字符串，因为前端已经格式化好了
    const formattedStartTime = start_time;
    const formattedEndTime = end_time;
    
    const [result] = await pool.execute(
      'UPDATE flash_sales SET product_id = ?, sku_id = ?, activity_price = ?, start_time = ?, end_time = ? WHERE id = ?',
      [product_id, sku_id, activity_price, formattedStartTime, formattedEndTime, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: '秒杀活动不存在',
        data: null
      });
    }
    
    res.json({
      success: true,
      code: 200,
      message: '更新秒杀活动成功',
      data: {
        id: parseInt(req.params.id), 
        product_id, 
        sku_id, 
        activity_price, 
        start_time: formattedStartTime, 
        end_time: formattedEndTime 
      }
    });
  } catch (error) {
    console.error('更新秒杀活动失败:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: '更新秒杀活动失败',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/flash-sales/{id}: 
 *   delete: 
 *     summary: 删除秒杀活动
 *     description: 根据活动 ID 删除秒杀活动
 *     tags: [秒杀活动管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 活动 ID
 *     responses:
 *       200: 
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: null
 *       404: 
 *         description: 秒杀活动不存在
 */
router.delete('/:id', async (req, res) => {
  try {
    const pool = getPool();
    const [result] = await pool.execute('DELETE FROM flash_sales WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: '秒杀活动不存在',
        data: null
      });
    }
    
    res.json({
      success: true,
      code: 200,
      message: '秒杀活动删除成功',
      data: null
    });
  } catch (error) {
    console.error('删除秒杀活动失败:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: '删除秒杀活动失败',
      data: null
    });
  }
});

export default router;