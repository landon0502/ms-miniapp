<template>
  <div class="p-5">
    <el-button
      type="primary"
      @click="handleAddOrder"
      class="mb-5 bg-gradient-to-r from-indigo-500 to-purple-600 border-0"
    >
      <el-icon><Plus /></el-icon> 添加订单
    </el-button>

    <el-table :data="orders" style="width: 100%" border>
      <el-table-column prop="id" label="订单ID" width="80" />
      <el-table-column prop="order_no" label="订单号" width="180" />
      <el-table-column prop="sub_order_no" label="子订单号" width="180" />
      <el-table-column prop="order_templ" label="订单模板" width="100">
        <template #default="{ row }">
          {{ row.order_templ || 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="shipping_store" label="发货门店" width="180" />
      <el-table-column prop="user_id" label="用户ID" width="80" />
      <el-table-column label="商品信息" min-width="200">
        <template #default="{ row }">
          <div v-if="row.items && row.items.length > 0">
            <div
              v-for="item in row.items"
              :key="item.id"
              class="mb-1 py-1 border-b border-gray-100"
            >
              <div class="item-info">
                <span class="font-bold mr-1">{{ item.product?.name }}</span>
                <span class="text-gray-600 mr-2" v-if="item.sku?.sku_name"
                  >({{ item.sku.sku_name }})</span
                >
                <span class="text-gray-400"> × {{ item.quantity }}</span>
              </div>
            </div>
          </div>
          <div v-else>无商品信息</div>
        </template>
      </el-table-column>
      <el-table-column prop="total_price" label="总价" width="100">
        <template #default="{ row }"> ¥{{ row.total_price }} </template>
      </el-table-column>
      <el-table-column prop="actual_price" label="实付" width="100">
        <template #default="{ row }"> ¥{{ row.actual_price }} </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          {{ formatStatus(row.status) }}
        </template>
      </el-table-column>
      <!-- 航线相关字段 -->
      <el-table-column prop="port_order_no" label="港区单号" width="180" />
      <el-table-column prop="route" label="航线" width="150" />
      <el-table-column prop="offline_flight" label="航班号" width="100" />
      <el-table-column prop="vehicle_type" label="车型" width="100" />
      <el-table-column prop="departure_port" label="始发港" width="100" />
      <el-table-column prop="destination_port" label="目的港" width="100" />
      <el-table-column prop="passenger_price" label="旅客票价" width="100">
        <template #default="{ row }"> ¥{{ row.passenger_price }} </template>
      </el-table-column>
      <el-table-column prop="vehicle_price" label="车辆票价" width="100">
        <template #default="{ row }"> ¥{{ row.vehicle_price }} </template>
      </el-table-column>
      <el-table-column prop="value_added_service" label="增值服务" width="100">
        <template #default="{ row }"> ¥{{ row.value_added_service }} </template>
      </el-table-column>
      <el-table-column prop="departure_time" label="离岛时间(开航时间)" width="180">
        <template #default="{ row }">
          {{ formatDate(row.sailing_time) }}
        </template>
      </el-table-column>
      <el-table-column prop="order_time" label="下单时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.order_time || row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEditOrder(row)">
            编辑
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="handleDeleteOrder(row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div class="mt-5 flex justify-end">
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

    <!-- 添加/编辑订单对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      :before-close="handleClose"
      fullscreen
      :destroy-on-close="true"
    >
      <el-form
        :model="form"
        :rules="rules"
        ref="formRef"
        label-width="100px"
        label-position="top"
      >
        <!-- 基本订单信息卡片 -->
        <el-card class="base-info-card" shadow="hover" style="margin-bottom: 20px;">
          <template #header>
            <div class="card-header">
              <span>基本订单信息</span>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="订单状态" prop="status">
                <el-select
                  v-model="form.status"
                  placeholder="选择订单状态"
                  style="width: 100%"
                >
                  <el-option label="待支付" value="pending" />
                  <el-option label="已支付" value="paid" />
                  <el-option label="已发货" value="shipped" />
                  <el-option label="已完成" value="completed" />
                  <el-option label="已取消" value="cancelled" />
                  <el-option label="售后中" value="refund" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="下单时间" prop="order_time">
                <el-date-picker
                  v-model="form.order_time"
                  type="datetime"
                  placeholder="选择下单时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="是否为口岸自提" prop="is_port_pickup">
                <el-radio-group v-model="form.is_port_pickup">
                  <el-radio :label="0">否</el-radio>
                  <el-radio :label="1">是</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="订单模板" prop="order_templ">
                <el-radio-group v-model="form.order_templ">
                  <el-radio :label="1">模板1</el-radio>
                  <el-radio :label="2">模板2</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <!-- 提货信息卡片 -->
        <el-card class="pickup-info-card" shadow="hover" style="margin-bottom: 20px;">
          <template #header>
            <div class="card-header">
              <span>提货信息</span>
            </div>
          </template>
          <el-row :gutter="20">
            <!-- <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="提货方式" prop="pickup_method">
                <el-input
                  v-model="form.pickup_method"
                  placeholder="请输入提货方式"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="提货点" prop="pickup_location">
                <el-input
                  v-model="form.pickup_location"
                  placeholder="请输入提货点"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col> -->
            <el-col :xs="24" :sm="24" :md="16" :lg="12">
              <el-form-item label="自提地址" prop="pickup_address">
                <el-input
                  v-model="form.pickup_address"
                  placeholder="请输入自提地址"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <!-- 费用信息卡片 -->
        <el-card class="cost-info-card" shadow="hover" style="margin-bottom: 20px;">
          <template #header>
            <div class="card-header">
              <span>费用信息</span>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="积分抵扣" prop="points_deduction">
                <el-input
                  v-model.number="form.points_deduction"
                  placeholder="积分抵扣金额"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="行邮税" prop="mail_tax">
                <el-input
                  v-model.number="form.mail_tax"
                  placeholder="行邮税金额"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="行邮税优惠" prop="mail_tax_discount">
                <el-input
                  v-model.number="form.mail_tax_discount"
                  placeholder="行邮税优惠金额"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <!-- 收货人信息卡片 -->
        <el-card class="consignee-info-card" shadow="hover" style="margin-bottom: 20px;">
          <template #header>
            <div class="card-header">
              <span>收货人信息</span>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="收货人姓名" prop="consignee_name">
                <el-input
                  v-model="form.consignee_name"
                  placeholder="请输入收货人姓名"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="收货人电话" prop="consignee_phone">
                <el-input
                  v-model="form.consignee_phone"
                  placeholder="请输入收货人电话"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="收货人身份证号" prop="consignee_idcard">
                <el-input
                  v-model="form.consignee_idcard"
                  placeholder="请输入收货人身份证号"
                  style="width: 100%"
                  maxlength="18"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <!-- 航线相关参数卡片 -->
        <el-card class="route-info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>航线相关参数</span>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="港区单号" prop="port_order_no">
                <el-input
                  v-model="form.port_order_no"
                  placeholder="不填写默认随机生成"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="航线" prop="route">
                <el-input
                  v-model="form.route"
                  placeholder="请输入航线"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="航班号" prop="offline_flight">
                <el-input
                  v-model="form.offline_flight"
                  placeholder="请输入航班号"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="开航时间（离岛时间）" prop="sailing_time">
                <el-date-picker
                  v-model="form.sailing_time"
                  type="datetime"
                  placeholder="选择开航时间（离岛时间）"
                  style="width: 100%"
                  value-format="YYYY-MM-DD HH:mm:ss"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="车型" prop="vehicle_type">
                <el-input
                  v-model="form.vehicle_type"
                  placeholder="请输入车型"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="始发港" prop="departure_port">
                <el-input
                  v-model="form.departure_port"
                  placeholder="请输入始发港"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="目的港" prop="destination_port">
                <el-input
                  v-model="form.destination_port"
                  placeholder="请输入目的港"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="旅客票价" prop="passenger_price">
                <el-input
                  v-model="form.passenger_price"
                  type="number"
                  placeholder="请输入旅客票价"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="车辆票价" prop="vehicle_price">
                <el-input
                  v-model="form.vehicle_price"
                  type="number"
                  placeholder="请输入车辆票价"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="增值服务" prop="value_added_service">
                <el-input
                  v-model="form.value_added_service"
                  type="number"
                  placeholder="请输入增值服务"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <el-row>
          <el-form-item
            label="商品信息"
            prop="items"
            class="max-600px md:col-span-2 lg:col-span-3"
          >
            <div class="w-full">
              <div
                v-if="form.items && form.items.length > 0"
                class="grid grid-cols-1 gap-4"
              >
                <div
                  v-for="(item, index) in form.items"
                  :key="index"
                  class="w-full mb-2 p-3 border border-gray-100 rounded-lg grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
                >
                  <div class="flex flex-col items-start gap-1">
                    <label
                      class="text-xs text-gray-600 font-medium whitespace-nowrap"
                      >商品</label
                    >
                    <el-select
                      v-model="item.product_id"
                      placeholder="选择商品"
                      @change="handleProductChange(item)"
                      style="width: 150px"
                    >
                      <el-option
                        v-for="product in products"
                        :key="product.id"
                        :label="product.name"
                        :value="product.id"
                      />
                    </el-select>
                  </div>
                  <div class="flex flex-col items-start gap-1">
                    <label
                      class="text-xs text-gray-600 font-medium whitespace-nowrap"
                      >规格</label
                    >
                    <el-select
                      v-model="item.sku_id"
                      placeholder="选择规格"
                      @change="handleSkuChange(item)"
                      style="width: 150px"
                    >
                      <el-option
                        v-for="sku in item.skus"
                        :key="sku.id"
                        :label="sku.sku_name"
                        :value="sku.id"
                      />
                    </el-select>
                  </div>
                  <div class="flex flex-col items-start gap-1">
                    <label
                      class="text-xs text-gray-600 font-medium whitespace-nowrap"
                      >数量</label
                    >
                    <el-input
                      v-model.number="item.quantity"
                      placeholder="数量"
                      style="width: 150px"
                    />
                  </div>
                  <div class="flex flex-col items-start gap-1">
                    <label
                      class="text-xs text-gray-600 font-medium whitespace-nowrap"
                      >实付金额</label
                    >
                    <el-input
                      v-model.number="item.discount_amount"
                      placeholder="实付金额"
                      style="width: 150px"
                      :disabled="true"
                    />
                  </div>
                  <div class="flex flex-col items-start gap-1">
                    <label
                      class="text-xs text-gray-600 font-medium whitespace-nowrap"
                    ></label>
                    <el-button
                      type="danger"
                      @click="form.items.splice(index, 1)"
                      class="grid-row-1 self-start justify-self-end"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </div>
              </div>
              <el-button type="primary" @click="addOrderItem">
                <el-icon><Plus /></el-icon> 添加商品
              </el-button>
            </div>
          </el-form-item>
        </el-row>
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

<script setup>
import { ref, onMounted, computed } from "vue";
import { Plus, Delete } from "@element-plus/icons-vue";
import { ElMessageBox, ElMessage } from "element-plus";
import {
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
} from "../api/orders";
import { getProducts, getProductDetail } from "../api/products";
import dayjs from "dayjs";

const orders = ref([]);
const products = ref([]);
const dialogVisible = ref(false);
const dialogTitle = ref("添加订单");
const form = ref({
  user_id: "0000001",
  sub_order_no: "",
  departure_time: null,
  sailing_time: null,
  order_time: null,
  status: "pending",
  points_deduction: 0,
  mail_tax: 0,
  mail_tax_discount: 0,
  is_port_pickup: 0,
  order_templ: 1,
  pickup_method: "口岸自提",
  pickup_location: "新海港",
  pickup_address: "",
  offline_flight: "HA2140",
  consignee_name: "",
  consignee_phone: "",
  consignee_idcard: "",
  port_order_no: "",
  route: "",
  vehicle_type: "",
  departure_port: "",
  destination_port: "",
  passenger_price: 0,
  vehicle_price: 0,
  value_added_service: 0,
  items: [],
});
const formRef = ref(null);
const rules = {
  items: [{ required: true, message: "请添加商品", trigger: "change" }],
  // 航线相关参数验证规则
  offline_flight: [{ required: true, message: "请输入航班号", trigger: "blur" }],
  sailing_time: [{ required: true, message: "请选择开航时间", trigger: "change" }],
  vehicle_type: [{ required: true, message: "请输入车型", trigger: "blur" }],
  departure_port: [{ required: true, message: "请输入始发港", trigger: "blur" }],
  destination_port: [{ required: true, message: "请输入目的港", trigger: "blur" }],
  // 收货人信息验证规则
  consignee_name: [{ required: true, message: "请输入收货人姓名", trigger: "blur" }],
  consignee_phone: [{ required: true, message: "请输入收货人电话", trigger: "blur" }],
  consignee_idcard: [{ required: true, message: "请输入收货人身份证号", trigger: "blur" }],
};

// 分页参数
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 获取订单列表
const fetchOrders = async () => {
  try {
    const response = await getOrders({
      page: currentPage.value,
      pageSize: pageSize.value,
    });
    if (response.data.success) {
      orders.value = response.data.data.list;
      total.value = response.data.data.total;
    } else {
      ElMessage.error(`获取订单列表失败: ${response.data.message}`);
    }
  } catch (error) {
    ElMessage.error("获取订单列表失败，请稍后重试");
    console.error("获取订单列表失败:", error);
  }
};

// 获取商品列表
const fetchProducts = async () => {
  try {
    const response = await getProducts({
      page: 1,
      pageSize: 999, // 商品列表通常不需要分页，获取足够多的商品即可
    });
    if (response.data.success) {
      products.value = response.data.data.list || [];
    } else {
      ElMessage.error(`获取商品列表失败: ${response.data.message}`);
    }
  } catch (error) {
    ElMessage.error("获取商品列表失败，请稍后重试");
    console.error("获取商品列表失败:", error);
  }
};

// 格式化日期
const formatDate = (date) => {
  if (!date) return "";
  return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
};

// 订单状态映射
const statusMap = {
  pending: "待支付",
  paid: "已支付",
  shipped: "已发货",
  completed: "已完成",
  cancelled: "已取消",
  refund: "售后中",
};

// 格式化订单状态
const formatStatus = (status) => {
  return statusMap[status] || status;
};

// 处理添加订单
const handleAddOrder = () => {
  dialogTitle.value = "添加订单";
  form.value = {
    user_id: "0000001",
    sub_order_no: "",
    sailing_time: null,
    order_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    status: "pending",
    points_deduction: 0,
    mail_tax: 0,
    mail_tax_discount: 0,
    is_port_pickup: 0,
    order_templ: 1,
    pickup_method: "口岸自提",
    pickup_location: "新海港",
    pickup_address: "",
    offline_flight: "HA2140",
    consignee_name: "",
    consignee_phone: "",
    consignee_idcard: "",
    port_order_no: "",
    route: "",
    vehicle_type: "",
    departure_port: "",
    destination_port: "",
    passenger_price: 0,
    vehicle_price: 0,
    value_added_service: 0,
    items: [],
  };
  dialogVisible.value = true;
};

// 处理编辑订单
const handleEditOrder = (row) => {
  dialogTitle.value = "编辑订单";
  form.value = {
    id: row.id,
    user_id: row.user_id,
    sub_order_no: row.sub_order_no,
    sailing_time: row.sailing_time
      ? dayjs(row.sailing_time).format("YYYY-MM-DD HH:mm:ss")
      : null,
    order_time: row.order_time
      ? dayjs(row.order_time).format("YYYY-MM-DD HH:mm:ss")
      : dayjs(row.created_at).format("YYYY-MM-DD HH:mm:ss"),
    status: row.status,
    points_deduction: row.points_deduction || 0,
    mail_tax: row.mail_tax || 0,
    mail_tax_discount: row.mail_tax_discount || 0,
    is_port_pickup: row.is_port_pickup || 0,
    order_templ: row.order_templ || 1,
    pickup_method: row.pickup_method || "口岸自提",
    pickup_location: row.pickup_location || "新海港",
    pickup_address: row.pickup_address || "",
    offline_flight: row.offline_flight || "HA2140",
    consignee_name: row.consignee_name || "",
    consignee_phone: row.consignee_phone || "",
    consignee_idcard: row.consignee_idcard || "",
    port_order_no: row.port_order_no || "",
    route: row.route || "",
    vehicle_type: row.vehicle_type || "",
    departure_port: row.departure_port || "",
    destination_port: row.destination_port || "",
    passenger_price: row.passenger_price || 0,
    vehicle_price: row.vehicle_price || 0,
    value_added_service: row.value_added_service || 0,
    items: row.items
      ? row.items.map((item) => ({
          product_id: item.product_id,
          sku_id: item.sku_id,
          quantity: item.quantity,
          discount_amount: item.discount_amount || 0,
          skus: [],
        }))
      : [],
  };
  // 为每个商品加载规格
  form.value.items.forEach((item) => {
    handleProductChange(item);
  });
  dialogVisible.value = true;
};

// 处理商品选择变化
const handleProductChange = async (item) => {
  if (item.product_id) {
    try {
      const response = await getProductDetail(item.product_id);
      if (response.data.success) {
        item.skus = response.data.data.skus || [];
        if (item.skus.length > 0) {
          item.sku_id = item.sku_id || item.skus[0].id;
          // 自动设置第一个规格的实付金额
          item.discount_amount = item.skus[0].actual_price || 0;
        }
      } else {
        ElMessage.error(`获取商品规格失败: ${response.data.message}`);
      }
    } catch (error) {
      ElMessage.error("获取商品规格失败，请稍后重试");
      console.error("获取商品规格失败:", error);
    }
  }
};

// 处理规格选择变化
const handleSkuChange = (item) => {
  if (item.sku_id && item.skus) {
    const selectedSku = item.skus.find((sku) => sku.id == item.sku_id);
    if (selectedSku) {
      // 从规格中获取实付金额
      item.discount_amount = selectedSku.actual_price || 0;
    }
  }
};

// 添加订单项
const addOrderItem = () => {
  form.value.items.push({
    product_id: "",
    sku_id: "",
    quantity: 1,
    discount_amount: 0,
    skus: [],
  });
};

// 计算订单总价和实付金额
const calculatePrices = () => {
  let total_price = 0;
  let actual_price = 0;
  form.value.items.forEach((item) => {
    if (item.quantity && item.discount_amount) {
      // 实付金额直接使用商品的实付金额
      actual_price += item.discount_amount;
      // 暂时将实付金额作为总价（实际应该根据商品原价计算）
      total_price += item.discount_amount;
    }
  });
  // 确保总价和实付金额至少为0.01
  total_price = Math.max(total_price, 0.01);
  actual_price = Math.max(actual_price, 0.01);
  return {
    total_price,
    actual_price,
  };
};

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      const { total_price, actual_price } = calculatePrices();
      try {
        // 处理日期格式
        const formatDate = (date) => {
          if (!date) return "";
          return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
        };

        if (form.value.id) {
          // 计算订单总价和实付金额
          const { total_price, actual_price } = calculatePrices();
          // 更新订单
          const updateResponse = await updateOrder(form.value.id, {
            user_id: form.value.user_id,
            sub_order_no:  form.value.sub_order_no,
            departure_time: formatDate(form.value.departure_time),
            sailing_time: formatDate(form.value.sailing_time),
            order_time: formatDate(form.value.order_time),
            status: form.value.status,
            points_deduction: form.value.points_deduction,
            mail_tax: form.value.mail_tax,
            mail_tax_discount: form.value.mail_tax_discount,
            is_port_pickup: form.value.is_port_pickup,
            order_templ: form.value.order_templ,
            pickup_method: form.value.pickup_method,
            pickup_location: form.value.pickup_location,
            pickup_address: form.value.pickup_address,
            offline_flight: form.value.offline_flight,
            consignee_name: form.value.consignee_name,
            consignee_phone: form.value.consignee_phone,
            consignee_idcard: form.value.consignee_idcard,
            port_order_no: form.value.port_order_no,
            route: form.value.route,
            vehicle_type: form.value.vehicle_type,
            departure_port: form.value.departure_port,
            destination_port: form.value.destination_port,
            passenger_price: form.value.passenger_price,
            vehicle_price: form.value.vehicle_price,
            value_added_service: form.value.value_added_service,
            total_price,
            actual_price,
            items: form.value.items,
          });
          if (updateResponse.data.success) {
            ElMessage.success("更新订单成功");
            dialogVisible.value = false;
            fetchOrders();
          } else {
            ElMessage.error(`更新订单失败: ${updateResponse.data.message}`);
          }
        } else {
          // 创建订单
          const createResponse = await createOrder({
            user_id: form.value.user_id,
            sub_order_no: '',
            departure_time: formatDate(form.value.departure_time),
            sailing_time: formatDate(form.value.sailing_time),
            order_time: formatDate(form.value.order_time),
            status: form.value.status,
            points_deduction: form.value.points_deduction,
            mail_tax: form.value.mail_tax,
            mail_tax_discount: form.value.mail_tax_discount,
            is_port_pickup: form.value.is_port_pickup,
            order_templ: form.value.order_templ,
            pickup_method: form.value.pickup_method,
            pickup_location: form.value.pickup_location,
            pickup_address: form.value.pickup_address,
            offline_flight: form.value.offline_flight,
            consignee_name: form.value.consignee_name,
            consignee_phone: form.value.consignee_phone,
            consignee_idcard: form.value.consignee_idcard,
            port_order_no: form.value.port_order_no,
            route: form.value.route,
            vehicle_type: form.value.vehicle_type,
            departure_port: form.value.departure_port,
            destination_port: form.value.destination_port,
            passenger_price: form.value.passenger_price,
            vehicle_price: form.value.vehicle_price,
            value_added_service: form.value.value_added_service,
            items: form.value.items,
            total_price,
            actual_price,
          });
          if (createResponse.data.success) {
            ElMessage.success("创建订单成功");
            dialogVisible.value = false;
            fetchOrders();
          } else {
            ElMessage.error(`创建订单失败: ${createResponse.data.message}`);
          }
        }
      } catch (error) {
        ElMessage.error("保存订单失败，请稍后重试");
        console.error("保存订单失败:", error);
      }
    }
  });
};

// 处理删除订单
const handleDeleteOrder = (id) => {
  ElMessageBox.confirm("确定要删除这个订单吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      const response = await deleteOrder(id);
      if (response.data.success) {
        ElMessage.success("删除订单成功");
        fetchOrders();
      } else {
        ElMessage.error(`删除订单失败: ${response.data.message}`);
      }
    } catch (error) {
      ElMessage.error("删除订单失败，请稍后重试");
      console.error("删除订单失败:", error);
    }
  });
};

// 处理分页大小变化
const handleSizeChange = (size) => {
  pageSize.value = size;
  fetchOrders();
};

// 处理页码变化
const handleCurrentChange = (current) => {
  currentPage.value = current;
  fetchOrders();
};

// 处理弹窗关闭
const handleClose = (done) => {
  done();
};

// 初始化
onMounted(() => {
  fetchOrders();
  fetchProducts();
});
</script>

<style scoped>
/* 已使用 Unocss 类名替换所有样式 */
</style>
