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
      component: () => import('../views/Login.vue')
    },
    {
      path: '/',
      name: 'Layout',
      component: () => import('../components/Layout.vue'),
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('../views/Dashboard.vue'),
          meta: { title: '仪表盘' }
        },

        {
          path: 'goods',
          name: 'Goods',
          component: () => import('../views/Goods.vue'),
          meta: { title: '商品管理' }
        },
        {
          path: 'order',
          name: 'Order',
          component: () => import('../views/Orders.vue'),
          meta: { title: '订单管理' }
        },
        {
          path: 'flash-sales',
          name: 'FlashSales',
          component: () => import('../views/FlashSales.vue'),
          meta: { title: '商品活动管理' }
        },
        {
          path: 'coupons',
          name: 'Coupons',
          component: () => import('../views/Coupons.vue'),
          meta: { title: '优惠券管理' }
        }
      ]
    }
  ]
})

export default router
