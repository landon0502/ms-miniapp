<template>
  <el-menu
    :default-active="activeMenu"
    class="layout-menu"
    router
    :collapse="isCollapse"
    @select="handleMenuSelect"
  >
    <el-menu-item
      v-for="item in menuItems"
      :key="item.path"
      :index="item.path"
    >
      <el-icon>
        <component :is="item.icon" />
      </el-icon>
      <span>{{ item.title }}</span>
    </el-menu-item>
  </el-menu>
</template>

<script>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { PieChart, Goods, Tickets, Promotion, Money } from '@element-plus/icons-vue'
import { ElIcon } from 'element-plus'

export default {
  name: 'Menu',
  props: {
    isCollapse: {
      type: Boolean,
      default: false
    }
  },
  components: {
    ElIcon,
    PieChart,
    Goods,
    Tickets,
    Promotion,
    Money
  },
  setup(props) {
    const router = useRouter()

    const activeMenu = computed(() => {
      return router.currentRoute.value.path
    })

    const menuItems = computed(() => {
      return [
        {
          path: '/dashboard',
          title: '仪表盘',
          icon: 'PieChart'
        },
        {
          path: '/goods',
          title: '商品管理',
          icon: 'Goods'
        },
        {
          path: '/order',
          title: '订单管理',
          icon: 'Tickets'
        },
        {
          path: '/flash-sales',
          title: '商品活动管理',
          icon: 'Promotion'
        },
        {
          path: '/coupons',
          title: '优惠券管理',
          icon: 'Money'
        }
      ]
    })

    const handleMenuSelect = (key) => {
      router.push(key)
    }

    return {
      activeMenu,
      menuItems,
      handleMenuSelect
    }
  }
}
</script>

<style scoped>
.layout-menu {
  border-right: none;
  height: calc(100vh - 64px);
  background: transparent;
}

:deep(.el-menu) {
  background: transparent;
  border: none;
}

:deep(.el-menu-item) {
  color: #606266;
  transition: all 0.3s;
  margin: 4px 12px;
  border-radius: 12px;
  height: 44px;
  line-height: 44px;
}

:deep(.el-menu-item:hover) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: #667eea;
}

:deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

:deep(.el-menu-item.is-active:hover) {
  background: linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%);
}
</style>