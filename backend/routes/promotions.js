// 促销相关路由
import express from 'express';
import { getPool } from '../db/index.js';

const router = express.Router();

/**
 * @swagger
 * /api/promotions: 
 *   get: 
 *     summary: 获取促销列表
 *     description: 获取所有促销或指定商品的促销
 *     tags: [促销管理]
 *     parameters:
 *       - in: query
 *         name: product_id
 *         schema:
 *           type: integer
 *         description: 商品 ID
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
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const { product_id } = req.query;
    
    let query = 'SELECT * FROM promotions';
    const params = [];
    
    if (product_id) {
      query += ' WHERE product_id = ?';
      params.push(product_id);
    }
    
    const [rows] = await pool.execute(query, params);
    
    res.json({
      success: true,
      code: 200,
      message: '获取促销列表成功',
      data: rows
    });
  } catch (error) {
    console.error('获取促销列表失败:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: '获取促销列表失败',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/promotions/{id}: 
 *   get: 
 *     summary: 获取促销详情
 *     description: 根据促销 ID 获取促销详情
 *     tags: [促销管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 促销 ID
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
 *         description: 促销不存在
 */
router.get('/:id', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM promotions WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: '促销不存在',
        data: null
      });
    }
    
    res.json({
      success: true,
      code: 200,
      message: '获取促销详情成功',
      data: rows[0]
    });
  } catch (error) {
    console.error('获取促销详情失败:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: '获取促销详情失败',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/promotions: 
 *   post: 
 *     summary: 创建促销
 *     description: 创建新促销
 *     tags: [促销管理]
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
 *               name:
 *                 type: string
 *                 description: 活动内容
 *               label:
 *                 type: string
 *                 description: 活动标签
 *               type:
 *                 type: string
 *                 description: 活动类型（赠品、折扣）
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
    const { product_id, name, label, type, start_time, end_time, quantity, sku_name, condition, image } = req.body;
    
    const [result] = await pool.execute(
      'INSERT INTO promotions (product_id, name, label, type, start_time, end_time, quantity, sku_name, promotion_condition, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [product_id, name, label, type, start_time, end_time, quantity, sku_name, condition, image]
    );
    
    res.json({
      success: true,
      code: 200,
      message: '创建促销成功',
      data: {
        id: result.insertId,
        product_id,
        name,
        label,
        type
      }
    });
  } catch (error) {
    console.error('创建促销失败:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: '创建促销失败',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/promotions/{id}: 
 *   put: 
 *     summary: 更新促销
 *     description: 更新指定促销
 *     tags: [促销管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 促销 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 活动内容
 *               label:
 *                 type: string
 *                 description: 活动标签
 *               type:
 *                 type: string
 *                 description: 活动类型（赠品、折扣）
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
 *         description: 促销不存在
 */
router.put('/:id', async (req, res) => {
  try {
    const pool = getPool();
    const { name, label, type, start_time, end_time, quantity, sku_name, condition, image } = req.body;
    
    const [result] = await pool.execute(
      'UPDATE promotions SET name = ?, label = ?, type = ?, start_time = ?, end_time = ?, quantity = ?, sku_name = ?, promotion_condition = ?, image = ? WHERE id = ?',
      [name, label, type, start_time, end_time, quantity, sku_name, condition, image, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: '促销不存在',
        data: null
      });
    }
    
    res.json({
      success: true,
      code: 200,
      message: '更新促销成功',
      data: {
        id: parseInt(req.params.id),
        name,
        label,
        type
      }
    });
  } catch (error) {
    console.error('更新促销失败:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: '更新促销失败',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/promotions/{id}: 
 *   delete: 
 *     summary: 删除促销
 *     description: 根据促销 ID 删除促销
 *     tags: [促销管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 促销 ID
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
 *         description: 促销不存在
 */
router.delete('/:id', async (req, res) => {
  try {
    const pool = getPool();
    const [result] = await pool.execute('DELETE FROM promotions WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: '促销不存在',
        data: null
      });
    }
    
    res.json({
      success: true,
      code: 200,
      message: '删除促销成功',
      data: null
    });
  } catch (error) {
    console.error('删除促销失败:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: '删除促销失败',
      data: null
    });
  }
});

export default router;