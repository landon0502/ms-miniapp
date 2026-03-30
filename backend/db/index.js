// 数据库连接池和初始化
import mysql from 'mysql2/promise';
import config from './config.js';

// 创建数据库连接池
let pool;

/**
 * 初始化数据库连接池
 */
export async function initDatabase() {
  try {
    // 先创建基础连接（用于创建数据库）
    const connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password
    });
    
    console.log('数据库连接成功');
    
    // 创建数据库（如果不存在）
    await connection.query('CREATE DATABASE IF NOT EXISTS duty_free_shopping');
    await connection.query('USE duty_free_shopping');
    
    // 创建商品表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        detail_description TEXT,
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2),
        stock INT NOT NULL,
        category VARCHAR(100),
        image VARCHAR(255),
        theme VARCHAR(20) DEFAULT 'red',
        measurement_type VARCHAR(20) DEFAULT 'spec',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // 检查并添加theme列（如果不存在）
    try {
      const [result] = await connection.execute(
        'SHOW COLUMNS FROM products WHERE Field = ?',
        ['theme']
      );
      if (result.length === 0) {
        await connection.execute('ALTER TABLE products ADD COLUMN theme VARCHAR(20) DEFAULT "red"');
      }
    } catch (error) {
      console.error('添加theme列失败:', error);
    }
    
    // 检查并添加measurement_type列（如果不存在）
    try {
      const [result] = await connection.execute(
        'SHOW COLUMNS FROM products WHERE Field = ?',
        ['measurement_type']
      );
      if (result.length === 0) {
        await connection.execute('ALTER TABLE products ADD COLUMN measurement_type VARCHAR(20) DEFAULT "spec"');
      }
    } catch (error) {
      console.error('添加measurement_type列失败:', error);
    }
    
    // 添加商品表字段注释
    await connection.execute(`ALTER TABLE products MODIFY COLUMN id INT AUTO_INCREMENT COMMENT '商品ID'`);
    await connection.execute(`ALTER TABLE products MODIFY COLUMN name VARCHAR(255) NOT NULL COMMENT '商品名称'`);
    await connection.execute(`ALTER TABLE products MODIFY COLUMN description TEXT COMMENT '商品描述'`);
    await connection.execute(`ALTER TABLE products MODIFY COLUMN detail_description TEXT COMMENT '商品详细描述（富文本）'`);
    await connection.execute(`ALTER TABLE products MODIFY COLUMN price DECIMAL(10,2) COMMENT '商品价格'`);
    await connection.execute(`ALTER TABLE products MODIFY COLUMN original_price DECIMAL(10,2) COMMENT '商品原价'`);
    await connection.execute(`ALTER TABLE products MODIFY COLUMN stock INT NOT NULL COMMENT '商品库存'`);
    await connection.execute(`ALTER TABLE products MODIFY COLUMN category VARCHAR(100) COMMENT '商品分类'`);
    await connection.execute(`ALTER TABLE products MODIFY COLUMN image VARCHAR(255) COMMENT '商品主图'`);
    await connection.execute(`ALTER TABLE products MODIFY COLUMN theme VARCHAR(20) DEFAULT 'red' COMMENT '详情页主题（red或black）'`);
    await connection.execute(`ALTER TABLE products MODIFY COLUMN measurement_type VARCHAR(20) DEFAULT 'spec' COMMENT '计量类型（spec或capacity）'`);
    await connection.execute(`ALTER TABLE products MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'`);
    await connection.execute(`ALTER TABLE products MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'`);
    
    // 创建规格表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS product_skus (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT NOT NULL,
        sku_name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        stock INT NOT NULL,
        images TEXT,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);
    
    // 检查并处理images字段
    try {
      // 检查是否存在image字段
      const [result] = await connection.execute(
        'SHOW COLUMNS FROM product_skus WHERE Field = ?',
        ['image']
      );
      if (result.length > 0) {
        // 存在image字段，重命名为images
        await connection.execute('ALTER TABLE product_skus CHANGE COLUMN image images TEXT');
      }
    } catch (error) {
      console.error('处理images字段失败:', error);
    }
    
    // 添加规格表字段注释
    await connection.execute(`ALTER TABLE product_skus MODIFY COLUMN id INT AUTO_INCREMENT COMMENT '规格ID'`);
    await connection.execute(`ALTER TABLE product_skus MODIFY COLUMN product_id INT NOT NULL COMMENT '商品ID'`);
    await connection.execute(`ALTER TABLE product_skus MODIFY COLUMN sku_name VARCHAR(100) NOT NULL COMMENT '规格名称'`);
    await connection.execute(`ALTER TABLE product_skus MODIFY COLUMN price DECIMAL(10,2) NOT NULL COMMENT '规格价格'`);
    await connection.execute(`ALTER TABLE product_skus MODIFY COLUMN stock INT NOT NULL COMMENT '规格库存'`);
    await connection.execute(`ALTER TABLE product_skus MODIFY COLUMN images TEXT COMMENT '规格图片（JSON格式）'`);
    
    // 创建订单表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_no VARCHAR(50) NOT NULL,
        sub_order_no VARCHAR(50),
        user_id INT NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        actual_price DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) NOT NULL,
        departure_time TIMESTAMP,
        order_time TIMESTAMP,
        shipping_store VARCHAR(100) DEFAULT '海南电商离岛免税',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // 检查并添加新字段（如果不存在）
    try {
      const [result1] = await connection.execute('SHOW COLUMNS FROM orders WHERE Field = ?', ['sub_order_no']);
      if (result1.length === 0) {
        await connection.execute('ALTER TABLE orders ADD COLUMN sub_order_no VARCHAR(50) COMMENT "子订单号"');
      }
      
      const [result2] = await connection.execute('SHOW COLUMNS FROM orders WHERE Field = ?', ['departure_time']);
      if (result2.length === 0) {
        await connection.execute('ALTER TABLE orders ADD COLUMN departure_time TIMESTAMP COMMENT "离岛时间"');
      }
      
      const [result3] = await connection.execute('SHOW COLUMNS FROM orders WHERE Field = ?', ['order_time']);
      if (result3.length === 0) {
        await connection.execute('ALTER TABLE orders ADD COLUMN order_time TIMESTAMP COMMENT "下单时间"');
      }
      
      const [result4] = await connection.execute('SHOW COLUMNS FROM orders WHERE Field = ?', ['shipping_store']);
      if (result4.length === 0) {
        await connection.execute('ALTER TABLE orders ADD COLUMN shipping_store VARCHAR(100) DEFAULT "海南电商离岛免税" COMMENT "发货门店"');
      }
      
      // 添加积分抵扣、行邮税和行邮税优惠字段
      const [result5] = await connection.execute('SHOW COLUMNS FROM orders WHERE Field = ?', ['points_deduction']);
      if (result5.length === 0) {
        await connection.execute('ALTER TABLE orders ADD COLUMN points_deduction DECIMAL(10,2) DEFAULT 0 COMMENT "积分抵扣"');
      }
      
      const [result6] = await connection.execute('SHOW COLUMNS FROM orders WHERE Field = ?', ['mail_tax']);
      if (result6.length === 0) {
        await connection.execute('ALTER TABLE orders ADD COLUMN mail_tax DECIMAL(10,2) DEFAULT 0 COMMENT "行邮税"');
      }
      
      const [result7] = await connection.execute('SHOW COLUMNS FROM orders WHERE Field = ?', ['mail_tax_discount']);
      if (result7.length === 0) {
        await connection.execute('ALTER TABLE orders ADD COLUMN mail_tax_discount DECIMAL(10,2) DEFAULT 0 COMMENT "行邮税优惠"');
      }
      
      // 添加是否为口岸自提字段
      const [result8] = await connection.execute('SHOW COLUMNS FROM orders WHERE Field = ?', ['is_port_pickup']);
      if (result8.length === 0) {
        await connection.execute('ALTER TABLE orders ADD COLUMN is_port_pickup TINYINT DEFAULT 0 COMMENT "是否为口岸自提"');
      }
      
      // 添加离线航班字段
      const [result9] = await connection.execute('SHOW COLUMNS FROM orders WHERE Field = ?', ['offline_flight']);
      if (result9.length === 0) {
        await connection.execute('ALTER TABLE orders ADD COLUMN offline_flight VARCHAR(50) DEFAULT "HA2140" COMMENT "离线航班"');
      }
      
      // 添加收货人信息字段
      const [result10] = await connection.execute('SHOW COLUMNS FROM orders WHERE Field = ?', ['consignee_name']);
      if (result10.length === 0) {
        await connection.execute('ALTER TABLE orders ADD COLUMN consignee_name VARCHAR(100) COMMENT "收货人姓名"');
      }
      
      const [result11] = await connection.execute('SHOW COLUMNS FROM orders WHERE Field = ?', ['consignee_phone']);
      if (result11.length === 0) {
        await connection.execute('ALTER TABLE orders ADD COLUMN consignee_phone VARCHAR(20) COMMENT "收货人电话"');
      }
      
      const [result12] = await connection.execute('SHOW COLUMNS FROM orders WHERE Field = ?', ['consignee_idcard']);
      if (result12.length === 0) {
        await connection.execute('ALTER TABLE orders ADD COLUMN consignee_idcard VARCHAR(20) COMMENT "收货人身份证号"');
      }
      
      // 添加航线相关字段
      const [result13] = await connection.execute('SHOW COLUMNS FROM orders WHERE Field = ?', ['port_order_no']);
      if (result13.length === 0) {
        await connection.execute('ALTER TABLE orders ADD COLUMN port_order_no VARCHAR(50) COMMENT "港区单号"');
      }
      
      const [result14] = await connection.execute('SHOW COLUMNS FROM orders WHERE Field = ?', ['route']);
      if (result14.length === 0) {
        await connection.execute('ALTER TABLE orders ADD COLUMN route VARCHAR(100) COMMENT "航线"');
      }
      
      const [result15] = await connection.execute('SHOW COLUMNS FROM orders WHERE Field = ?', ['vehicle_type']);
      if (result15.length === 0) {
        await connection.execute('ALTER TABLE orders ADD COLUMN vehicle_type VARCHAR(50) COMMENT "车型"');
      }
      
      const [result16] = await connection.execute('SHOW COLUMNS FROM orders WHERE Field = ?', ['departure_port']);
      if (result16.length === 0) {
        await connection.execute('ALTER TABLE orders ADD COLUMN departure_port VARCHAR(100) COMMENT "始发港"');
      }
      
      const [result17] = await connection.execute('SHOW COLUMNS FROM orders WHERE Field = ?', ['destination_port']);
      if (result17.length === 0) {
        await connection.execute('ALTER TABLE orders ADD COLUMN destination_port VARCHAR(100) COMMENT "目的港"');
      }
      
      const [result18] = await connection.execute('SHOW COLUMNS FROM orders WHERE Field = ?', ['passenger_price']);
      if (result18.length === 0) {
        await connection.execute('ALTER TABLE orders ADD COLUMN passenger_price DECIMAL(10,2) DEFAULT 0 COMMENT "旅客票价"');
      }
      
      const [result19] = await connection.execute('SHOW COLUMNS FROM orders WHERE Field = ?', ['vehicle_price']);
      if (result19.length === 0) {
        await connection.execute('ALTER TABLE orders ADD COLUMN vehicle_price DECIMAL(10,2) DEFAULT 0 COMMENT "车辆票价"');
      }
      
      const [result20] = await connection.execute('SHOW COLUMNS FROM orders WHERE Field = ?', ['value_added_service']);
      if (result20.length === 0) {
        await connection.execute('ALTER TABLE orders ADD COLUMN value_added_service DECIMAL(10,2) DEFAULT 0 COMMENT "增值服务"');
      }
    } catch (error) {
      console.error('添加订单表新字段失败:', error);
    }
    
    // 添加订单表字段注释
    await connection.execute(`ALTER TABLE orders MODIFY COLUMN id INT AUTO_INCREMENT COMMENT '订单ID'`);
    await connection.execute(`ALTER TABLE orders MODIFY COLUMN order_no VARCHAR(50) NOT NULL COMMENT '订单号'`);
    await connection.execute(`ALTER TABLE orders MODIFY COLUMN sub_order_no VARCHAR(50) COMMENT '子订单号'`);
    await connection.execute(`ALTER TABLE orders MODIFY COLUMN user_id INT NOT NULL COMMENT '用户ID'`);
    await connection.execute(`ALTER TABLE orders MODIFY COLUMN total_price DECIMAL(10,2) NOT NULL COMMENT '订单总价'`);
    await connection.execute(`ALTER TABLE orders MODIFY COLUMN actual_price DECIMAL(10,2) NOT NULL COMMENT '实际支付价格'`);
    await connection.execute(`ALTER TABLE orders MODIFY COLUMN points_deduction DECIMAL(10,2) DEFAULT 0 COMMENT '积分抵扣'`);
    await connection.execute(`ALTER TABLE orders MODIFY COLUMN mail_tax DECIMAL(10,2) DEFAULT 0 COMMENT '行邮税'`);
    await connection.execute(`ALTER TABLE orders MODIFY COLUMN mail_tax_discount DECIMAL(10,2) DEFAULT 0 COMMENT '行邮税优惠'`);
    await connection.execute(`ALTER TABLE orders MODIFY COLUMN is_port_pickup TINYINT DEFAULT 0 COMMENT '是否为口岸自提'`);
    await connection.execute(`ALTER TABLE orders MODIFY COLUMN offline_flight VARCHAR(50) DEFAULT 'HA2140' COMMENT '离线航班'`);
    await connection.execute(`ALTER TABLE orders MODIFY COLUMN consignee_name VARCHAR(100) COMMENT '收货人姓名'`);
    await connection.execute(`ALTER TABLE orders MODIFY COLUMN consignee_phone VARCHAR(20) COMMENT '收货人电话'`);
    await connection.execute(`ALTER TABLE orders MODIFY COLUMN consignee_idcard VARCHAR(20) COMMENT '收货人身份证号'`);
    await connection.execute(`ALTER TABLE orders MODIFY COLUMN port_order_no VARCHAR(50) COMMENT '港区单号'`);
    await connection.execute(`ALTER TABLE orders MODIFY COLUMN route VARCHAR(100) COMMENT '航线'`);
    await connection.execute(`ALTER TABLE orders MODIFY COLUMN vehicle_type VARCHAR(50) COMMENT '车型'`);
    await connection.execute(`ALTER TABLE orders MODIFY COLUMN departure_port VARCHAR(100) COMMENT '始发港'`);
    await connection.execute(`ALTER TABLE orders MODIFY COLUMN destination_port VARCHAR(100) COMMENT '目的港'`);
    await connection.execute(`ALTER TABLE orders MODIFY COLUMN passenger_price DECIMAL(10,2) DEFAULT 0 COMMENT '旅客票价'`);
    await connection.execute(`ALTER TABLE orders MODIFY COLUMN vehicle_price DECIMAL(10,2) DEFAULT 0 COMMENT '车辆票价'`);
    await connection.execute(`ALTER TABLE orders MODIFY COLUMN value_added_service DECIMAL(10,2) DEFAULT 0 COMMENT '增值服务'`);
    await connection.execute(`ALTER TABLE orders MODIFY COLUMN status VARCHAR(20) NOT NULL COMMENT '订单状态'`);
    await connection.execute(`ALTER TABLE orders MODIFY COLUMN departure_time TIMESTAMP COMMENT '离岛时间'`);
    await connection.execute(`ALTER TABLE orders MODIFY COLUMN order_time TIMESTAMP COMMENT '下单时间'`);
    await connection.execute(`ALTER TABLE orders MODIFY COLUMN shipping_store VARCHAR(100) DEFAULT '海南电商离岛免税' COMMENT '发货门店'`);
    await connection.execute(`ALTER TABLE orders MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'`);
    await connection.execute(`ALTER TABLE orders MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'`);
    
    // 创建订单商品表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        sku_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (sku_id) REFERENCES product_skus(id) ON DELETE CASCADE
      )
    `);
    
    // 检查并添加discount_amount字段（如果不存在）
    try {
      const [result] = await connection.execute(
        'SHOW COLUMNS FROM order_items WHERE Field = ?',
        ['discount_amount']
      );
      if (result.length === 0) {
        await connection.execute('ALTER TABLE order_items ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0 COMMENT "折扣金额"');
      }
    } catch (error) {
      console.error('添加discount_amount字段失败:', error);
    }
    
    // 添加订单商品表字段注释
    await connection.execute(`ALTER TABLE order_items MODIFY COLUMN id INT AUTO_INCREMENT COMMENT '订单商品ID'`);
    await connection.execute(`ALTER TABLE order_items MODIFY COLUMN order_id INT NOT NULL COMMENT '订单ID'`);
    await connection.execute(`ALTER TABLE order_items MODIFY COLUMN product_id INT NOT NULL COMMENT '商品ID'`);
    await connection.execute(`ALTER TABLE order_items MODIFY COLUMN sku_id INT NOT NULL COMMENT '规格ID'`);
    await connection.execute(`ALTER TABLE order_items MODIFY COLUMN quantity INT NOT NULL COMMENT '商品数量'`);
    await connection.execute(`ALTER TABLE order_items MODIFY COLUMN price DECIMAL(10,2) NOT NULL COMMENT '商品价格'`);
    await connection.execute(`ALTER TABLE order_items MODIFY COLUMN discount_amount DECIMAL(10,2) DEFAULT 0 COMMENT '折扣金额'`);
    
    // 创建促销表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS promotions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);
    
    // 检查并添加label字段
    try {
      const [labelResult] = await connection.execute(
        'SHOW COLUMNS FROM promotions WHERE Field = ?',
        ['label']
      );
      if (labelResult.length === 0) {
        await connection.execute('ALTER TABLE promotions ADD COLUMN label VARCHAR(100) NOT NULL DEFAULT ""');
      }
    } catch (error) {
      console.error('添加label字段失败:', error);
    }
    
    // 检查并添加type字段
    try {
      const [typeResult] = await connection.execute(
        'SHOW COLUMNS FROM promotions WHERE Field = ?',
        ['type']
      );
      if (typeResult.length === 0) {
        await connection.execute('ALTER TABLE promotions ADD COLUMN type VARCHAR(50) NOT NULL DEFAULT "赠品"');
      }
    } catch (error) {
      console.error('添加type字段失败:', error);
    }
    
    // 检查并添加新增字段
    try {
      // 活动开始时间
      const [startTimeResult] = await connection.execute(
        'SHOW COLUMNS FROM promotions WHERE Field = ?',
        ['start_time']
      );
      if (startTimeResult.length === 0) {
        await connection.execute('ALTER TABLE promotions ADD COLUMN start_time DATETIME COMMENT "活动开始时间"');
      }
      
      // 活动结束时间
      const [endTimeResult] = await connection.execute(
        'SHOW COLUMNS FROM promotions WHERE Field = ?',
        ['end_time']
      );
      if (endTimeResult.length === 0) {
        await connection.execute('ALTER TABLE promotions ADD COLUMN end_time DATETIME COMMENT "活动结束时间"');
      }
      
      // 赠品数量
      const [quantityResult] = await connection.execute(
        'SHOW COLUMNS FROM promotions WHERE Field = ?',
        ['quantity']
      );
      if (quantityResult.length === 0) {
        await connection.execute('ALTER TABLE promotions ADD COLUMN quantity INT DEFAULT 0 COMMENT "赠品数量"');
      }
      
      // 赠品规格名
      const [skuNameResult] = await connection.execute(
        'SHOW COLUMNS FROM promotions WHERE Field = ?',
        ['sku_name']
      );
      if (skuNameResult.length === 0) {
        await connection.execute('ALTER TABLE promotions ADD COLUMN sku_name VARCHAR(255) DEFAULT "" COMMENT "赠品规格名"');
      }
      
      // 满赠条件
      const [conditionResult] = await connection.execute(
        'SHOW COLUMNS FROM promotions WHERE Field = ?',
        ['promotion_condition']
      );
      if (conditionResult.length === 0) {
        await connection.execute('ALTER TABLE promotions ADD COLUMN promotion_condition INT DEFAULT 0 COMMENT "满赠条件"');
      }
      
      // 赠品图片
      const [imageResult] = await connection.execute(
        'SHOW COLUMNS FROM promotions WHERE Field = ?',
        ['image']
      );
      if (imageResult.length === 0) {
        await connection.execute('ALTER TABLE promotions ADD COLUMN image VARCHAR(255) DEFAULT "" COMMENT "赠品图片"');
      }
    } catch (error) {
      console.error('添加促销表新字段失败:', error);
    }
    
    // 添加促销表字段注释
    await connection.execute(`ALTER TABLE promotions MODIFY COLUMN id INT AUTO_INCREMENT COMMENT '促销ID'`);
    await connection.execute(`ALTER TABLE promotions MODIFY COLUMN product_id INT NOT NULL COMMENT '商品ID'`);
    await connection.execute(`ALTER TABLE promotions MODIFY COLUMN name VARCHAR(255) NOT NULL COMMENT '活动内容'`);
    await connection.execute(`ALTER TABLE promotions MODIFY COLUMN label VARCHAR(100) NOT NULL COMMENT '活动标签'`);
    await connection.execute(`ALTER TABLE promotions MODIFY COLUMN type VARCHAR(50) NOT NULL COMMENT '活动类型（赠品、折扣）'`);
    await connection.execute(`ALTER TABLE promotions MODIFY COLUMN end_time DATETIME COMMENT '活动结束时间'`);
    await connection.execute(`ALTER TABLE promotions MODIFY COLUMN quantity INT DEFAULT 0 COMMENT '赠品数量'`);
    await connection.execute(`ALTER TABLE promotions MODIFY COLUMN sku_name VARCHAR(255) DEFAULT '' COMMENT '赠品规格名'`);
    await connection.execute(`ALTER TABLE promotions MODIFY COLUMN promotion_condition INT DEFAULT 0 COMMENT '满赠条件'`);
    await connection.execute(`ALTER TABLE promotions MODIFY COLUMN image VARCHAR(255) DEFAULT '' COMMENT '赠品图片'`);
    
    // 创建折扣表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS discounts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        end_time DATETIME,
        value DECIMAL(3,1) NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);
    
    // 检查并添加start_time字段
    try {
      const [startTimeResult] = await connection.execute(
        'SHOW COLUMNS FROM discounts WHERE Field = ?',
        ['start_time']
      );
      if (startTimeResult.length === 0) {
        await connection.execute('ALTER TABLE discounts ADD COLUMN start_time DATETIME COMMENT "活动开始时间"');
      }
    } catch (error) {
      console.error('添加折扣表start_time字段失败:', error);
    }
    
    // 添加折扣表字段注释
    await connection.execute(`ALTER TABLE discounts MODIFY COLUMN id INT AUTO_INCREMENT COMMENT '折扣ID'`);
    await connection.execute(`ALTER TABLE discounts MODIFY COLUMN product_id INT NOT NULL COMMENT '商品ID'`);
    await connection.execute(`ALTER TABLE discounts MODIFY COLUMN name VARCHAR(255) NOT NULL COMMENT '折扣内容'`);
    await connection.execute(`ALTER TABLE discounts MODIFY COLUMN start_time DATETIME COMMENT '活动开始时间'`);
    await connection.execute(`ALTER TABLE discounts MODIFY COLUMN end_time DATETIME COMMENT '活动结束时间'`);
    await connection.execute(`ALTER TABLE discounts MODIFY COLUMN value DECIMAL(3,1) NOT NULL COMMENT '折扣值（1-10之间）'`);
    
    // 创建优惠券表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS coupons (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        label VARCHAR(100) NOT NULL,
        discount_amount DECIMAL(10,2) NOT NULL,
        min_spend DECIMAL(10,2) NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL
      )
    `);
    
    // 检查并添加product_ids字段
    try {
      const [result] = await connection.execute(
        'SHOW COLUMNS FROM coupons WHERE Field = ?',
        ['product_ids']
      );
      if (result.length === 0) {
        await connection.execute('ALTER TABLE coupons ADD COLUMN product_ids TEXT NOT NULL COMMENT "适用商品ID，JSON格式"');
      }
    } catch (error) {
      console.error('添加product_ids字段失败:', error);
    }
    
    // 检查并添加discount_amount字段
    try {
      const [result] = await connection.execute(
        'SHOW COLUMNS FROM coupons WHERE Field = ?',
        ['discount_amount']
      );
      if (result.length === 0) {
        await connection.execute('ALTER TABLE coupons ADD COLUMN discount_amount DECIMAL(10,2) NOT NULL COMMENT "优惠金额"');
      }
    } catch (error) {
      console.error('添加discount_amount字段失败:', error);
    }
    
    // 检查并添加min_spend字段
    try {
      const [result] = await connection.execute(
        'SHOW COLUMNS FROM coupons WHERE Field = ?',
        ['min_spend']
      );
      if (result.length === 0) {
        await connection.execute('ALTER TABLE coupons ADD COLUMN min_spend DECIMAL(10,2) NOT NULL COMMENT "使用条件（满多少）"');
      }
    } catch (error) {
      console.error('添加min_spend字段失败:', error);
    }
    
    // 删除product_id字段
    try {
      const [result] = await connection.execute(
        'SHOW COLUMNS FROM coupons WHERE Field = ?',
        ['product_id']
      );
      if (result.length > 0) {
        // 直接尝试删除外键约束和字段
        try {
          // 先删除外键约束（使用已知的约束名称）
          await connection.execute('ALTER TABLE coupons DROP FOREIGN KEY coupons_ibfk_1');
          // 再删除字段
          await connection.execute('ALTER TABLE coupons DROP COLUMN product_id');
        } catch (e) {
          console.error('删除product_id字段失败:', e);
        }
      }
    } catch (error) {
      console.error('删除product_id字段失败:', error);
    }
    
    // 检查并添加优惠金额字段
    try {
      const [result] = await connection.execute(
        'SHOW COLUMNS FROM coupons WHERE Field = ?',
        ['discount_amount']
      );
      if (result.length === 0) {
        await connection.execute('ALTER TABLE coupons ADD COLUMN discount_amount DECIMAL(10,2) NOT NULL COMMENT "优惠金额"');
      }
    } catch (error) {
      console.error('添加discount_amount字段失败:', error);
    }
    
    // 检查并添加使用条件字段
    try {
      const [result] = await connection.execute(
        'SHOW COLUMNS FROM coupons WHERE Field = ?',
        ['min_spend']
      );
      if (result.length === 0) {
        await connection.execute('ALTER TABLE coupons ADD COLUMN min_spend DECIMAL(10,2) NOT NULL COMMENT "使用条件（满多少）"');
      }
    } catch (error) {
      console.error('添加min_spend字段失败:', error);
    }
    
    // 添加优惠券表字段注释
    await connection.execute(`ALTER TABLE coupons MODIFY COLUMN id INT AUTO_INCREMENT COMMENT '优惠券ID'`);
    await connection.execute(`ALTER TABLE coupons MODIFY COLUMN product_ids TEXT NOT NULL COMMENT '适用商品ID，JSON格式'`);
    await connection.execute(`ALTER TABLE coupons MODIFY COLUMN name VARCHAR(255) NOT NULL COMMENT '券名'`);
    await connection.execute(`ALTER TABLE coupons MODIFY COLUMN label VARCHAR(100) NOT NULL COMMENT '券标签'`);
    await connection.execute(`ALTER TABLE coupons MODIFY COLUMN discount_amount DECIMAL(10,2) NOT NULL COMMENT '优惠金额'`);
    await connection.execute(`ALTER TABLE coupons MODIFY COLUMN min_spend DECIMAL(10,2) NOT NULL COMMENT '使用条件（满多少）'`);
    await connection.execute(`ALTER TABLE coupons MODIFY COLUMN start_time TIMESTAMP NOT NULL COMMENT '使用开始时间'`);
    await connection.execute(`ALTER TABLE coupons MODIFY COLUMN end_time TIMESTAMP NOT NULL COMMENT '使用结束时间'`);
    
    // 创建秒杀活动表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS flash_sales (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT NOT NULL,
        sku_id INT NOT NULL,
        activity_price DECIMAL(10,2) NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (sku_id) REFERENCES product_skus(id) ON DELETE CASCADE
      )
    `);
    
    // 添加秒杀活动表字段注释
    await connection.execute(`ALTER TABLE flash_sales MODIFY COLUMN id INT AUTO_INCREMENT COMMENT '秒杀活动ID'`);
    await connection.execute(`ALTER TABLE flash_sales MODIFY COLUMN product_id INT NOT NULL COMMENT '商品ID'`);
    await connection.execute(`ALTER TABLE flash_sales MODIFY COLUMN sku_id INT NOT NULL COMMENT '规格ID'`);
    await connection.execute(`ALTER TABLE flash_sales MODIFY COLUMN activity_price DECIMAL(10,2) NOT NULL COMMENT '活动价格'`);
    await connection.execute(`ALTER TABLE flash_sales MODIFY COLUMN start_time TIMESTAMP NOT NULL COMMENT '活动开始时间'`);
    await connection.execute(`ALTER TABLE flash_sales MODIFY COLUMN end_time TIMESTAMP NOT NULL COMMENT '活动结束时间'`);
    
    // 关闭临时连接
    await connection.end();
    
    // 创建连接池
    pool = mysql.createPool(config);
    
    // 插入示例数据
    await insertSampleData();
    
    console.log('数据库表初始化完成');
  } catch (error) {
    console.error('数据库初始化失败:', error);
  }
}

/**
 * 插入示例数据
 */
async function insertSampleData() {
  try {
    // 检查是否已有数据
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM products');
    if (rows[0].count === 0) {
      // 插入商品
      const [result] = await pool.execute(
        'INSERT INTO products (name, description, price, original_price, stock, category, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['赫莲娜绿宝瓶强韧修护精萃液', '修护补水，强韧肌底', 932.75, 1435.00, 100, '护肤品', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=HR%20green%20bottle%20skincare%20product&image_size=portrait_4_3']
      );
      
      const productId = result.insertId;
      
      // 插入规格
      await pool.execute(
        'INSERT INTO product_skus (product_id, sku_name, price, stock, image) VALUES (?, ?, ?, ?, ?)',
        [productId, '400ml', 932.75, 100, 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=HR%20green%20bottle%20400ml&image_size=square']
      );
      
      await pool.execute(
        'INSERT INTO product_skus (product_id, sku_name, price, stock, image) VALUES (?, ?, ?, ?, ?)',
        [productId, '200ml', 560.00, 200, 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=HR%20green%20bottle%20200ml&image_size=square']
      );
      
      // 插入订单
      const [orderResult] = await pool.execute(
        'INSERT INTO orders (order_no, user_id, total_price, actual_price, status) VALUES (?, ?, ?, ?, ?)',
        ['ORD202401010001', 1, 199.99, 159.99, 'pending']
      );
      
      const orderId = orderResult.insertId;
      
      // 插入订单商品
      await pool.execute(
        'INSERT INTO order_items (order_id, product_id, sku_id, quantity, price) VALUES (?, ?, ?, ?, ?)',
        [orderId, productId, 1, 1, 159.99]
      );
      
      console.log('示例数据插入完成');
    }
  } catch (error) {
    console.error('插入示例数据失败:', error);
  }
}

/**
 * 获取数据库连接池
 */
export function getPool() {
  return pool;
}
