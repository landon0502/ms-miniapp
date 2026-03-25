<template>
  <div class="order-container">
    <el-card class="order-card">
      <div class="card-header">
        <el-input
          v-model="searchQuery"
          placeholder="搜索订单号"
          prefix-icon="Search"
          class="search-input"
        />
        <el-select v-model="orderStatus" placeholder="订单状态" class="status-select">
          <el-option label="全部" value="" />
          <el-option label="待支付" value="pending" />
          <el-option label="已支付" value="paid" />
          <el-option label="已发货" value="shipped" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
      </div>
      <el-table :data="orderList" style="width: 100%">
        <el-table-column prop="order_no" label="订单号" width="180" />
        <el-table-column prop="user_id" label="用户ID" width="100" />
        <el-table-column prop="actual_price" label="实际金额" width="120">
          <template #default="scope">
            <span>¥{{ scope.row.actual_price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleViewOrder(scope.row)">
              <el-icon><View /></el-icon>
              <span>查看</span>
            </el-button>
            <el-button type="danger" link @click="handleCancelOrder(scope.row.id)">
              <el-icon><Close /></el-icon>
              <span>取消</span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, View, Close } from '@element-plus/icons-vue'
import axios from 'axios'

export default {
  name: 'Order',
  components: {
    Search,
    View,
    Close
  },
  setup() {
    const searchQuery = ref('')
    const orderStatus = ref('')
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const orderList = ref([])

    onMounted(() => {
      fetchOrderList()
    })

    const fetchOrderList = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/orders')
        orderList.value = response.data
        total.value = response.data.length
      } catch (error) {
        ElMessage.error('获取订单列表失败')
        console.error('Error fetching orders:', error)
      }
    }

    const getStatusType = (status) => {
      const typeMap = {
        pending: 'warning',
        paid: 'info',
        shipped: 'primary',
        completed: 'success',
        cancelled: 'danger'
      }
      return typeMap[status] || 'info'
    }

    const getStatusText = (status) => {
      const textMap = {
        pending: '待支付',
        paid: '已支付',
        shipped: '已发货',
        completed: '已完成',
        cancelled: '已取消'
      }
      return textMap[status] || '未知'
    }

    const handleViewOrder = (order) => {
      // 打开订单详情对话框
      ElMessage.info(`查看订单: ${order.order_no}`)
    }

    const handleCancelOrder = (id) => {
      // 确认取消
      ElMessage.confirm('确定要取消该订单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 执行取消操作
        ElMessage.success('取消成功')
      }).catch(() => {
        // 取消操作
      })
    }

    const handleSizeChange = (size) => {
      pageSize.value = size
      fetchOrderList()
    }

    const handleCurrentChange = (current) => {
      currentPage.value = current
      fetchOrderList()
    }

    return {
      searchQuery,
      orderStatus,
      currentPage,
      pageSize,
      total,
      orderList,
      getStatusType,
      getStatusText,
      handleViewOrder,
      handleCancelOrder,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.order-container {
  padding: 0;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.order-card {
  margin-bottom: 24px;
  border-radius: 20px;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.15);
}

.card-header {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.search-input {
  width: 300px;
}

.status-select {
  width: 150px;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table) {
  border-radius: 12px;
}
</style>
