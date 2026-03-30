<template>
  <div class="flash-sales-container">
    <el-card class="flash-sales-card">
      <div class="card-header">
        <el-button type="primary" @click="handleAddFlashSale">
          <el-icon><Plus /></el-icon>
          <span>添加活动</span>
        </el-button>
      </div>
      <el-table :data="flashSalesList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="product_name" label="商品名称" />
        <el-table-column prop="sku_name" label="商品规格" />
        <el-table-column prop="activity_price" label="活动价格" width="100">
          <template #default="scope">
            <span>¥{{ scope.row.activity_price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="start_time" label="开始时间" width="180" />
        <el-table-column prop="end_time" label="结束时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              link
              @click="handleEditFlashSale(scope.row)"
            >
              <el-icon><Edit /></el-icon>
              <span>编辑</span>
            </el-button>
            <el-button
              type="danger"
              link
              @click="handleDeleteFlashSale(scope.row.id)"
            >
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

    <!-- 添加/编辑活动对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form
        :model="form"
        label-width="120px"
        :rules="rules"
        ref="formRef"
        label-position="top"
      >
        <el-form-item label="商品" prop="product_id">
          <el-select
            v-model="form.product_id"
            placeholder="选择商品"
            @change="handleProductChange"
          >
            <el-option
              v-for="product in products"
              :key="product.id"
              :label="product.name"
              :value="product.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商品规格" prop="sku_id">
          <el-select v-model="form.sku_id" placeholder="选择规格">
            <el-option
              v-for="sku in skus"
              :key="sku.id"
              :label="sku.sku_name"
              :value="sku.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="活动价格" prop="activity_price">
          <el-input
            v-model.number="form.activity_price"
            placeholder="请输入活动价格"
          />
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
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Search, Edit, Delete } from "@element-plus/icons-vue";
import {
  getFlashSales,
  createFlashSale,
  updateFlashSale,
  deleteFlashSale,
} from "../api/flash-sales";
import { getProducts, getProductDetail } from "../api/products";
import dayjs from "dayjs";

export default {
  name: "FlashSales",
  components: {
    Plus,
    Search,
    Edit,
    Delete,
  },
  setup() {
    const currentPage = ref(1);
    const pageSize = ref(10);
    const total = ref(0);
    const flashSalesList = ref([]);
    const products = ref([]);
    const skus = ref([]);
    const dialogVisible = ref(false);
    const dialogTitle = ref("添加活动");
    const form = reactive({
      id: null,
      product_id: "",
      sku_id: "",
      activity_price: "",
      start_time: "",
      end_time: "",
    });
    const formRef = ref(null);
    const rules = {
      product_id: [
        { required: true, message: "请选择商品", trigger: "change" },
      ],
      sku_id: [
        { required: true, message: "请选择商品规格", trigger: "change" },
      ],
      activity_price: [
        { required: true, message: "请输入活动价格", trigger: "blur" },
        {
          trigger: "blur",
          validator: (rule, value, callback) => {
            if (Number(value) <= 0) {
              return callback("活动价格必须大于0");
            }
            return callback();
          },
        },
      ],
      start_time: [
        { required: true, message: "请选择开始时间", trigger: "change" },
      ],
      end_time: [
        { required: true, message: "请选择结束时间", trigger: "change" },
      ],
    };

    onMounted(() => {
      fetchFlashSalesList();
      fetchProducts();
    });

    // 获取秒杀活动列表
    const fetchFlashSalesList = async () => {
      try {
        const response = await getFlashSales({
          page: currentPage.value,
          pageSize: pageSize.value,
        });
        if (response.data.success) {
          // 格式化时间
          flashSalesList.value = response.data.data.list.map((item) => ({
            ...item,
            start_time: dayjs(item.start_time).format("YYYY-MM-DD HH:mm:ss"),
            end_time: dayjs(item.end_time).format("YYYY-MM-DD HH:mm:ss"),
          }));
          total.value = response.data.data.total;
        } else {
          ElMessage.error(response.data.message || "获取活动列表失败");
        }
      } catch (error) {
        ElMessage.error("获取活动列表失败");
        console.error("Error fetching flash sales:", error);
      }
    };

    // 获取商品列表
    const fetchProducts = async () => {
      try {
        const response = await getProducts({
          pageSize: 999,
        });
        if (response.data.success) {
          products.value = response.data.data.list;
        } else {
          ElMessage.error(response.data.message || "获取商品列表失败");
        }
      } catch (error) {
        ElMessage.error("获取商品列表失败");
        console.error("Error fetching products:", error);
      }
    };

    // 获取商品规格
    const fetchSkus = async (productId) => {
      try {
        const response = await getProductDetail(productId);
        if (response.data.success) {
          skus.value = response.data.data.skus || [];
        } else {
          ElMessage.error(response.data.message || "获取商品规格失败");
        }
      } catch (error) {
        ElMessage.error("获取商品规格失败");
        console.error("Error fetching skus:", error);
      }
    };

    // 处理商品选择变化
    const handleProductChange = (productId) => {
      form.sku_id = "";
      if (productId) {
        fetchSkus(productId);
      } else {
        skus.value = [];
      }
    };

    // 添加活动
    const handleAddFlashSale = () => {
      dialogTitle.value = "添加活动";
      Object.assign(form, {
        id: null,
        product_id: "",
        sku_id: "",
        activity_price: "",
        start_time: "",
        end_time: "",
      });
      skus.value = [];
      dialogVisible.value = true;
    };

    // 编辑活动
    const handleEditFlashSale = (flashSale) => {
      dialogTitle.value = "编辑活动";
      Object.assign(form, flashSale);
      // 转换时间格式
      form.start_time = new Date(flashSale.start_time);
      form.end_time = new Date(flashSale.end_time);
      // 获取商品规格
      fetchSkus(flashSale.product_id);
      dialogVisible.value = true;
    };

    // 删除活动
    const handleDeleteFlashSale = (id) => {
      ElMessageBox.confirm("确定要删除该活动吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          try {
            await deleteFlashSale(id);
            ElMessage.success("删除成功");
            fetchFlashSalesList();
          } catch (error) {
            ElMessage.error("删除失败");
            console.error("Error deleting flash sale:", error);
          }
        })
        .catch(() => {
          // 取消删除
        });
    };

    // 提交表单
    const handleSubmit = async () => {
      try {
        await formRef.value.validate();
        // 格式化时间
        const formData = {
          ...form,
          start_time: dayjs(form.start_time).format("YYYY-MM-DD HH:mm:ss"),
          end_time: dayjs(form.end_time).format("YYYY-MM-DD HH:mm:ss"),
        };
        if (form.id) {
          // 编辑活动
          await updateFlashSale(form.id, formData);
          ElMessage.success("编辑成功");
        } else {
          // 添加活动
          await createFlashSale(formData);
          ElMessage.success("添加成功");
        }
        dialogVisible.value = false;
        fetchFlashSalesList();
      } catch (error) {
        if (error.name === "Error") {
          ElMessage.error("操作失败");
          console.error("Error submitting form:", error);
        }
      }
    };

    const handleSizeChange = (size) => {
      pageSize.value = size;
      fetchFlashSalesList();
    };

    const handleCurrentChange = (current) => {
      currentPage.value = current;
      fetchFlashSalesList();
    };

    return {
      currentPage,
      pageSize,
      total,
      flashSalesList,
      products,
      skus,
      dialogVisible,
      dialogTitle,
      form,
      formRef,
      rules,
      handleAddFlashSale,
      handleEditFlashSale,
      handleDeleteFlashSale,
      handleSubmit,
      handleProductChange,
      handleSizeChange,
      handleCurrentChange,
    };
  },
};
</script>

<style scoped>
.flash-sales-container {
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

.flash-sales-card {
  margin-bottom: 24px;
  border-radius: 20px;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

:deep(.card-header .el-button) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}

/* 对话框样式 */
:deep(.el-dialog) {
  border-radius: 20px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  background-color: #fff;
  border-bottom: none;
}

:deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

:deep(.el-table) {
  border-radius: 12px;
}
</style>
