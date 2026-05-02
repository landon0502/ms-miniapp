<template>
  <div class="coupons-container">
    <el-card class="coupons-card">
      <div class="card-header">
        <el-button type="primary" @click="handleAddCoupon">
          <el-icon><Plus /></el-icon>
          <span>添加优惠券</span>
        </el-button>
        <el-input
          v-model="searchQuery"
          placeholder="搜索优惠券名称"
          prefix-icon="Search"
          class="search-input"
        />
      </div>
      <el-table :data="couponsList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="券名" />
        <el-table-column prop="label" label="券标签" width="150" />
        <el-table-column prop="discount_amount" label="优惠金额" width="120">
          <template #default="scope">
            <span>¥{{ scope.row.discount_amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="min_spend" label="使用条件" width="120">
          <template #default="scope">
            <span>满{{ scope.row.min_spend }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="start_time" label="开始时间" width="200">
          <template #default="scope">
            <span>{{ formatDate(scope.row.start_time) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="end_time" label="结束时间" width="200">
          <template #default="scope">
            <span>{{ formatDate(scope.row.end_time) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleEditCoupon(scope.row)">
              <el-icon><Edit /></el-icon>
              <span>编辑</span>
            </el-button>
            <el-button type="danger" link @click="handleDeleteCoupon(scope.row.id)">
              <el-icon><Delete /></el-icon>
              <span>删除</span>
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

    <!-- 添加/编辑优惠券对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :destroy-on-close="true"
    >
      <el-form :model="form" label-width="120px" :rules="rules" ref="formRef" label-position="top">
        <el-form-item label="适用商品" prop="product_ids">
          <el-select
            v-model="form.product_ids"
            multiple
            placeholder="请选择适用商品"
            style="width: 100%"
          >
            <el-option
              v-for="product in productsList"
              :key="product.id"
              :label="product.name"
              :value="product.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="券名" prop="name">
          <el-input v-model="form.name" placeholder="请输入券名" />
        </el-form-item>
        <el-form-item label="券标签" prop="label">
          <el-input v-model="form.label" placeholder="请输入券标签，如满100减30" />
        </el-form-item>
        <el-form-item label="优惠金额" prop="discount_amount">
          <el-input v-model.number="form.discount_amount" placeholder="请输入优惠金额" />
        </el-form-item>
        <el-form-item label="使用条件" prop="min_spend">
          <el-input v-model.number="form.min_spend" placeholder="请输入使用条件（满多少）" />
        </el-form-item>
        <el-form-item label="开始时间" prop="start_time">
          <el-date-picker
            v-model="form.start_time"
            type="datetime"
            placeholder="选择开始时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="end_time">
          <el-date-picker
            v-model="form.end_time"
            type="datetime"
            placeholder="选择结束时间"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveCoupon">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Edit, Delete } from '@element-plus/icons-vue'
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '../api/coupons'
import { getProducts } from '../api/products'

export default {
  name: 'Coupons',
  components: {
    Plus,
    Search,
    Edit,
    Delete
  },
  setup() {
    const searchQuery = ref('')
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const couponsList = ref([])
    const productsList = ref([])
    const dialogVisible = ref(false)
    const dialogTitle = ref('')
    const form = ref({
      id: '',
      product_ids: [],
      name: '',
      label: '',
      discount_amount: 0,
      min_spend: 0,
      start_time: '',
      end_time: ''
    })
    const formRef = ref(null)
    
    const rules = {
      product_ids: [
        { required: true, message: '请选择适用商品', trigger: 'blur' }
      ],
      name: [
        { required: true, message: '请输入券名', trigger: 'blur' }
      ],
      label: [
        { required: true, message: '请输入券标签', trigger: 'blur' }
      ],
      discount_amount: [
        { required: true, message: '请输入优惠金额', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            const numValue = Number(value);
            if (isNaN(numValue) || numValue < 0.01) {
              callback(new Error('优惠金额必须大于0'));
            } else {
              callback();
            }
          },
          trigger: 'blur'
        }
      ],
      min_spend: [
        { required: true, message: '请输入使用条件', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            const numValue = Number(value);
            if (isNaN(numValue) || numValue < 0.01) {
              callback(new Error('使用条件必须大于0'));
            } else {
              callback();
            }
          },
          trigger: 'blur'
        }
      ],
      start_time: [
        { required: true, message: '请选择开始时间', trigger: 'blur' }
      ],
      end_time: [
        { required: true, message: '请选择结束时间', trigger: 'blur' }
      ]
    }

    // 格式化日期
    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleString()
    }

    // 获取商品列表
    const fetchProductsList = async () => {
      try {
        const response = await getProducts({ pageSize: 999 })
        if (response.data.success) {
          productsList.value = response.data.data.list
        } else {
          ElMessage.error('获取商品列表失败: ' + response.data.message)
          console.error('Error fetching products:', response.data.message)
        }
      } catch (error) {
        ElMessage.error('获取商品列表失败')
        console.error('Error fetching products:', error)
      }
    }

    // 获取优惠券列表
    const fetchCouponsList = async () => {
      try {
        const response = await getCoupons({
          page: currentPage.value,
          pageSize: pageSize.value
        })
        if (response.data.success) {
          couponsList.value = response.data.data.list
          total.value = response.data.data.total
        } else {
          ElMessage.error('获取优惠券列表失败: ' + response.data.message)
          console.error('Error fetching coupons:', response.data.message)
        }
      } catch (error) {
        ElMessage.error('获取优惠券列表失败')
        console.error('Error fetching coupons:', error)
      }
    }

    onMounted(() => {
      fetchCouponsList()
      fetchProductsList()
    })

    const handleAddCoupon = () => {
      dialogTitle.value = '添加优惠券'
      form.value = {
        id: '',
        product_ids: [],
        name: '',
        label: '',
        discount_amount: 0,
        min_spend: 0,
        start_time: '',
        end_time: ''
      }
      dialogVisible.value = true
    }

    const handleEditCoupon = (coupon) => {
      dialogTitle.value = '编辑优惠券'
      form.value = {
        ...coupon,
        product_ids: coupon.product_ids || [],
        discount_amount: coupon.discount_amount || 0,
        min_spend: coupon.min_spend || 0,
        start_time: new Date(coupon.start_time),
        end_time: new Date(coupon.end_time)
      }
      dialogVisible.value = true
    }

    const handleSaveCoupon = async () => {
      try {
        await formRef.value.validate()
        
        const submitData = {
          ...form.value
        }
        
        if (form.value.id) {
          // 编辑优惠券
          await updateCoupon(form.value.id, submitData)
          ElMessage.success('编辑成功')
        } else {
          // 添加优惠券
          await createCoupon(submitData)
          ElMessage.success('添加成功')
        }
        dialogVisible.value = false
        fetchCouponsList()
      } catch (error) {
        if (error.name === 'Error') {
          ElMessage.error('操作失败')
          console.error('Error saving coupon:', error)
        }
      }
    }

    const handleDeleteCoupon = (id) => {
      // 确认删除
      ElMessageBox.confirm('确定要删除该优惠券吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          // 执行删除操作
          await deleteCoupon(id)
          ElMessage.success('删除成功')
          // 重新获取优惠券列表
          fetchCouponsList()
        } catch (error) {
          ElMessage.error('删除失败')
          console.error('Error deleting coupon:', error)
        }
      }).catch(() => {
        // 取消删除
      })
    }

    const handleSizeChange = (size) => {
      pageSize.value = size
      fetchCouponsList()
    }

    const handleCurrentChange = (current) => {
      currentPage.value = current
      fetchCouponsList()
    }

    return {
      searchQuery,
      currentPage,
      pageSize,
      total,
      couponsList,
      productsList,
      dialogVisible,
      dialogTitle,
      form,
      formRef,
      rules,
      formatDate,
      handleAddCoupon,
      handleEditCoupon,
      handleSaveCoupon,
      handleDeleteCoupon,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.coupons-container {
  background: transparent;
}

.coupons-card {
  margin-bottom: 24px;
  border-radius: 20px;
  overflow: hidden;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.search-input {
  width: 320px;
  transition: all 0.3s ease;
}

:deep(.card-header .el-button) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
}

/* 表格样式 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  background-color: #fafafa;
  font-weight: 600;
  color: #303133;
}

:deep(.el-table tr:hover) {
  background-color: #f5f7fa;
}

:deep(.el-table__row) {
  transition: all 0.3s ease;
}

/* 按钮样式 */
:deep(.el-button) {
  transition: all 0.3s ease;
}

/* 对话框样式 */
:deep(.el-dialog) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  background-color: #fff;
  border-bottom: none;
}

:deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* 表单样式 */
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #303133;
}

:deep(.el-input__inner) {
  transition: all 0.3s ease;
}

:deep(.el-input__inner:hover) {
  border-color: #409eff;
}

:deep(.el-input__inner:focus) {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 标签样式 */
:deep(.el-tag) {
  transition: all 0.3s ease;
}

:deep(.el-tag:hover) {
  transform: scale(1.05);
}
</style>