// miniapp 订单相关路由
import express from 'express';
import { getPool } from '../db/index.js';
import dayjs from 'dayjs';
import Decimal from 'decimal.js';

const router = express.Router();

/**
 * @swagger
 * /api/miniapp/orders: 
 *   get: 
 *     summary: 获取订单列表（miniapp专用）
 *     description: 获取订单列表，支持分页，不需要登录鉴权
 *     tags: [Miniapp订单管理]
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
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: 用户ID（可选，用于获取特定用户的订单）
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
    console.log('开始处理 miniapp 获取订单列表请求');
    const pool = getPool();
    console.log('获取数据库连接池成功');
    // 分页参数
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const status = req.query.status || 'all';
    const userId = req.query.user_id;
    const offset = (page - 1) * pageSize;
    console.log('分页参数:', { page, pageSize, status, userId, offset });
    
    // 构建查询条件
    let whereClause = '';
    let params = [];
    
    if (status !== 'all') {
      whereClause = `WHERE status = ?`;
      params.push(status);
    }
    
    if (userId) {
      whereClause = whereClause ? `${whereClause} AND user_id = ?` : `WHERE user_id = ?`;
      params.push(userId);
    }
    
    // 获取订单总数
    console.log('开始获取订单总数');
    let countSql = `SELECT COUNT(*) as total FROM orders ${whereClause}`;
    const [countResult] = await pool.execute(countSql, params);
    const total = countResult[0].total;
    console.log('订单总数:', total);
    
    // 获取分页订单列表
    console.log('开始获取订单列表');
    let sql = `SELECT * FROM orders ${whereClause} ORDER BY id DESC LIMIT ${Number(pageSize)} OFFSET ${Number(offset)}`;
    console.log('执行SQL:', sql);
    const [rows] = await pool.execute(sql, params);
    console.log('获取到订单数量:', rows.length);
    
    // 获取每个订单的商品信息
    console.log('开始获取订单商品信息');
    for (const order of rows) {
      console.log('处理订单ID:', order.id);
      const [items] = await pool.execute('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      console.log('订单商品数量:', items.length);
      // 获取每个商品的详细信息
      for (const item of items) {
        console.log('处理商品ID:', item.product_id);
        const [product] = await pool.execute('SELECT * FROM products WHERE id = ?', [item.product_id]);
        if (product.length > 0) {
          item.product = product[0];
          console.log('获取商品信息成功');
        }
        if (item.sku_id) {
          console.log('处理规格ID:', item.sku_id);
          const [sku] = await pool.execute('SELECT * FROM product_skus WHERE id = ?', [item.sku_id]);
          if (sku.length > 0) {
            item.sku = sku[0];
            // 确保 images 字段是数组
            if (item.sku.images) {
              try {
                item.sku.images = JSON.parse(item.sku.images);
              } catch (e) {
                // 如果解析失败，设为空数组
                item.sku.images = [];
              }
            } else {
              item.sku.images = [];
            }
            console.log('获取规格信息成功');
          }
        }
      }
      order.items = items;
      // 格式化时间字段
      order.order_time = order.order_time ? dayjs(order.order_time).format('YYYY-MM-DD HH:mm:ss') : null;
      order.departure_time = order.departure_time ? dayjs(order.departure_time).format('YYYY-MM-DD HH:mm:ss') : null;
    }
    
    console.log('准备返回订单列表');
    res.json({
      success: true,
      code: 200,
      message: '获取订单列表成功',
      data: {
        list: rows,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: '获取订单列表失败',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/miniapp/orders: 
 *   post: 
 *     summary: 创建订单（miniapp专用）
 *     description: 创建新订单，包括订单基本信息和商品信息，不需要登录鉴权
 *     tags: [Miniapp订单管理]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: 用户 ID
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                       description: 商品 ID
 *                     sku_id:
 *                       type: integer
 *                       description: 规格 ID
 *                     quantity:
 *                       type: integer
 *                       description: 商品数量
 *                     price:
 *                       type: number
 *                       description: 商品价格
 *               total_price:
 *                 type: number
 *                 description: 订单总价
 *               actual_price:
 *                 type: number
 *                 description: 实际支付价格
 *               departure_time:
 *                 type: string
 *                 format: date-time
 *                 description: 离岛时间
 *               sub_order_no:
 *                 type: string
 *                 description: 子订单号
 *               order_time:
 *                 type: string
 *                 format: date-time
 *                 description: 下单时间
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
 *       400: 
 *         description: 请求参数不完整
 */
router.post('/', async (req, res) => {
  console.log('收到 miniapp 创建订单请求');
  console.log('请求体:', JSON.stringify(req.body, null, 2));
  
  try {
    const pool = getPool();
    
    // 验证请求参数
    if (!req.body.user_id || !req.body.items || !req.body.total_price || !req.body.actual_price) {
      console.error('请求参数不完整');
      return res.status(400).json({ error: '请求参数不完整' });
    }
    
    const { user_id, items, total_price, actual_price, departure_time, sub_order_no, order_time, order_no: provided_order_no } = req.body;
    
    // 生成订单号函数
    const generateOrderNo = () => {
      // 系统标识（4位）
      const systemCode = '7018';
      // 日期（6位，YYMMDD）
      const date = new Date();
      const year = String(date.getFullYear()).slice(2); // 取年份后两位
      const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份补零
      const day = String(date.getDate()).padStart(2, '0'); // 日期补零
      const dateStr = year + month + day;
      // 随机序列（11位）
      const randomSeq = Math.floor(Math.random() * 100000000000).toString().padStart(11, '0');
      // 主订单号末尾两位固定为00
      return systemCode + dateStr + randomSeq + '00';
    };
    
    // 如果没有提供订单号，自动生成一个
    const order_no = provided_order_no || generateOrderNo();
    
    // 生成子订单号函数
    const generateSubOrderNo = (mainOrderNo) => {
      // 子订单号在主订单号基础上加1
      const orderNoNum = parseInt(mainOrderNo);
      const subOrderNoNum = orderNoNum + 1;
      return String(subOrderNoNum);
    };
    
    // 如果没有提供子订单号，自动生成一个
    const generated_sub_order_no = sub_order_no || generateSubOrderNo(order_no);
    
    console.log('准备创建订单，订单号:', order_no);
    
    // 尝试创建订单
    try {
      // 生成港区单号（如果没有提供）
      const generatePortOrderNo = () => {
        // 格式：02 + YYYYMMDD + 时间戳（精确到秒） + 随机序列
        // 示例：0220240630231849319888371
        const portCode = '02'; // 港区代码
        const date = new Date();
        const dateStr = date.getFullYear() + String(date.getMonth() + 1).padStart(2, '0') + String(date.getDate()).padStart(2, '0'); // YYYYMMDD
        const timeStr = String(date.getHours()).padStart(2, '0') + String(date.getMinutes()).padStart(2, '0') + String(date.getSeconds()).padStart(2, '0'); // HHMMSS
        const timestamp = Date.now(); // 时间戳
        const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0'); // 6位随机数
        return portCode + dateStr + timeStr + timestamp.toString().slice(-9) + random;
      };
      
      // 确保所有参数都不是 undefined
    const pointsDeduction = req.body.points_deduction !== undefined ? req.body.points_deduction : 0;
    const mailTax = req.body.mail_tax !== undefined ? req.body.mail_tax : 0;
    const mailTaxDiscount = req.body.mail_tax_discount !== undefined ? req.body.mail_tax_discount : 0;
    const isPortPickup = req.body.is_port_pickup !== undefined ? req.body.is_port_pickup : 0;
    const offlineFlight = req.body.offline_flight !== undefined ? req.body.offline_flight : 'HA2140';
    const consigneeName = req.body.consignee_name !== undefined ? req.body.consignee_name : '';
    const consigneePhone = req.body.consignee_phone !== undefined ? req.body.consignee_phone : '';
    const consigneeIdcard = req.body.consignee_idcard !== undefined ? req.body.consignee_idcard : '';
    const portOrderNo = req.body.port_order_no !== undefined && req.body.port_order_no !== '' ? req.body.port_order_no : generatePortOrderNo();
    const route = req.body.route !== undefined ? req.body.route : '';
    const vehicleType = req.body.vehicle_type !== undefined ? req.body.vehicle_type : '';
    const departurePort = req.body.departure_port !== undefined ? req.body.departure_port : '';
    const destinationPort = req.body.destination_port !== undefined ? req.body.destination_port : '';
    const passengerPrice = req.body.passenger_price !== undefined ? req.body.passenger_price : 0;
    const vehiclePrice = req.body.vehicle_price !== undefined ? req.body.vehicle_price : 0;
    const valueAddedService = req.body.value_added_service !== undefined ? req.body.value_added_service : 0;
    const orderTempl = req.body.order_templ !== undefined ? req.body.order_templ : 1;
    const departureTime = departure_time !== undefined ? departure_time : null;
    const orderTime = order_time !== undefined ? order_time : new Date();
    const shippingStore = '海南电商离岛免税';
      
      // 检查所有参数是否都不是 undefined
      console.log('参数检查:', {
        order_no: order_no !== undefined,
        generated_sub_order_no: generated_sub_order_no !== undefined,
        user_id: user_id !== undefined,
        total_price: total_price !== undefined,
        actual_price: actual_price !== undefined,
        pointsDeduction: pointsDeduction !== undefined,
        mailTax: mailTax !== undefined,
        mailTaxDiscount: mailTaxDiscount !== undefined,
        isPortPickup: isPortPickup !== undefined,
        offlineFlight: offlineFlight !== undefined,
        consigneeName: consigneeName !== undefined,
        consigneePhone: consigneePhone !== undefined,
        consigneeIdcard: consigneeIdcard !== undefined,
        portOrderNo: portOrderNo !== undefined,
        route: route !== undefined,
        vehicleType: vehicleType !== undefined,
        departurePort: departurePort !== undefined,
        destinationPort: destinationPort !== undefined,
        passengerPrice: passengerPrice !== undefined,
        vehiclePrice: vehiclePrice !== undefined,
        valueAddedService: valueAddedService !== undefined,
        status: 'pending' !== undefined,
        departureTime: departureTime !== undefined,
        orderTime: orderTime !== undefined,
        shippingStore: shippingStore !== undefined
      });
      
      const [orderResult] = await pool.execute(
        'INSERT INTO orders (order_no, sub_order_no, user_id, total_price, actual_price, points_deduction, mail_tax, mail_tax_discount, is_port_pickup, offline_flight, consignee_name, consignee_phone, consignee_idcard, port_order_no, route, vehicle_type, departure_port, destination_port, passenger_price, vehicle_price, value_added_service, order_templ, status, departure_time, order_time, shipping_store) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [order_no, generated_sub_order_no, user_id, total_price, actual_price, pointsDeduction, mailTax, mailTaxDiscount, isPortPickup, offlineFlight, consigneeName, consigneePhone, consigneeIdcard, portOrderNo, route, vehicleType, departurePort, destinationPort, passengerPrice, vehiclePrice, valueAddedService, orderTempl, 'pending', departureTime, orderTime, shippingStore]
      );
      
      const orderId = orderResult.insertId;
      console.log('创建订单成功，订单ID:', orderId);
      
      // 尝试添加订单商品
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        console.log('添加订单项', i + 1, ':', item);
        
        try {
          // 确保所有参数都不是 undefined
          const productId = item.product_id !== undefined ? item.product_id : null;
          const skuId = item.sku_id !== undefined ? item.sku_id : null;
          const quantity = item.quantity !== undefined ? item.quantity : 1;
          const price = item.discount_amount !== undefined ? item.discount_amount : 0;
          const discountAmount = item.discount_amount !== undefined ? item.discount_amount : 0;
          
          await pool.execute(
            'INSERT INTO order_items (order_id, product_id, sku_id, quantity, price, discount_amount) VALUES (?, ?, ?, ?, ?, ?)',
            [orderId, productId, skuId, quantity, price, discountAmount]
          );
          console.log('订单项添加成功');
        } catch (itemError) {
          console.error('添加订单项失败:', itemError);
          // 继续处理其他订单项
        }
      }
      
      console.log('订单创建完成');
      res.json({
        success: true,
        code: 200,
        message: '创建订单成功',
        data: { id: orderId, order_no, sub_order_no: generated_sub_order_no, user_id, total_price, actual_price, order_templ: orderTempl, status: 'pending', departure_time, order_time, shipping_store: '海南电商离岛免税' }
      });
    } catch (orderError) {
      console.error('创建订单失败:', orderError);
      res.status(500).json({
        success: false,
        code: 500,
        message: '创建订单失败',
        data: null
      });
    }
  } catch (error) {
    console.error('服务器内部错误:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/miniapp/orders/{id}: 
 *   get: 
 *     summary: 获取订单详情（miniapp专用）
 *     description: 根据订单 ID 获取订单详情，包括订单基本信息和商品信息，不需要登录鉴权
 *     tags: [Miniapp订单管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 订单 ID
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
 *                     order_time:
 *                       type: string
 *                       description: 下单时间
 *                     order_no:
 *                       type: string
 *                       description: 订单编号
 *                     departure_time:
 *                       type: string
 *                       description: 离港时间
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           product_name:
 *                             type: string
 *                             description: 商品名称
 *                           quantity:
 *                             type: integer
 *                             description: 购买数量
 *                           original_price:
 *                             type: number
 *                             description: 商品原价
 *                           actual_price:
 *                             type: number
 *                             description: 商品实付价格
 *                           image:
 *                             type: string
 *                             description: 商品规格第一张图片
 *                     points_deduction:
 *                       type: number
 *                       description: 积分抵扣
 *                     discount:
 *                       type: number
 *                       description: 折扣优惠
 *                     total_original_price:
 *                       type: number
 *                       description: 订单支付原价总价
 *                     mail_tax:
 *                       type: number
 *                       description: 行邮税
 *                     mail_tax_discount:
 *                       type: number
 *                       description: 行邮税优惠
 */
router.get('/:id', async (req, res) => {
  try {
    console.log('开始获取 miniapp 订单详情，订单ID:', req.params.id);
    const pool = getPool();
    
    // 获取订单基本信息
    const [orderResult] = await pool.execute('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (orderResult.length === 0) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: '订单不存在',
        data: null
      });
    }
    
    const order = orderResult[0];
    
    // 获取订单商品信息
    const [itemsResult] = await pool.execute('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
    
    let totalOriginalPrice = 0;
    let totalActualPrice = 0;
    const items = [];
    
    // 处理每个商品
    for (const item of itemsResult) {
      try {
        // 获取商品信息
        const [productResult] = await pool.execute('SELECT * FROM products WHERE id = ?', [item.product_id]);
        const product = productResult[0];
        
        // 获取商品规格信息
        let sku = null;
        let image = '';
        if (item.sku_id) {
          const [skuResult] = await pool.execute('SELECT * FROM product_skus WHERE id = ?', [item.sku_id]);
          if (skuResult.length > 0) {
            sku = skuResult[0];
            // 处理图片
            if (sku.images) {
              try {
                const images = JSON.parse(sku.images);
                if (Array.isArray(images) && images.length > 0) {
                  image = images[0];
                }
              } catch (e) {
                console.error('解析图片失败:', e);
              }
            }
          }
        }
        
        // 计算商品原价（使用 sku 的价格或 product 的价格）
        const originalPrice = parseFloat(sku?.price || product?.price || 0);
        const actualPrice = parseFloat(item.discount_amount || 0);
        
        // 计算总价
        totalOriginalPrice += originalPrice * item.quantity;
        totalActualPrice += actualPrice;
        
        // 添加商品信息
        items.push({
          product_id: item.product_id,
          sku_id: item.sku_id,
          product_name: product?.name || '',
          quantity: item.quantity,
          original_price: originalPrice,
          actual_price: actualPrice,
          image: image
        });
      } catch (error) {
        console.error('处理订单项失败:', error);
        // 继续处理其他订单项
      }
    }
    
    // 计算折扣优惠
    const discount = new Decimal(totalOriginalPrice).minus(new Decimal(totalActualPrice))
      .abs() // 确保结果为正数
      .toFixed(2); // 保留两位小数
    
    // 处理收货人信息脱敏
    const maskPhone = (phone) => {
      if (!phone || phone.length < 11) return phone;
      return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    };
    
    const maskIdcard = (idcard) => {
      if (!idcard || idcard.length < 18) return idcard;
      return idcard.replace(/(\d{4})\d{10}(\d{4})/, '$1**********$2');
    };
    
    const maskName = (name) => {
      if (!name || name.length < 2) return name;
      return '*' + name.substring(1);
    };
    
    // 构建响应数据
    const responseData = {
      order_time: order.order_time ? dayjs(order.order_time).format('YYYY-MM-DD HH:mm:ss') : null,
      order_no: order.order_no,
      order_templ: order.order_templ || 1,
      items: items,
      points_deduction: order.points_deduction || 0,
      discount: discount,
      total_original_price: totalOriginalPrice,
      mail_tax: order.mail_tax || 0, // 从数据库中取值
      mail_tax_discount: order.mail_tax_discount || 0, // 从数据库中取值
      consignee_name: maskName(order.consignee_name), // 脱敏处理
      consignee_phone: maskPhone(order.consignee_phone), // 脱敏处理
      consignee_idcard: maskIdcard(order.consignee_idcard), // 脱敏处理
      route_info: {
        port_order_no: order.port_order_no || '',
        route: order.route || '',
        offline_flight: order.offline_flight || 'HA2140', // 从数据库中取值，移到route_info中
        departure_time: order.departure_time ? dayjs(order.departure_time).format('YYYY-MM-DD HH:mm:ss') : null,
        vehicle_type: order.vehicle_type || '',
        departure_port: order.departure_port || '',
        destination_port: order.destination_port || '',
        passenger_price: order.passenger_price || 0,
        vehicle_price: order.vehicle_price || 0,
        value_added_service: order.value_added_service || 0,
        total_amount: order.total_price || 0,
        booking_time: order.order_time ? dayjs(order.order_time).format('YYYY-MM-DD HH:mm:ss') : null
      }
    };
    
    console.log('获取订单详情成功');
    res.json({
      success: true,
      code: 200,
      message: '获取订单详情成功',
      data: responseData
    });
  } catch (error) {
    console.error('获取订单详情失败:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: '获取订单详情失败',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/miniapp/orders/{id}: 
 *   put: 
 *     summary: 更新订单（miniapp专用）
 *     description: 更新指定订单的信息，包括基本信息和商品信息，不需要登录鉴权
 *     tags: [Miniapp订单管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 订单 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: 用户 ID
 *               total_price:
 *                 type: number
 *                 description: 订单总价
 *               actual_price:
 *                 type: number
 *                 description: 实际支付价格
 *               status:
 *                 type: string
 *                 description: 订单状态
 *               departure_time:
 *                 type: string
 *                 format: date-time
 *                 description: 离岛时间
 *               sub_order_no:
 *                 type: string
 *                 description: 子订单号
 *               order_time:
 *                 type: string
 *                 format: date-time
 *                 description: 下单时间
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                       description: 商品 ID
 *                     sku_id:
 *                       type: integer
 *                       description: 规格 ID
 *                     quantity:
 *                       type: integer
 *                       description: 商品数量
 *                     price:
 *                       type: number
 *                       description: 商品价格
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
  console.log('收到 miniapp 更新订单请求');
  console.log('订单ID:', req.params.id);
  console.log('请求体:', JSON.stringify(req.body, null, 2));
  
  try {
    const pool = getPool();
    const { user_id, total_price, actual_price, status, departure_time, sub_order_no, order_time, items } = req.body;
    // 如果没有提供子订单号，自动生成一个
    const generated_sub_order_no = sub_order_no || 'SUB' + Date.now() + Math.floor(Math.random() * 1000);
    
    // 生成随机港区单号（如果没有提供）
    const generatePortOrderNo = () => {
      const timestamp = new Date().getTime();
      const random = Math.floor(Math.random() * 10000);
      return `PORT${timestamp}${random}`;
    };
    
    // 开始事务
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // 先获取订单当前信息
      const [currentOrder] = await connection.execute('SELECT * FROM orders WHERE id = ?', [req.params.id]);
      if (currentOrder.length === 0) {
        throw new Error('订单不存在');
      }
      
      // 使用固定的SQL语句和参数
    const sql = `UPDATE orders SET 
      user_id = ?, 
      total_price = ?, 
      actual_price = ?, 
      points_deduction = ?, 
      mail_tax = ?, 
      mail_tax_discount = ?, 
      is_port_pickup = ?, 
      offline_flight = ?, 
      consignee_name = ?, 
      consignee_phone = ?, 
      consignee_idcard = ?, 
      port_order_no = ?, 
      route = ?, 
      vehicle_type = ?, 
      departure_port = ?, 
      destination_port = ?, 
      passenger_price = ?, 
      vehicle_price = ?, 
      value_added_service = ?, 
      order_templ = ?, 
      status = ?, 
      departure_time = ?, 
      sub_order_no = ?, 
      order_time = ?, 
      shipping_store = ? 
      WHERE id = ?`;
    
    const params = [
      user_id !== undefined ? user_id : currentOrder[0].user_id,
      (total_price !== undefined && total_price !== null && total_price > 0) ? total_price : currentOrder[0].total_price,
      (actual_price !== undefined && actual_price !== null && actual_price > 0) ? actual_price : currentOrder[0].actual_price,
      req.body.points_deduction !== undefined ? req.body.points_deduction : currentOrder[0].points_deduction || 0,
      req.body.mail_tax !== undefined ? req.body.mail_tax : currentOrder[0].mail_tax || 0,
      req.body.mail_tax_discount !== undefined ? req.body.mail_tax_discount : currentOrder[0].mail_tax_discount || 0,
      req.body.is_port_pickup !== undefined ? req.body.is_port_pickup : currentOrder[0].is_port_pickup || 0,
      req.body.offline_flight !== undefined ? req.body.offline_flight : currentOrder[0].offline_flight || 'HA2140',
      req.body.consignee_name !== undefined ? req.body.consignee_name : currentOrder[0].consignee_name || '',
      req.body.consignee_phone !== undefined ? req.body.consignee_phone : currentOrder[0].consignee_phone || '',
      req.body.consignee_idcard !== undefined ? req.body.consignee_idcard : currentOrder[0].consignee_idcard || '',
      req.body.port_order_no !== undefined && req.body.port_order_no !== '' ? req.body.port_order_no : (currentOrder[0].port_order_no || generatePortOrderNo()),
      req.body.route !== undefined ? req.body.route : currentOrder[0].route || '',
      req.body.vehicle_type !== undefined ? req.body.vehicle_type : currentOrder[0].vehicle_type || '',
      req.body.departure_port !== undefined ? req.body.departure_port : currentOrder[0].departure_port || '',
      req.body.destination_port !== undefined ? req.body.destination_port : currentOrder[0].destination_port || '',
      req.body.passenger_price !== undefined ? req.body.passenger_price : currentOrder[0].passenger_price || 0,
      req.body.vehicle_price !== undefined ? req.body.vehicle_price : currentOrder[0].vehicle_price || 0,
      req.body.value_added_service !== undefined ? req.body.value_added_service : currentOrder[0].value_added_service || 0,
      req.body.order_templ !== undefined ? req.body.order_templ : currentOrder[0].order_templ || 1,
      status !== undefined ? status : currentOrder[0].status,
      departure_time !== undefined ? departure_time : currentOrder[0].departure_time,
      sub_order_no !== undefined ? sub_order_no : generated_sub_order_no,
      order_time !== undefined ? order_time : currentOrder[0].order_time,
      '海南电商离岛免税',
      req.params.id
    ];
      
      console.log('执行的SQL语句:', sql);
      console.log('参数:', params);
      
      // 使用参数化查询
      await connection.execute(sql, params);
      
      // 更新订单项
      if (items && Array.isArray(items)) {
        // 删除旧的订单项
        await connection.execute('DELETE FROM order_items WHERE order_id = ?', [req.params.id]);
        
        // 添加新的订单项
        for (const item of items) {
          await connection.execute(
            'INSERT INTO order_items (order_id, product_id, sku_id, quantity, price, discount_amount) VALUES (?, ?, ?, ?, ?, ?)',
            [req.params.id, item.product_id, item.sku_id, item.quantity, item.discount_amount || 0, item.discount_amount || 0]
          );
        }
      }
      
      // 提交事务
      await connection.commit();
      
      // 获取更新后的订单信息
      console.log('获取更新后的订单信息');
      const [rows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [req.params.id]);
      const order = rows[0];
      console.log('更新后的订单信息:', order);
      
      // 获取订单的商品信息
      const [orderItems] = await pool.execute('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      // 获取每个商品的详细信息
      for (const item of orderItems) {
        const [product] = await pool.execute('SELECT * FROM products WHERE id = ?', [item.product_id]);
        if (product.length > 0) {
          item.product = product[0];
        }
        if (item.sku_id) {
          const [sku] = await pool.execute('SELECT * FROM product_skus WHERE id = ?', [item.sku_id]);
          if (sku.length > 0) {
            item.sku = sku[0];
          }
        }
      }
      order.items = orderItems;
      
      console.log('更新完成，返回订单信息');
      res.json({
        success: true,
        code: 200,
        message: '更新订单成功',
        data: order
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
    console.error('更新订单失败:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({
      success: false,
      code: 500,
      message: '更新订单失败',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/miniapp/orders/{id}: 
 *   delete: 
 *     summary: 删除订单（miniapp专用）
 *     description: 根据订单 ID 删除订单，级联删除相关的订单项，不需要登录鉴权
 *     tags: [Miniapp订单管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 订单 ID
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
 */
router.delete('/:id', async (req, res) => {
  try {
    console.log('开始删除 miniapp 订单，订单ID:', req.params.id);
    const pool = getPool();
    const connection = await pool.getConnection();
    
    try {
      // 开始事务
      console.log('开始事务');
      await connection.query('START TRANSACTION');
      
      // 删除订单商品
      console.log('删除订单商品');
      await connection.execute('DELETE FROM order_items WHERE order_id = ?', [req.params.id]);
      
      // 删除订单
      console.log('删除订单');
      await connection.execute('DELETE FROM orders WHERE id = ?', [req.params.id]);
      
      console.log('提交事务');
      await connection.query('COMMIT');
      
      console.log('订单删除成功');
      res.json({
        success: true,
        code: 200,
        message: '订单删除成功',
        data: null
      });
    } catch (error) {
      console.error('删除订单失败:', error);
      console.error('错误堆栈:', error.stack);
      try {
        await connection.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('回滚事务失败:', rollbackError);
      }
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      code: 500,
      message: '删除订单失败',
      data: null
    });
  }
});

export default router;