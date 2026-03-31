import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/admin'),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
      meta: { requireAuth: false }
    },
    {
      path: '/',
      name: 'Layout',
      component: () => import('../components/Layout.vue'),
      meta: { requireAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('../views/Dashboard.vue'),
          meta: { title: '仪表盘', requireAuth: true }
        },

        {
          path: 'goods',
          name: 'Goods',
          component: () => import('../views/Goods.vue'),
          meta: { title: '商品管理', requireAuth: true }
        },
        {
          path: 'order',
          name: 'Order',
          component: () => import('../views/Orders.vue'),
          meta: { title: '订单管理', requireAuth: true }
        },
        {
          path: 'flash-sales',
          name: 'FlashSales',
          component: () => import('../views/FlashSales.vue'),
          meta: { title: '商品活动管理', requireAuth: true }
        },
        {
          path: 'coupons',
          name: 'Coupons',
          component: () => import('../views/Coupons.vue'),
          meta: { title: '优惠券管理', requireAuth: true }
        }
      ]
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 检查是否需要登录
  if (to.meta.requireAuth !== false) {
    // 获取token
    const token = localStorage.getItem('token')
    if (!token) {
      // 未登录，重定向到登录页面
      next('/login')
    } else {
      // 已登录，继续访问
      next()
    }
  } else {
    // 不需要登录，直接访问
    next()
  }
})

export default router
