// 优惠券相关路由
import express from 'express';
import { getPool } from '../db/index.js';

const router = express.Router();

/**
 * @swagger
 * /api/coupons: 
 *   get: 
 *     summary: 获取优惠券列表
 *     description: 获取所有优惠券或指定商品的优惠券
 *     tags: [优惠券管理]
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
    
    let query = 'SELECT * FROM coupons';
    const params = [];
    
    if (product_id) {
      query += ' WHERE product_ids LIKE ?';
      params.push(`%${product_id}%`);
    }
    
    const [rows] = await pool.execute(query, params);
    
    // 解析product_ids字段
    const parsedRows = rows.map(row => {
      try {
        row.product_ids = JSON.parse(row.product_ids);
      } catch (error) {
        row.product_ids = [];
      }
      return row;
    });
    
    res.json({
      success: true,
      code: 200,
      message: '获取优惠券列表成功',
      data: parsedRows
    });
  } catch (error) {
    console.error('获取优惠券列表失败:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: '获取优惠券列表失败',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/coupons/{id}: 
 *   get: 
 *     summary: 获取优惠券详情
 *     description: 根据优惠券 ID 获取优惠券详情
 *     tags: [优惠券管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 优惠券 ID
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
 *         description: 优惠券不存在
 */
router.get('/:id', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM coupons WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: '优惠券不存在',
        data: null
      });
    }
    
    // 解析product_ids字段
    const coupon = rows[0];
    try {
      coupon.product_ids = JSON.parse(coupon.product_ids);
    } catch (error) {
      coupon.product_ids = [];
    }
    
    res.json({
      success: true,
      code: 200,
      message: '获取优惠券详情成功',
      data: coupon
    });
  } catch (error) {
    console.error('获取优惠券详情失败:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: '获取优惠券详情失败',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/coupons: 
 *   post: 
 *     summary: 创建优惠券
 *     description: 创建新优惠券
 *     tags: [优惠券管理]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 适用商品ID列表
 *               name:
 *                 type: string
 *                 description: 券名
 *               label:
 *                 type: string
 *                 description: 券标签
 *               discount_amount:
 *                 type: number
 *                 description: 优惠金额
 *               min_spend:
 *                 type: number
 *                 description: 使用条件（满多少）
 *               start_time:
 *                 type: string
 *                 description: 使用开始时间
 *               end_time:
 *                 type: string
 *                 description: 使用结束时间
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
    const { product_ids, name, label, discount_amount, min_spend, start_time, end_time } = req.body;
    const productIdsJson = JSON.stringify(product_ids);
    
    // 转换日期时间格式为MySQL接受的格式
    const formattedStartTime = new Date(start_time).toISOString().slice(0, 19).replace('T', ' ');
    const formattedEndTime = new Date(end_time).toISOString().slice(0, 19).replace('T', ' ');
    
    const [result] = await pool.execute(
      'INSERT INTO coupons (product_ids, name, label, discount_amount, min_spend, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [productIdsJson, name, label, discount_amount, min_spend, formattedStartTime, formattedEndTime]
    );
    
    res.json({
      success: true,
      code: 200,
      message: '创建优惠券成功',
      data: {
        id: result.insertId,
        product_ids,
        name,
        label,
        discount_amount,
        min_spend,
        start_time,
        end_time
      }
    });
  } catch (error) {
    console.error('创建优惠券失败:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: '创建优惠券失败',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/coupons/{id}: 
 *   put: 
 *     summary: 更新优惠券
 *     description: 更新指定优惠券
 *     tags: [优惠券管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 优惠券 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 适用商品ID列表
 *               name:
 *                 type: string
 *                 description: 券名
 *               label:
 *                 type: string
 *                 description: 券标签
 *               discount_amount:
 *                 type: number
 *                 description: 优惠金额
 *               min_spend:
 *                 type: number
 *                 description: 使用条件（满多少）
 *               start_time:
 *                 type: string
 *                 description: 使用开始时间
 *               end_time:
 *                 type: string
 *                 description: 使用结束时间
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
 *         description: 优惠券不存在
 */
router.put('/:id', async (req, res) => {
  try {
    const pool = getPool();
    const { product_ids, name, label, discount_amount, min_spend, start_time, end_time } = req.body;
    const productIdsJson = JSON.stringify(product_ids);
    
    // 转换日期时间格式为MySQL接受的格式
    const formattedStartTime = new Date(start_time).toISOString().slice(0, 19).replace('T', ' ');
    const formattedEndTime = new Date(end_time).toISOString().slice(0, 19).replace('T', ' ');
    
    const [result] = await pool.execute(
      'UPDATE coupons SET product_ids = ?, name = ?, label = ?, discount_amount = ?, min_spend = ?, start_time = ?, end_time = ? WHERE id = ?',
      [productIdsJson, name, label, discount_amount, min_spend, formattedStartTime, formattedEndTime, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: '优惠券不存在',
        data: null
      });
    }
    
    res.json({
      success: true,
      code: 200,
      message: '更新优惠券成功',
      data: {
        id: parseInt(req.params.id),
        product_ids,
        name,
        label,
        discount_amount,
        min_spend,
        start_time,
        end_time
      }
    });
  } catch (error) {
    console.error('更新优惠券失败:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: '更新优惠券失败',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/coupons/{id}: 
 *   delete: 
 *     summary: 删除优惠券
 *     description: 根据优惠券 ID 删除优惠券
 *     tags: [优惠券管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 优惠券 ID
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
 *         description: 优惠券不存在
 */
router.delete('/:id', async (req, res) => {
  try {
    const pool = getPool();
    const [result] = await pool.execute('DELETE FROM coupons WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: '优惠券不存在',
        data: null
      });
    }
    
    res.json({
      success: true,
      code: 200,
      message: '删除优惠券成功',
      data: null
    });
  } catch (error) {
    console.error('删除优惠券失败:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: '删除优惠券失败',
      data: null
    });
  }
});

export default router;