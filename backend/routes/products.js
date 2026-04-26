// 商品相关路由
import express from 'express';
import { getPool } from '../db/index.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({ storage });

/**
 * @swagger
 * /api/products: 
 *   get: 
 *     summary: 获取商品列表
 *     description: 获取商品列表，支持分页
 *     tags: [商品管理]
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
 *                     list:
 *                       type: array
 *                       items:
 *                         type: object
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    // 分页参数
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    
    // 获取商品总数
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM products');
    const total = countResult[0].total;
    
    // 获取分页商品列表
    const [rows] = await pool.execute(`SELECT * FROM products ORDER BY id DESC LIMIT ${pageSize} OFFSET ${offset}`);
    
    // 获取每个商品的规格和赠品信息
    for (const product of rows) {
      try {
        const [skus] = await pool.execute('SELECT * FROM product_skus WHERE product_id = ?', [product.id]);
        // 解析规格的images字段
        product.skus = skus.map(sku => {
          try {
            // 优先使用images字段，如果不存在则使用image字段
            if (sku.images) {
              sku.images = JSON.parse(sku.images);
            } else if (sku.image) {
              // 兼容旧数据格式
              sku.images = [sku.image];
            } else {
              sku.images = [];
            }
          } catch (error) {
            sku.images = [];
          }
          return sku;
        });
        console.log(`商品 ${product.id} 的规格:`, product.skus);
      } catch (error) {
        console.error(`获取商品 ${product.id} 的规格失败:`, error);
        product.skus = [];
      }
      
      try {
        const [promotions] = await pool.execute('SELECT * FROM promotions WHERE product_id = ?', [product.id]);
        product.promotions = promotions;
        console.log(`商品 ${product.id} 的促销:`, promotions);
      } catch (error) {
        console.error(`获取商品 ${product.id} 的促销失败:`, error);
        product.promotions = [];
      }
      
      try {
        const [discounts] = await pool.execute('SELECT * FROM discounts WHERE product_id = ?', [product.id]);
        product.discounts = discounts;
        console.log(`商品 ${product.id} 的折扣:`, discounts);
      } catch (error) {
        console.error(`获取商品 ${product.id} 的折扣失败:`, error);
        product.discounts = [];
      }
    }
    
    res.json({
      success: true,
      code: 200,
      message: '获取商品列表成功',
      data: {
        list: rows,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: '获取商品列表失败',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/products/{id}: 
 *   get: 
 *     summary: 获取商品详情
 *     description: 根据商品 ID 获取商品详情，包括规格和赠品信息
 *     tags: [商品管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
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
 *                   type: object
 *       404: 
 *         description: 商品不存在
 */
router.get('/:id', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: '商品不存在' });
    }
    const row = rows[0];
    
    const [skus] = await pool.execute('SELECT * FROM product_skus WHERE product_id = ?', [req.params.id]);
    // 获取有效期内的秒杀活动
    const [flashSales] = await pool.execute('SELECT * FROM flash_sales WHERE product_id = ? AND NOW() BETWEEN start_time AND end_time', [req.params.id]);
    // 解析规格的images字段并添加绑定的活动
    const parsedSkus = skus.map(sku => {
      try {
        // 优先使用images字段，如果不存在则使用image字段
        if (sku.images) {
          sku.images = JSON.parse(sku.images);
        } else if (sku.image) {
          // 兼容旧数据格式
          sku.images = [sku.image];
        } else {
          sku.images = [];
        }
      } catch (error) {
        sku.images = [];
      }
      // 添加绑定的秒杀活动（只返回一个活动对象）
      const skuActivities = flashSales.filter(sale => sale.sku_id === sku.id);
      sku.activities = skuActivities.length > 0 ? skuActivities[0] : null;
      return sku;
    });
    
    // 获取所有促销数据（包括过期的）
    const [promotions] = await pool.execute('SELECT * FROM promotions WHERE product_id = ?', [req.params.id]);
    
    // 提取促销活动标签并去重
    const promotionLabels = [...new Set(promotions.map(promotion => promotion.label).filter(label => label))];
    
    // 获取有效期内的商品优惠券
    const [coupons] = await pool.execute('SELECT * FROM coupons WHERE NOW() BETWEEN start_time AND end_time AND product_ids LIKE ?', [`%${req.params.id}%`]);
    
    // 解析 product_ids 为数组
    const parsedCoupons = coupons.map(coupon => {
      try {
        coupon.product_ids = JSON.parse(coupon.product_ids);
      } catch (error) {
        coupon.product_ids = [];
      }
      return coupon;
    });
    
    // 获取所有折扣数据
    const [discounts] = await pool.execute('SELECT * FROM discounts WHERE product_id = ?', [req.params.id]);
    
    // 生成标签
    const tags = [];
    // 添加折扣标签
    if (discounts.length > 0) {
      tags.push(discounts[0].name);
    }
    // 添加优惠券标签
    if (coupons.length > 0) {
      tags.push(...coupons.map(item=>item.label));
    }
    // 添加赠品标签
    if (promotions.length > 0) {
      tags.push('赠品');
    }
    
    res.json({
      success: true,
      code: 200,
      message: '获取商品详情成功',
      data: { 
        ...row, 
        skus: parsedSkus, 
        promotions, 
        promotion_labels: promotionLabels,
        discounts: discounts,
        coupons: parsedCoupons,
        tags
      }
    });
  } catch (error) {
    console.error('获取商品详情失败:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: '获取商品详情失败',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/products/{id}: 
 *   delete: 
 *     summary: 删除商品
 *     description: 根据商品 ID 删除商品，级联删除相关的规格、订单商品和赠品
 *     tags: [商品管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
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
 *                   type: null
 *       404: 
 *         description: 商品不存在
 */
router.delete('/:id', async (req, res) => {
  try {
    const pool = getPool();
    
    // 直接删除商品（级联删除会自动删除相关的规格、订单商品和赠品）
    const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '商品不存在' });
    }
    
    res.json({
      success: true,
      code: 200,
      message: '商品删除成功',
      data: null
    });
  } catch (error) {
    console.error('删除商品失败:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: '删除商品失败',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/products: 
 *   post: 
 *     summary: 创建商品
 *     description: 创建新商品，包括商品基本信息和规格
 *     tags: [商品管理]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 商品名称
 *               description:
 *                 type: string
 *                 description: 商品描述
 *               detail_description:
 *                 type: string
 *                 description: 商品详细描述
 *               price:
 *                 type: number
 *                 description: 商品价格
 *               original_price:
 *                 type: number
 *                 description: 商品原价
 *               stock:
 *                 type: integer
 *                 description: 商品库存
 *               category:
 *                 type: string
 *                 description: 商品分类
 *               theme:
 *                 type: string
 *                 description: 商品主题
 *               image:
 *                 type: string
 *                 description: 商品图片
 *               skus:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     sku_name:
 *                       type: string
 *                       description: 规格名称
 *                     price:
 *                       type: number
 *                       description: 规格价格
 *                     stock:
 *                       type: integer
 *                       description: 规格库存
 *                     images:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: 规格图片
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
    console.log('接收到的请求数据:', req.body);
    const pool = getPool();
    const { name, description, detail_description, price, original_price, stock, category, theme, image, measurement_type, skus, promotions, discounts } = req.body;
    
    // 开始事务
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // 插入商品
    const [result] = await connection.execute(
      'INSERT INTO products (name, description, detail_description, stock, category, image, theme, measurement_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description, detail_description, stock || 0, category, image, theme || 'red', measurement_type || 'spec']
    );
      
      const productId = result.insertId;
      
      // 处理规格
      if (skus && Array.isArray(skus)) {
        for (const sku of skus) {
          const { sku_name, price: skuPrice, actual_price: skuActualPrice, stock: skuStock, images } = sku;
          const imagesJson = JSON.stringify(images || []);
          
          await connection.execute(
            'INSERT INTO product_skus (product_id, sku_name, price, actual_price, stock, images) VALUES (?, ?, ?, ?, ?, ?)',
            [productId, sku_name, skuPrice, skuActualPrice || 0, skuStock || 0, imagesJson]
          );
        }
      }
      
      // 处理促销
      if (promotions && Array.isArray(promotions)) {
        for (const promotion of promotions) {
          const { name, label, type, start_time, end_time, quantity, sku_name, condition, image } = promotion;
          
          await connection.execute(
            'INSERT INTO promotions (product_id, name, label, type, start_time, end_time, quantity, sku_name, promotion_condition, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [productId, name, label, type, start_time, end_time, quantity, sku_name, condition, image]
          );
        }
      }
      
      // 处理折扣
      if (discounts && Array.isArray(discounts)) {
        for (const discount of discounts) {
          const { start_time, end_time, value, min_quantity } = discount;
          
          await connection.execute(
            'INSERT INTO discounts (product_id, start_time, end_time, value, min_quantity) VALUES (?, ?, ?, ?, ?)',
            [productId, start_time, end_time, value, min_quantity]
          );
        }
      }
      
      // 提交事务
      await connection.commit();
      
      res.json({
        success: true,
        code: 200,
        message: '创建商品成功',
        data: { id: productId, name, description, detail_description, stock, category, image, theme: theme || 'red' }
      });
    } catch (error) {
      // 回滚事务
      await connection.rollback();
      throw error;
    } finally {
      // 释放连接
      connection.release();
    }
  } catch (error) {
    console.error('创建商品失败:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: '创建商品失败',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/products/{id}/skus: 
 *   post: 
 *     summary: 创建商品规格
 *     description: 为指定商品创建新的规格
 *     tags: [商品管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 商品 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sku_name:
 *                 type: string
 *                 description: 规格名称
 *               price:
 *                 type: number
 *                 description: 规格价格
 *               stock:
 *                 type: integer
 *                 description: 规格库存
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 规格图片
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
router.post('/:id/skus', async (req, res) => {
  try {
    const pool = getPool();
    const { sku_name, price, actual_price, images } = req.body;
    const imagesJson = JSON.stringify(images || []);
    
    const [result] = await pool.execute(
      'INSERT INTO product_skus (product_id, sku_name, price, actual_price, images) VALUES (?, ?, ?, ?, ?)',
      [req.params.id, sku_name, price, actual_price || 0, imagesJson]
    );
    
    res.json({
      success: true,
      code: 200,
      message: '创建商品规格成功',
      data: { id: result.insertId, product_id: req.params.id, sku_name, price, actual_price: actual_price || 0, images: images || [] }
    });
  } catch (error) {
    console.error('创建规格失败:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: '创建规格失败',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/products/{productId}/skus/{skuId}: 
 *   put: 
 *     summary: 更新商品规格
 *     description: 更新指定商品的指定规格
 *     tags: [商品管理]
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 商品 ID
 *       - in: path
 *         name: skuId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 规格 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sku_name:
 *                 type: string
 *                 description: 规格名称
 *               price:
 *                 type: number
 *                 description: 规格价格
 *               stock:
 *                 type: integer
 *                 description: 规格库存
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 规格图片
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
 *         description: 规格不存在
 */
router.put('/:productId/skus/:skuId', async (req, res) => {
  try {
    const pool = getPool();
    const { sku_name, price, actual_price, images } = req.body;
    const imagesJson = JSON.stringify(images || []);
    
    const [result] = await pool.execute(
      'UPDATE product_skus SET sku_name = ?, price = ?, actual_price = ?, images = ? WHERE id = ? AND product_id = ?',
      [sku_name, price, actual_price || 0, imagesJson, req.params.skuId, req.params.productId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '规格不存在' });
    }
    
    res.json({
      success: true,
      code: 200,
      message: '更新商品规格成功',
      data: { id: req.params.skuId, product_id: req.params.productId, sku_name, price, actual_price: actual_price || 0, images: images || [] }
    });
  } catch (error) {
    console.error('更新规格失败:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: '更新规格失败',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/products/skus/{id}: 
 *   delete: 
 *     summary: 删除商品规格
 *     description: 根据规格 ID 删除商品规格
 *     tags: [商品管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 规格 ID
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
 *         description: 规格不存在
 */
router.delete('/skus/:id', async (req, res) => {
  try {
    const pool = getPool();
    
    const [result] = await pool.execute('DELETE FROM product_skus WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '规格不存在' });
    }
    
    res.json({
      success: true,
      code: 200,
      message: '规格删除成功',
      data: null
    });
  } catch (error) {
    console.error('删除规格失败:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: '删除规格失败',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/products/{id}: 
 *   put: 
 *     summary: 更新商品
 *     description: 更新指定商品的信息，包括基本信息和规格
 *     tags: [商品管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 商品 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 商品名称
 *               description:
 *                 type: string
 *                 description: 商品描述
 *               detail_description:
 *                 type: string
 *                 description: 商品详细描述
 *               price:
 *                 type: number
 *                 description: 商品价格
 *               original_price:
 *                 type: number
 *                 description: 商品原价
 *               stock:
 *                 type: integer
 *                 description: 商品库存
 *               category:
 *                 type: string
 *                 description: 商品分类
 *               theme:
 *                 type: string
 *                 description: 商品主题
 *               image:
 *                 type: string
 *                 description: 商品图片
 *               skus:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     sku_name:
 *                       type: string
 *                       description: 规格名称
 *                     price:
 *                       type: number
 *                       description: 规格价格
 *                     stock:
 *                       type: integer
 *                       description: 规格库存
 *                     images:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: 规格图片
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
router.put('/:id', async (req, res) => {
  try {
    const pool = getPool();
    const { name, description, detail_description, price, original_price, stock, category, theme, image, measurement_type, skus, promotions, discounts } = req.body;
    
    // 开始事务
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // 更新商品信息
      const updateFields = [];
      const updateValues = [];
      
      if (name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(name);
      }
      if (description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(description);
      }
      if (detail_description !== undefined) {
        updateFields.push('detail_description = ?');
        updateValues.push(detail_description);
      }
      if (price !== undefined) {
        updateFields.push('price = ?');
        updateValues.push(price);
      }
      if (original_price !== undefined) {
        updateFields.push('original_price = ?');
        updateValues.push(original_price);
      }
      if (stock !== undefined) {
        updateFields.push('stock = ?');
        updateValues.push(stock);
      }
      if (category !== undefined) {
        updateFields.push('category = ?');
        updateValues.push(category);
      }
      if (image !== undefined) {
        updateFields.push('image = ?');
        updateValues.push(image);
      }
      if (theme !== undefined) {
        updateFields.push('theme = ?');
        updateValues.push(theme || 'red');
      }
      if (measurement_type !== undefined) {
        updateFields.push('measurement_type = ?');
        updateValues.push(measurement_type || 'spec');
      }
      
      if (updateFields.length > 0) {
        updateValues.push(req.params.id);
        await connection.execute(
          `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`,
          updateValues
        );
      }
      
      // 处理规格
      if (skus && Array.isArray(skus)) {
        // 获取现有规格
        const [existingSkus] = await connection.execute('SELECT id FROM product_skus WHERE product_id = ?', [req.params.id]);
        const existingSkuIds = existingSkus.map(sku => sku.id);
        
        // 记录需要保留的规格 id
        const retainedSkuIds = [];
        
        // 处理每个规格
        for (const sku of skus) {
          const { id, sku_name, price: skuPrice, actual_price: skuActualPrice, stock: skuStock, images } = sku;
          const imagesJson = JSON.stringify(images || []);
          
          if (id) {
            // 更新现有规格
            await connection.execute(
              'UPDATE product_skus SET sku_name = ?, price = ?, actual_price = ?, stock = ?, images = ? WHERE id = ? AND product_id = ?',
              [sku_name, skuPrice, skuActualPrice || 0, skuStock || 0, imagesJson, id, req.params.id]
            );
            retainedSkuIds.push(id);
          } else {
            // 添加新规格
            await connection.execute(
              'INSERT INTO product_skus (product_id, sku_name, price, actual_price, stock, images) VALUES (?, ?, ?, ?, ?, ?)',
              [req.params.id, sku_name, skuPrice, skuActualPrice || 0, skuStock || 0, imagesJson]
            );
          }
        }
        
        // 删除不再存在的规格
        const toDeleteIds = existingSkuIds.filter(id => !retainedSkuIds.includes(id));
        if (toDeleteIds.length > 0) {
          await connection.execute(
            `DELETE FROM product_skus WHERE id IN (${toDeleteIds.map(() => '?').join(',')}) AND product_id = ?`,
            [...toDeleteIds, req.params.id]
          );
        }
      }
      
      // 处理促销
      if (promotions && Array.isArray(promotions)) {
        // 删除旧的促销
        await connection.execute('DELETE FROM promotions WHERE product_id = ?', [req.params.id]);
        
        // 添加新的促销
        for (const promotion of promotions) {
          const { name, label, type, start_time, end_time, quantity, sku_name, condition, image } = promotion;
          
          await connection.execute(
            'INSERT INTO promotions (product_id, name, label, type, start_time, end_time, quantity, sku_name, promotion_condition, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [req.params.id, name, label, type, start_time, end_time, quantity, sku_name, condition, image]
          );
        }
      }
      
      // 处理折扣
      if (discounts && Array.isArray(discounts)) {
        // 删除旧的折扣
        await connection.execute('DELETE FROM discounts WHERE product_id = ?', [req.params.id]);
        
        // 添加新的折扣
        for (const discount of discounts) {
          const { start_time, end_time, value, min_quantity } = discount;
          
          await connection.execute(
            'INSERT INTO discounts (product_id, start_time, end_time, value, min_quantity) VALUES (?, ?, ?, ?, ?)',
            [req.params.id, start_time, end_time, value, min_quantity]
          );
        }
      }
      
      // 提交事务
      await connection.commit();
      
      // 获取更新后的商品信息
      const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
      const updatedProduct = rows[0];
      
      // 获取更新后的规格信息
      const [skusRows] = await pool.execute('SELECT * FROM product_skus WHERE product_id = ?', [req.params.id]);
      updatedProduct.skus = skusRows.map(sku => {
        try {
          sku.images = sku.images ? JSON.parse(sku.images) : [];
        } catch (error) {
          sku.images = [];
        }
        return sku;
      });
      
      // 获取更新后的促销信息
      const [promotionsRows] = await pool.execute('SELECT * FROM promotions WHERE product_id = ?', [req.params.id]);
      updatedProduct.promotions = promotionsRows;
      
      // 获取更新后的折扣信息
      const [discountsRows] = await pool.execute('SELECT * FROM discounts WHERE product_id = ?', [req.params.id]);
      updatedProduct.discounts = discountsRows;
      
      res.json({
        success: true,
        code: 200,
        message: '更新商品成功',
        data: updatedProduct
      });
    } catch (error) {
      // 回滚事务
      await connection.rollback();
      throw error;
    } finally {
      // 释放连接
      connection.release();
    }
  } catch (error) {
    console.error('更新商品失败:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: '更新商品失败',
      data: null
    });
  }
});

export default router;