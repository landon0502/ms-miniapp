// miniapp 商品相关路由
import express from 'express';
import { getPool } from '../db/index.js';

const router = express.Router();

/**
 * @swagger
 * /api/miniapp/products: 
 *   get: 
 *     summary: 获取商品列表（miniapp专用）
 *     description: 获取商品列表，支持分页，不需要登录鉴权
 *     tags: [Miniapp商品管理]
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
        
      } catch (error) {
        
        product.skus = [];
      }
      
      try {
        const [promotions] = await pool.execute('SELECT * FROM promotions WHERE product_id = ?', [product.id]);
        product.promotions = promotions;
        
      } catch (error) {
        
        product.promotions = [];
      }
      
      try {
        const [discounts] = await pool.execute('SELECT * FROM discounts WHERE product_id = ?', [product.id]);
        product.discounts = discounts;
        
      } catch (error) {
        
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
 * /api/miniapp/products/{id}: 
 *   get: 
 *     summary: 获取商品详情（miniapp专用）
 *     description: 根据商品 ID 获取商品详情，包括规格和赠品信息，不需要登录鉴权
 *     tags: [Miniapp商品管理]
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
    
    // 过滤出在活动时间范围内的促销活动，或未设置时间的促销活动
    const validPromotions = promotions.filter(promotion => {
      const now = new Date();
      const startTime = promotion.start_time ? new Date(promotion.start_time) : null;
      const endTime = promotion.end_time ? new Date(promotion.end_time) : null;
      
      // 如果未设置时间，则直接通过
      if (!startTime && !endTime) {
        return true;
      }
      
      // 校验当前时间是否在活动时间范围内
      let valid = true;
      if (startTime) {
        valid = valid && now >= startTime;
      }
      if (endTime) {
        valid = valid && now <= endTime;
      }
      return valid;
    });
    
    // 提取促销活动标签并去重
    const promotionLabels = [...new Set(validPromotions.map(promotion => promotion.label).filter(label => label))];
    
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
    
    // 获取有效期内的商品折扣，优先根据 min_quantity 升序返回，如果 min_quantity 相同，则根据 value 升序进行返回
    const [discounts] = await pool.execute('SELECT * FROM discounts WHERE product_id = ? AND ((end_time IS NULL OR end_time >= NOW()) AND (start_time IS NULL OR start_time <= NOW())) ORDER BY min_quantity ASC, value ASC', [req.params.id]);
    
    // 生成标签
    const tags = [];
    // 添加折扣标签
    if (discounts.length > 0) {
      discounts.forEach(discount => {
        // 处理折扣值，整数时不显示小数
        const discountValue = parseFloat(discount.value);
        const displayValue = Number.isInteger(discountValue) ? discountValue : discount.value;
        if (discount.min_quantity === 1) {
          tags.push(`${displayValue}折`);
        } else {
          tags.push(`${discount.min_quantity}件${displayValue}折`);
        }
      });
    }
    // 添加优惠券标签
    if (coupons.length > 0) {
      tags.push(...coupons.map(item=>item.label));
    }
    // 添加赠品标签
    if (validPromotions.length > 0) {
      tags.push(...promotionLabels);
    }
    
    res.json({
      success: true,
      code: 200,
      message: '获取商品详情成功',
      data: { 
        ...row, 
        skus: parsedSkus, 
        promotions: validPromotions, 
        promotion_labels: promotionLabels,
        discounts: discounts,
        coupons: parsedCoupons,
        tags
      }
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      code: 500,
      message: '获取商品详情失败',
      data: null
    });
  }
});

export default router;