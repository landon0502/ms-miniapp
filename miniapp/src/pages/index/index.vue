<template>
  <view class="order-list">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-center">
        <text class="header-title">订单列表</text>
      </view>
    </view>

    <!-- 订单状态筛选 -->
    <view class="order-filter">
      <scroll-view scroll-x="true" class="filter-scroll">
        <view class="filter-item" :class="{ active: activeFilter === 'all' }" @click="activeFilter = 'all'">
          <text>全部</text>
        </view>
        <view class="filter-item" :class="{ active: activeFilter === 'pending' }" @click="activeFilter = 'pending'">
          <text>待支付</text>
        </view>
        <view class="filter-item" :class="{ active: activeFilter === 'paid' }" @click="activeFilter = 'paid'">
          <text>已支付</text>
        </view>
        <view class="filter-item" :class="{ active: activeFilter === 'shipped' }" @click="activeFilter = 'shipped'">
          <text>已发货</text>
        </view>
        <view class="filter-item" :class="{ active: activeFilter === 'completed' }" @click="activeFilter = 'completed'">
          <text>已完成</text>
        </view>
        <view class="filter-item" :class="{ active: activeFilter === 'cancelled' }" @click="activeFilter = 'cancelled'">
          <text>已取消</text>
        </view>
      </scroll-view>
    </view>

    <!-- 订单列表 -->
    <view class="order-content">
      <view v-for="order in filteredOrders" :key="order.id" class="order-item">
        <view class="order-header">
          <text class="order-no">订单号: {{ order.order_no }}</text>
          <text class="order-status" :class="getStatusClass(order.status)">{{ getStatusText(order.status) }}</text>
        </view>
        
        <view class="order-goods">
          <view v-for="item in order.items" :key="item.id" class="order-goods-item">
            <image :src="item.image" class="goods-image" mode="aspectFill" />
            <view class="goods-info">
              <text class="goods-name">{{ item.name }}</text>
              <text class="goods-sku">{{ item.sku_name }}</text>
              <view class="goods-price-quantity">
                <text class="goods-price">¥{{ item.price }}</text>
                <text class="goods-quantity">x{{ item.quantity }}</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="order-footer">
          <view class="order-total">
            <text>共{{ order.items.length }}件商品</text>
            <text class="total-price">合计: ¥{{ order.actual_price }}</text>
          </view>
          
          <view class="order-actions">
            <button v-if="order.status === 'pending'" class="action-btn primary" @click="payOrder(order.id)">
              立即支付
            </button>
            <button v-else-if="order.status === 'paid'" class="action-btn primary" @click="cancelOrder(order.id)">
              取消订单
            </button>
            <button v-else-if="order.status === 'shipped'" class="action-btn primary" @click="confirmReceipt(order.id)">
              确认收货
            </button>
            <button v-else class="action-btn" @click="viewOrderDetail(order.id)">
              查看详情
            </button>
          </view>
        </view>
      </view>
      
      <!-- 空订单状态 -->
      <view v-if="filteredOrders.length === 0" class="empty-order">
        <text class="empty-icon">📦</text>
        <text class="empty-text">暂无订单</text>
        <button class="empty-btn" @click="goShopping">去购物</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 订单数据
const orders = ref([
  {
    id: 1,
    order_no: 'ORD202401010001',
    user_id: 1,
    total_price: 199.99,
    actual_price: 159.99,
    status: 'pending',
    created_at: '2024-01-01 10:00:00',
    items: [
      {
        id: 1,
        product_id: 1,
        sku_id: 1,
        name: '赫莲娜绿宝瓶强韧修护精萃液',
        sku_name: '400ml',
        price: 159.99,
        quantity: 1,
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=HR%20green%20bottle%20skincare%20product&image_size=square'
      }
    ]
  },
  {
    id: 2,
    order_no: 'ORD202401020002',
    user_id: 1,
    total_price: 299.99,
    actual_price: 239.99,
    status: 'paid',
    created_at: '2024-01-02 11:00:00',
    items: [
      {
        id: 2,
        product_id: 2,
        sku_id: 3,
        name: '兰蔻小黑瓶精华',
        sku_name: '100ml',
        price: 239.99,
        quantity: 1,
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Lancome%20black%20bottle%20serum&image_size=square'
      }
    ]
  },
  {
    id: 3,
    order_no: 'ORD202401030003',
    user_id: 1,
    total_price: 399.99,
    actual_price: 319.99,
    status: 'shipped',
    created_at: '2024-01-03 12:00:00',
    items: [
      {
        id: 3,
        product_id: 3,
        sku_id: 5,
        name: '雅诗兰黛小棕瓶',
        sku_name: '50ml',
        price: 319.99,
        quantity: 1,
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Estee%20Lauder%20brown%20bottle%20serum&image_size=square'
      }
    ]
  },
  {
    id: 4,
    order_no: 'ORD202401040004',
    user_id: 1,
    total_price: 499.99,
    actual_price: 399.99,
    status: 'completed',
    created_at: '2024-01-04 13:00:00',
    items: [
      {
        id: 4,
        product_id: 4,
        sku_id: 7,
        name: 'SK-II神仙水',
        sku_name: '230ml',
        price: 399.99,
        quantity: 1,
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=SK-II%20facial%20treatment%20essence&image_size=square'
      }
    ]
  },
  {
    id: 5,
    order_no: 'ORD202401050005',
    user_id: 1,
    total_price: 599.99,
    actual_price: 479.99,
    status: 'cancelled',
    created_at: '2024-01-05 14:00:00',
    items: [
      {
        id: 5,
        product_id: 5,
        sku_id: 9,
        name: '资生堂红腰子精华',
        sku_name: '50ml',
        price: 479.99,
        quantity: 1,
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Shiseido%20red%20ankle%20serum&image_size=square'
      }
    ]
  }
])

// 状态
const activeFilter = ref('all')

// 计算属性：过滤后的订单
const filteredOrders = computed(() => {
  if (activeFilter.value === 'all') {
    return orders.value
  }
  return orders.value.filter(order => order.status === activeFilter.value)
})

// 方法
const getStatusText = (status) => {
  const statusMap = {
    pending: '待支付',
    paid: '已支付',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || '未知状态'
}

const getStatusClass = (status) => {
  const classMap = {
    pending: 'status-pending',
    paid: 'status-paid',
    shipped: 'status-shipped',
    completed: 'status-completed',
    cancelled: 'status-cancelled'
  }
  return classMap[status] || ''
}

const payOrder = (orderId) => {
  // 支付订单
  console.log('支付订单:', orderId)
  uni.showToast({ title: '跳转到支付页面', icon: 'success' })
}

const cancelOrder = (orderId) => {
  // 取消订单
  uni.showModal({
    title: '取消订单',
    content: '确定要取消该订单吗？',
    success: (res) => {
      if (res.confirm) {
        const order = orders.value.find(o => o.id === orderId)
        if (order) {
          order.status = 'cancelled'
          uni.showToast({ title: '订单已取消', icon: 'success' })
        }
      }
    }
  })
}

const confirmReceipt = (orderId) => {
  // 确认收货
  uni.showModal({
    title: '确认收货',
    content: '确定已收到商品吗？',
    success: (res) => {
      if (res.confirm) {
        const order = orders.value.find(o => o.id === orderId)
        if (order) {
          order.status = 'completed'
          uni.showToast({ title: '已确认收货', icon: 'success' })
        }
      }
    }
  })
}

const viewOrderDetail = (orderId) => {
  // 查看订单详情
  console.log('查看订单详情:', orderId)
  uni.showToast({ title: '跳转到订单详情页面', icon: 'success' })
}

const goShopping = () => {
  // 去购物
  console.log('去购物')
  // 这里可以跳转到商品列表页面
}
</script>

<style scoped>
.order-list {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 顶部导航 */
.header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1rpx solid #e8e8e8;
}

.header-title {
  font-size: 32rpx;
  font-weight: 600;
}

/* 订单状态筛选 */
.order-filter {
  background-color: #fff;
  padding: 20rpx 0;
  position: sticky;
  top: 80rpx;
  z-index: 90;
  border-bottom: 1rpx solid #e8e8e8;
}

.filter-scroll {
  white-space: nowrap;
  padding: 0 20rpx;
}

.filter-item {
  display: inline-block;
  padding: 10rpx 20rpx;
  margin-right: 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #666;
  background-color: #f5f5f5;
}

.filter-item.active {
  background-color: #ff4757;
  color: #fff;
}

/* 订单列表 */
.order-content {
  padding: 20rpx;
}

.order-item {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.order-no {
  font-size: 24rpx;
  color: #666;
}

.order-status {
  font-size: 24rpx;
  font-weight: 600;
}

.status-pending {
  color: #ff9800;
}

.status-paid {
  color: #2196f3;
}

.status-shipped {
  color: #4caf50;
}

.status-completed {
  color: #8bc34a;
}

.status-cancelled {
  color: #999;
}

/* 订单商品 */
.order-goods {
  margin-bottom: 20rpx;
}

.order-goods-item {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.goods-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 10rpx;
  flex-shrink: 0;
}

.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.goods-name {
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 5rpx;
  line-height: 1.4;
}

.goods-sku {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.goods-price-quantity {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.goods-price {
  font-size: 28rpx;
  font-weight: 600;
  color: #ff4757;
}

.goods-quantity {
  font-size: 24rpx;
  color: #666;
}

/* 订单底部 */
.order-footer {
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.order-total {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.order-total text:first-child {
  font-size: 24rpx;
  color: #666;
}

.total-price {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10rpx;
}

.action-btn {
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  border: 1rpx solid #e8e8e8;
  background-color: #fff;
  color: #666;
}

.action-btn.primary {
  background-color: #ff4757;
  color: #fff;
  border-color: #ff4757;
}

/* 空订单状态 */
.empty-order {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  background-color: #fff;
  border-radius: 20rpx;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 30rpx;
}

.empty-btn {
  padding: 15rpx 40rpx;
  border-radius: 25rpx;
  font-size: 24rpx;
  background-color: #ff4757;
  color: #fff;
  border: none;
}

/* 响应式 */
@media screen and (max-width: 375px) {
  .order-item {
    padding: 15rpx;
  }
  
  .goods-image {
    width: 100rpx;
    height: 100rpx;
  }
  
  .goods-name {
    font-size: 26rpx;
  }
}
</style>
