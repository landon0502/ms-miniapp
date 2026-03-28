<template>
  <div class="goods-container">
    <el-card class="goods-card">
      <div class="card-header">
        <el-button type="primary" @click="handleAddGoods">
          <el-icon><Plus /></el-icon>
          <span>添加商品</span>
        </el-button>
        <el-input
          v-model="searchQuery"
          placeholder="搜索商品名称"
          prefix-icon="Search"
          class="search-input"
        />
      </div>
      <el-table :data="goodsList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="商品图片" width="100">
          <template #default="scope">
            <el-image
              :src="getImageUrl(scope.row.image)"
              :preview-src-list="[scope.row.imageUrl]"
              :zoom-rate="1.2"
              :max-scale="7"
              :min-scale="0.2"
              :z-index="1000"
              preview-teleported
              fit="cover"
              style="width: 80px; height: 80px"
            />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="price" label="价格" width="100">
          <template #default="scope">
            <span>¥{{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100" />
        <el-table-column label="规格" min-width="150">
          <template #default="scope">
            <div v-if="scope.row.skus && scope.row.skus.length > 0">
              <div class="sku-list">
                <span
                  v-for="(sku, index) in scope.row.skus"
                  :key="sku.id"
                  class="sku-tag"
                >
                  {{ sku.sku_name }}
                </span>
              </div>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="促销" min-width="150">
          <template #default="scope">
            <div v-if="scope.row.promotions && scope.row.promotions.length > 0">
              <div class="promotion-list">
                <span
                  v-for="(promotion, index) in scope.row.promotions"
                  :key="promotion.id"
                  class="promotion-tag"
                >
                  {{ promotion.name }}
                  <el-tag
                    size="small"
                    :type="promotion.type === '赠品' ? 'success' : 'warning'"
                  >
                    {{ promotion.type }}
                  </el-tag>
                </span>
              </div>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="theme" label="主题" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.theme === 'red' ? 'danger' : 'info'">
              {{ scope.row.theme === "red" ? "红色" : "黑色" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleEditGoods(scope.row)">
              <el-icon><Edit /></el-icon>
              <span>编辑</span>
            </el-button>
            <el-button
              type="danger"
              link
              @click="handleDeleteGoods(scope.row.id)"
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

    <!-- 添加/编辑商品对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" fullscreen>
      <el-form
        :model="form"
        label-width="120px"
        :rules="rules"
        ref="formRef"
        class="goods-form"
        label-position="top"
      >
        <div class="form-row">
          <el-form-item label="商品名称" prop="name" class="form-item-col">
            <el-input v-model="form.name" placeholder="请输入商品名称" />
          </el-form-item>
          <el-form-item label="商品价格" prop="price" class="form-item-col">
            <el-input
              v-model.number="form.price"
              type="number"
              placeholder="请输入商品价格"
            />
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="商品库存" prop="stock" class="form-item-col">
            <el-input
              v-model.number="form.stock"
              type="number"
              placeholder="请输入商品库存"
            />
          </el-form-item>
          <el-form-item label="商品分类" prop="category" class="form-item-col">
            <el-input v-model="form.category" placeholder="请输入商品分类" />
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item
            label="商品描述"
            prop="description"
            class="form-item-col"
          >
            <el-input
              v-model="form.description"
              type="textarea"
              placeholder="请输入商品描述"
            />
          </el-form-item>
          <el-form-item label="商品主题" prop="theme" class="form-item-col">
            <el-radio-group v-model="form.theme">
              <el-radio label="red">红色主题</el-radio>
              <el-radio label="black">黑色主题</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            label="计量类型"
            prop="measurement_type"
            class="form-item-col"
          >
            <el-radio-group v-model="form.measurement_type">
              <el-radio label="spec">规格</el-radio>
              <el-radio label="capacity">容量</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="商品图片" class="form-item-col">
            <el-upload
              class="avatar-uploader"
              :action="'/api/upload'"
              name="file"
              accept="image/*"
              :show-file-list="true"
              :on-success="handleImageUploadSuccess"
              :on-error="handleImageUploadError"
              :limit="1"
              :file-list="form.imageList"
              list-type="picture-card"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="商品规格" prop="skus" class="form-item-full">
            <div v-if="form.skus && form.skus.length > 0">
              <div
                v-for="(sku, index) in form.skus"
                :key="sku.id"
                class="sku-item"
              >
                <div class="sku-header">
                  <span class="sku-index">规格 {{ index + 1 }}</span>
                  <div class="sku-actions">
                    <el-button
                      type="primary"
                      link
                      size="small"
                      @click="handleEditSku(form, sku, index)"
                    >
                      <el-icon><Edit /></el-icon>
                    </el-button>
                    <el-button
                      type="danger"
                      link
                      size="small"
                      @click="handleDeleteSku(sku.id, index)"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </div>
                <el-form
                  :model="sku"
                  label-width="100px"
                  class="sku-form"
                  label-position="top"
                >
                  <div class="form-row">
                    <el-form-item label="规格名称" class="form-item-col">
                      <el-input
                        v-model="sku.sku_name"
                        placeholder="请输入规格名称"
                      />
                    </el-form-item>
                    <el-form-item label="规格价格" class="form-item-col">
                      <el-input
                        v-model.number="sku.price"
                        type="number"
                        placeholder="请输入规格价格"
                      />
                    </el-form-item>
                    <el-form-item label="规格库存" class="form-item-col">
                      <el-input
                        v-model.number="sku.stock"
                        type="number"
                        placeholder="请输入规格库存"
                      />
                    </el-form-item>
                  </div>
                  <div class="form-row">
                    <el-form-item label="规格图片" class="form-item-full">
                      <el-upload
                        class="sku-image-uploader"
                        :action="'/api/upload'"
                        name="file"
                        accept="image/*"
                        :show-file-list="true"
                        :on-success="
                          (response, file, fileList) =>
                            handleSkuImageUploadSuccess(
                              response,
                              file,
                              fileList,
                              index
                            )
                        "
                        :on-error="handleImageUploadError"
                        :multiple="true"
                        :limit="5"
                        :file-list="sku.imageList || []"
                        list-type="picture-card"
                      >
                        <el-icon><Plus /></el-icon>
                      </el-upload>
                    </el-form-item>
                  </div>
                </el-form>
              </div>
            </div>
            <el-button type="primary" link @click="handleAddSku">
              <el-icon><Plus /></el-icon>
              <span>添加规格</span>
            </el-button>
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="赠品" class="form-item-full">
            <div v-if="form.promotions && form.promotions.length > 0">
              <div
                v-for="(promotion, index) in form.promotions"
                :key="promotion.id"
                class="promotion-item"
              >
                <div class="promotion-header">
                  <span class="promotion-index">促销 {{ index + 1 }}</span>
                  <div class="promotion-actions">
                    <el-button
                      type="primary"
                      link
                      size="small"
                      @click="handleEditPromotion(promotion, index)"
                    >
                      <el-icon><Edit /></el-icon>
                    </el-button>
                    <el-button
                      type="danger"
                      link
                      size="small"
                      @click="handleDeletePromotion(promotion.id)"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </div>
                <el-form
                  :model="promotion"
                  label-width="100px"
                  class="promotion-form"
                  label-position="top"
                >
                  <div class="form-row">
                    <el-form-item label="活动内容" class="form-item-col">
                      <el-input
                        v-model="promotion.name"
                        placeholder="请输入活动内容"
                      />
                    </el-form-item>
                    <el-form-item label="活动标签" class="form-item-col">
                      <el-input
                        v-model="promotion.label"
                        placeholder="请输入活动标签"
                      />
                    </el-form-item>

                    <el-form-item label="活动开始时间" class="form-item-col">
                      <el-date-picker
                        v-model="promotion.start_time"
                        type="datetime"
                        placeholder="选择活动开始时间"
                        style="width: 100%"
                      />
                    </el-form-item>

                    <el-form-item label="活动结束时间" class="form-item-col">
                      <el-date-picker
                        v-model="promotion.end_time"
                        type="datetime"
                        placeholder="选择活动结束时间"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </div>
                  <!-- 赠品类型特有字段 -->
                  <div class="form-row">
                    <el-form-item label="赠品图片" class="form-item-col">
                      <el-upload
                        class="sku-image-uploader"
                        :action="'/api/upload'"
                        name="file"
                        accept="image/*"
                        :show-file-list="true"
                        :on-success="
                          (response, file, fileList) =>
                            handlePromotionImageUploadSuccess(
                              response,
                              file,
                              fileList,
                              index
                            )
                        "
                        :on-error="handleImageUploadError"
                        :limit="1"
                        :file-list="promotion.imageList || []"
                        list-type="picture-card"
                      >
                        <el-icon><Plus /></el-icon>
                      </el-upload>
                    </el-form-item>
                    <el-form-item label="赠品数量" class="form-item-col">
                      <el-input
                        v-model.number="promotion.quantity"
                        type="number"
                        placeholder="请输入赠品数量"
                      />
                    </el-form-item>
                    <el-form-item label="赠品规格名" class="form-item-col">
                      <el-input
                        v-model="promotion.sku_name"
                        placeholder="请输入赠品规格名"
                      />
                    </el-form-item>
                    <el-form-item label="满赠条件" class="form-item-col">
                      <el-input
                        v-model.number="promotion.condition"
                        type="number"
                        placeholder="请输入满赠条件（满多少金额）"
                      />
                    </el-form-item>
                  </div>
                </el-form>
              </div>
            </div>
            <el-button type="primary" link @click="handleAddPromotion">
              <el-icon><Plus /></el-icon>
              <span>添加赠品</span>
            </el-button>
          </el-form-item>
        </div>
        
        <!-- 商品折扣配置 -->
        <div class="form-row">
          <el-form-item label="商品折扣" class="form-item-full">
            <div v-if="form.discounts && form.discounts.length > 0">
              <div
                v-for="(discount, index) in form.discounts"
                :key="discount.id"
                class="promotion-item"
              >
                <div class="promotion-header">
                  <span class="promotion-index">折扣 {{ index + 1 }}</span>
                  <div class="promotion-actions">
                    <el-button
                      type="primary"
                      link
                      size="small"
                      @click="handleEditDiscount(discount, index)"
                    >
                      <el-icon><Edit /></el-icon>
                    </el-button>
                    <el-button
                      type="danger"
                      link
                      size="small"
                      @click="handleDeleteDiscount(discount.id)"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </div>
                <el-form
                  :model="discount"
                  label-width="100px"
                  class="promotion-form"
                  label-position="top"
                >
                  <div class="form-row">
                    <el-form-item label="折扣内容" class="form-item-col">
                      <el-input
                        v-model="discount.name"
                        placeholder="请输入折扣内容"
                      />
                    </el-form-item>
                    <el-form-item label="活动开始时间" class="form-item-col">
                      <el-date-picker
                        v-model="discount.start_time"
                        type="datetime"
                        placeholder="选择活动开始时间"
                        style="width: 100%"
                      />
                    </el-form-item>
                    <el-form-item label="活动结束时间" class="form-item-col">
                      <el-date-picker
                        v-model="discount.end_time"
                        type="datetime"
                        placeholder="选择活动结束时间"
                        style="width: 100%"
                      />
                    </el-form-item>
                    <el-form-item label="折扣值" class="form-item-col">
                      <el-input
                        v-model.number="discount.value"
                        type="number"
                        placeholder="请输入折扣值（1-10之间）"
                      />
                    </el-form-item>
                  </div>
                </el-form>
              </div>
            </div>
            <el-button type="primary" link @click="handleAddDiscount">
              <el-icon><Plus /></el-icon>
              <span>添加折扣</span>
            </el-button>
          </el-form-item>
        </div>
        <!-- 富文本编辑器放在底部单独占一行 -->
        <div class="form-row">
          <el-form-item
            label="商品详细描述"
            prop="detail_description"
            class="form-item-full"
          >
            <div style="width: 100%">
              <div ref="quillEditor" class="quill-editor"></div>
            </div>
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveGoods">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 规格编辑对话框 -->
    <el-dialog v-model="skuDialogVisible" :title="skuDialogTitle" width="600px">
      <el-form
        :model="skuForm"
        label-width="100px"
        :rules="skuRules"
        ref="skuFormRef"
        label-position="top"
      >
        <el-form-item label="规格名称" prop="sku_name">
          <el-input v-model="skuForm.sku_name" placeholder="请输入规格名称" />
        </el-form-item>
        <el-form-item label="规格价格" prop="price">
          <el-input
            v-model.number="skuForm.price"
            type="number"
            placeholder="请输入规格价格"
          />
        </el-form-item>
        <el-form-item label="规格库存" prop="stock">
          <el-input
            v-model.number="skuForm.stock"
            type="number"
            placeholder="请输入规格库存"
          />
        </el-form-item>
        <el-form-item label="规格图片">
          <el-upload
            class="sku-image-uploader"
            :action="'/api/upload'"
            name="file"
            accept="image/*"
            :show-file-list="true"
            :on-success="handleSkuDialogImageUploadSuccess"
            :on-error="handleImageUploadError"
            :multiple="true"
            :limit="5"
            :file-list="skuForm.imageList"
            list-type="picture-card"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="skuDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveSku">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 促销编辑对话框 -->
    <el-dialog v-model="promotionDialogVisible" :title="promotionDialogTitle" width="800px">
      <el-form
        :model="promotionForm"
        label-width="120px"
        ref="promotionFormRef"
        label-position="top"
        class="promotion-form"
      >
        <div class="form-row">
          <el-form-item label="活动内容" class="form-item-col">
            <el-input
              v-model="promotionForm.name"
              placeholder="请输入活动内容"
            />
          </el-form-item>
          <el-form-item label="活动标签" class="form-item-col">
            <el-input
              v-model="promotionForm.label"
              placeholder="请输入活动标签"
            />
          </el-form-item>

          <el-form-item label="活动开始时间" class="form-item-col">
            <el-date-picker
              v-model="promotionForm.start_time"
              type="datetime"
              placeholder="选择活动开始时间"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="活动结束时间" class="form-item-col">
            <el-date-picker
              v-model="promotionForm.end_time"
              type="datetime"
              placeholder="选择活动结束时间"
              style="width: 100%"
            />
          </el-form-item>
        </div>
        <!-- 赠品类型特有字段 -->
        <div class="form-row">
          <el-form-item label="赠品图片" class="form-item-col">
            <el-upload
              class="sku-image-uploader"
              :action="'/api/upload'"
              name="file"
              accept="image/*"
              :show-file-list="true"
              :on-success="handlePromotionDialogImageUploadSuccess"
              :on-error="handleImageUploadError"
              :limit="1"
              :file-list="promotionForm.imageList"
              list-type="picture-card"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
          </el-form-item>
          <el-form-item label="赠品数量" class="form-item-col">
            <el-input
              v-model.number="promotionForm.quantity"
              type="number"
              placeholder="请输入赠品数量"
            />
          </el-form-item>
          <el-form-item label="赠品规格名" class="form-item-col">
            <el-input
              v-model="promotionForm.sku_name"
              placeholder="请输入赠品规格名"
            />
          </el-form-item>
          <el-form-item label="满赠条件" class="form-item-col">
            <el-input
              v-model.number="promotionForm.condition"
              type="number"
              placeholder="请输入满赠条件（满多少金额）"
            />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="promotionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSavePromotion">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 折扣编辑对话框 -->
    <el-dialog v-model="discountDialogVisible" :title="discountDialogTitle" width="600px">
      <el-form
        :model="discountForm"
        label-width="120px"
        ref="discountFormRef"
        label-position="top"
      >
        <div class="form-row">
          <el-form-item label="折扣内容" class="form-item-col">
            <el-input
              v-model="discountForm.name"
              placeholder="请输入折扣内容"
            />
          </el-form-item>
          <el-form-item label="活动开始时间" class="form-item-col">
            <el-date-picker
              v-model="discountForm.start_time"
              type="datetime"
              placeholder="选择活动开始时间"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="活动结束时间" class="form-item-col">
            <el-date-picker
              v-model="discountForm.end_time"
              type="datetime"
              placeholder="选择活动结束时间"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="折扣值" class="form-item-col">
            <el-input
              v-model.number="discountForm.value"
              type="number"
              placeholder="请输入折扣值（1-10之间）"
            />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="discountDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveDiscount">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Search, Edit, Delete } from "@element-plus/icons-vue";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import dayjs from "dayjs";
import {
  getProducts,
  getProductDetail,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductSku,
  updateProductSku,
  deleteProductSku,
} from "../api/products";
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from "../api/promotions";
import { getImageUrl } from "../api/request";

export default {
  name: "Goods",
  components: {
    Plus,
    Search,
    Edit,
    Delete,
  },
  setup() {
    const searchQuery = ref("");
    const currentPage = ref(1);
    const pageSize = ref(10);
    const total = ref(0);
    const goodsList = ref([]);
    const dialogVisible = ref(false);
    const dialogTitle = ref("");
    const form = ref({
      id: "",
      name: "",
      price: 0,
      original_price: 0,
      stock: 0,
      category: "",
      description: "",
      detail_description: "",
      theme: "red",
      measurement_type: "spec",
      image: "",
      imageList: [],
      skus: [],
      promotions: [],
      discounts: [],
    });
    const formRef = ref(null);
    const quillEditor = ref(null);
    let quillInstance = null;

    // 规格编辑相关变量
    const skuDialogVisible = ref(false);
    const skuDialogTitle = ref("");
    const skuForm = ref({
      id: "",
      sku_name: "",
      price: 0,
      stock: 0,
      imageList: [],
      images: [],
      product_id: "",
    });
    const skuFormRef = ref(null);
    const currentSkuIndex = ref(-1);

    const rules = {
      name: [{ required: true, message: "请输入商品名称", trigger: "blur" }],
      price: [
        { required: true, message: "请输入商品价格", trigger: "blur" },
        {
          validator: (rule, value, callback) => {
            const numValue = Number(value);
            if (isNaN(numValue) || numValue < 0) {
              callback(new Error("价格必须大于等于0"));
            } else {
              callback();
            }
          },
          trigger: "blur",
        },
      ],
      stock: [
        { required: true, message: "请输入商品库存", trigger: "blur" },
        {
          type: "number",
          min: 0,
          message: "库存必须大于等于0",
          trigger: "blur",
        },
      ],
      category: [
        { required: true, message: "请输入商品分类", trigger: "blur" },
      ],
      description: [
        { required: true, message: "请输入商品描述", trigger: "blur" },
      ],
      theme: [{ required: true, message: "请选择商品主题", trigger: "change" }],
      skus: [
        {
          validator: (rule, value, callback) => {
            if (!value || value.length === 0) {
              callback(new Error("请至少添加一个商品规格"));
            } else {
              callback();
            }
          },
          trigger: "blur",
        },
      ],
    };

    const skuRules = {
      sku_name: [
        { required: true, message: "请输入规格名称", trigger: "blur" },
      ],
      price: [
        { required: true, message: "请输入规格价格", trigger: "blur" },
        {
          validator: (rule, value, callback) => {
            const numValue = Number(value);
            if (isNaN(numValue) || numValue < 0) {
              callback(new Error("价格必须大于等于0"));
            } else {
              callback();
            }
          },
          trigger: "blur",
        },
      ],
      stock: [
        { required: true, message: "请输入规格库存", trigger: "blur" },
        {
          type: "number",
          min: 0,
          message: "库存必须大于等于0",
          trigger: "blur",
        },
      ],
    };

    // 初始化富文本编辑器的函数
    const initQuillEditor = () => {
      if (quillEditor.value && !quillInstance) {
        quillInstance = new Quill(quillEditor.value, {
          theme: "snow",
          modules: {
            toolbar: {
              container: [
                ["bold", "italic", "underline", "strike"],
                ["blockquote", "code-block"],
                [{ header: 1 }, { header: 2 }],
                [{ list: "ordered" }, { list: "bullet" }],
                [{ script: "sub" }, { script: "super" }],
                [{ indent: "-1" }, { indent: "+1" }],
                [{ direction: "rtl" }],
                [{ size: ["small", false, "large", "huge"] }],
                [{ header: [1, 2, 3, 4, 5, 6, false] }],
                [{ color: [] }, { background: [] }],
                [{ font: [] }],
                [{ align: [] }],
                ["clean"],
                ["image"],
              ],
              handlers: {
                image: function () {
                  const input = document.createElement("input");
                  input.setAttribute("type", "file");
                  input.setAttribute("accept", "image/*");
                  input.click();

                  input.onchange = async function () {
                    const file = input.files[0];
                    if (file) {
                      const formData = new FormData();
                      formData.append("file", file);

                      try {
                        const response = await fetch(
                          import.meta.env.VITE_API_BASE_URL + "/api/upload",
                          {
                            method: "POST",
                            body: formData,
                          }
                        );

                        if (response.ok) {
                          const result = await response.json();
                          if (result.success) {
                            const url = result.url;
                            const fullUrl = getImageUrl(url);
                            const range = quillInstance.getSelection();
                            quillInstance.insertEmbed(
                              range.index,
                              "image",
                              fullUrl
                            );
                          } else {
                            ElMessage.error("图片上传失败: " + result.message);
                          }
                        } else {
                          ElMessage.error("图片上传失败");
                        }
                      } catch (error) {
                        ElMessage.error("图片上传失败");
                        console.error("Error uploading image:", error);
                      }
                    }
                  };
                },
              },
            },
          },
        });

        // 监听内容变化，同步到 form.detail_description
        quillInstance.on("text-change", () => {
          form.value.detail_description = quillInstance.root.innerHTML;
        });

        // 初始化后设置编辑器内容
        if (form.value.detail_description) {
          quillInstance.root.innerHTML = form.value.detail_description;
        }
      }
    };

    onMounted(() => {
      fetchGoodsList();
    });

    // 监听对话框显示状态，当对话框打开时初始化富文本编辑器
    watch(
      () => dialogVisible.value,
      (newValue) => {
        if (newValue) {
          // 对话框打开后，等待DOM更新，然后初始化富文本编辑器
          setTimeout(() => {
            initQuillEditor();
          }, 100);
        }
      }
    );

    // 监听 detail_description 变化，同步到富文本编辑器
    watch(
      () => form.value.detail_description,
      (newValue) => {
        if (quillInstance && newValue !== quillInstance.root.innerHTML) {
          quillInstance.root.innerHTML = newValue || "";
        }
      }
    );

    const fetchGoodsList = async () => {
      try {
        const response = await getProducts({
          page: currentPage.value,
          pageSize: pageSize.value,
        });
        if (response.data.success) {
          // 为每个商品添加imageUrl属性，避免每次渲染时重新计算
          goodsList.value = response.data.data.list.map((item) => ({
            ...item,
            imageUrl: getImageUrl(item.image),
          }));
          total.value = response.data.data.total;
        } else {
          ElMessage.error("获取商品列表失败: " + response.data.message);
          console.error("Error fetching goods:", response.data.message);
        }
      } catch (error) {
        ElMessage.error("获取商品列表失败");
        console.error("Error fetching goods:", error);
      }
    };

    const handleAddGoods = () => {
      dialogTitle.value = "添加商品";
      form.value = {
        id: "",
        name: "",
        price: 0,
        original_price: 0,
        stock: 0,
        category: "",
        description: "",
        detail_description: "",
        theme: "red",
        measurement_type: "spec",
        image: "",
        imageList: [],
        skus: [],
        promotions: [],
        discounts: [],
      };
      dialogVisible.value = true;
    };

    const handleEditGoods = async (goods) => {
      try {
        const response = await getProductDetail(goods.id);
        if (response.data.success) {
          const productDetail = response.data.data;

          dialogTitle.value = "编辑商品";
          form.value = {
            id: productDetail.id,
            name: productDetail.name,
            price: productDetail.price,
            original_price: productDetail.original_price,
            stock: productDetail.stock,
            category: productDetail.category,
            description: productDetail.description,
            detail_description: productDetail.detail_description,
            theme: productDetail.theme || "red",
            measurement_type: productDetail.measurement_type || "spec",
            image: productDetail.image || "",
            imageList: productDetail.image
              ? [{ url: getImageUrl(productDetail.image) }]
              : [],
            skus: (productDetail.skus || []).map((sku) => ({
              id: sku.id,
              sku_name: sku.sku_name,
              price: sku.price,
              stock: sku.stock,
              imageList: (sku.images || []).map((img) => ({
                url: getImageUrl(img),
              })),
            })),
            promotions: (productDetail.promotions || []).map((promotion) => ({
              ...promotion,
              label: promotion.label || "",
              type: "赠品",
              start_time: promotion.start_time
                ? new Date(promotion.start_time)
                : null,
              end_time: promotion.end_time
                ? new Date(promotion.end_time)
                : null,
              quantity: promotion.quantity || 0,
              sku_name: promotion.sku_name || "",
              condition: promotion.condition || promotion.promotion_condition || 0,
              image: promotion.image || "",
              imageList: promotion.image
                ? [{ url: getImageUrl(promotion.image) }]
                : [],
            })),
            discounts: productDetail.discounts ? [{
              ...productDetail.discounts,
              start_time: productDetail.discounts.start_time
                ? new Date(productDetail.discounts.start_time)
                : null,
              end_time: productDetail.discounts.end_time
                ? new Date(productDetail.discounts.end_time)
                : null,
              value: productDetail.discounts.value || 1,
            }] : [],
          };
          dialogVisible.value = true;
        } else {
          ElMessage.error("获取商品详情失败: " + response.data.message);
          console.error(
            "Error fetching product detail:",
            response.data.message
          );
        }
      } catch (error) {
        ElMessage.error("获取商品详情失败");
        console.error("Error fetching product detail:", error);
      }
    };

    // 处理商品图片上传成功
    const handleImageUploadSuccess = (response, file, fileList) => {
      form.value.image = response.url;
      form.value.imageList = fileList;
      ElMessage.success("图片上传成功");
    };

    // 处理规格图片上传成功
    const handleSkuImageUploadSuccess = (response, file, fileList, index) => {
      if (!form.value.skus[index]) {
        form.value.skus[index] = {};
      }
      form.value.skus[index].imageList = fileList;
      // 确保images数组中存储的是实际的服务器URL，而不是blob URL
      form.value.skus[index].images = fileList.map((item) =>
        item.response ? item.response.url : item.url
      );
      ElMessage.success("图片上传成功");
    };

    // 处理赠品图片上传成功
    const handlePromotionImageUploadSuccess = (
      response,
      file,
      fileList,
      index
    ) => {
      if (!form.value.promotions[index]) {
        form.value.promotions[index] = {};
      }
      form.value.promotions[index].imageList = fileList;
      // 确保image存储的是实际的服务器URL，而不是blob URL
      form.value.promotions[index].image = fileList.map((item) =>
        item.response ? item.response.url : item.url
      )[0];
      ElMessage.success("图片上传成功");
    };

    // 处理图片上传失败
    const handleImageUploadError = (error) => {
      ElMessage.error("图片上传失败");
      console.error("Error uploading image:", error);
    };

    // 处理规格对话框图片上传成功
    const handleSkuDialogImageUploadSuccess = (response, file, fileList) => {
      skuForm.value.imageList = fileList;
      // 确保images数组中存储的是实际的服务器URL，而不是blob URL
      skuForm.value.images = fileList.map((item) =>
        item.response ? item.response.url : item.url
      );
      ElMessage.success("图片上传成功");
    };

    // 处理促销对话框图片上传成功
    const handlePromotionDialogImageUploadSuccess = (response, file, fileList) => {
      promotionForm.value.imageList = fileList;
      // 确保image存储的是实际的服务器URL，而不是blob URL
      promotionForm.value.image = fileList.map((item) =>
        item.response ? item.response.url : item.url
      )[0];
      ElMessage.success("图片上传成功");
    };

    // 保存规格
    const handleSaveSku = async () => {
      try {
        await skuFormRef.value.validate();

        // 准备提交的数据
        const submitData = {
          ...skuForm.value,
          price: Number(skuForm.value.price),
          stock: Number(skuForm.value.stock),
          images: skuForm.value.imageList
            .map((item) => item.url)
            .filter((url) => url !== null && url !== undefined && url !== ""),
        };

        if (skuForm.value.id) {
          // 编辑规格
          await updateProductSku(skuForm.value.id, submitData);
          ElMessage.success("编辑规格成功");
          skuDialogVisible.value = false;
          fetchGoodsList();
        } else {
          // 添加规格到表单中，而不是直接提交
          if (currentSkuIndex.value >= 0) {
            // 编辑现有规格
            form.value.skus[currentSkuIndex.value] = submitData;
          } else {
            // 添加新规格
            form.value.skus.push(submitData);
          }
          ElMessage.success("规格已添加到表单");
          skuDialogVisible.value = false;
        }
      } catch (error) {
        if (error.name === "Error") {
          ElMessage.error("操作失败");
          console.error("Error saving sku:", error);
        }
      }
    };

    // 保存促销
    const handleSavePromotion = async () => {
      try {
        // 准备提交的数据
        const submitData = {
          ...promotionForm.value,
          quantity: Number(promotionForm.value.quantity) || 0,
          condition: Number(promotionForm.value.condition) || 0,
        };

        // 保存到表单中
        if (currentPromotionIndex.value >= 0) {
          // 编辑现有促销，保留原始的 id 和 product_id 字段
          const originalPromotion = form.value.promotions[currentPromotionIndex.value];
          // 确保所有字段都被正确保存
          form.value.promotions[currentPromotionIndex.value] = {
            id: originalPromotion.id,
            product_id: originalPromotion.product_id,
            name: submitData.name,
            label: submitData.label,
            type: submitData.type,
            start_time: submitData.start_time,
            end_time: submitData.end_time,
            quantity: submitData.quantity,
            sku_name: submitData.sku_name,
            condition: submitData.condition,
            image: submitData.image,
            imageList: submitData.imageList
          };
        } else {
          // 添加新促销
          form.value.promotions.push(submitData);
        }
        ElMessage.success("促销已保存");
        promotionDialogVisible.value = false;
      } catch (error) {
        ElMessage.error("操作失败");
        console.error("Error saving promotion:", error);
      }
    };

    // 添加规格
    const handleAddSku = (product) => {
      if (product) {
        // 从商品列表添加规格
        skuDialogTitle.value = "添加规格";
        skuForm.value = {
          id: "",
          sku_name: "",
          price: 0,
          stock: 0,
          imageList: [],
          images: [],
          product_id: product.id,
        };
        currentSkuIndex.value = -1;
        skuDialogVisible.value = true;
      } else {
        // 从商品编辑对话框添加规格
        form.value.skus.push({
          id: "",
          sku_name: "",
          price: 0,
          stock: 0,
          imageList: [],
          images: [],
        });
      }
    };

    // 添加促销
    const handleAddPromotion = () => {
      form.value.promotions.push({
        id: "",
        name: "",
        label: "",
        type: "赠品",
        start_time: null,
        end_time: null,
        quantity: 0,
        sku_name: "",
        condition: 0,
        image: "",
        imageList: [],
      });
    };

    // 促销编辑相关变量
    const promotionDialogVisible = ref(false);
    const promotionDialogTitle = ref("");
    const promotionForm = ref({
      id: "",
      name: "",
      label: "",
      type: "赠品",
      start_time: null,
      end_time: null,
      quantity: 0,
      sku_name: "",
      condition: 0,
      image: "",
      imageList: [],
    });
    const promotionFormRef = ref(null);
    const currentPromotionIndex = ref(-1);
    
    // 折扣编辑相关变量
    const discountDialogVisible = ref(false);
    const discountDialogTitle = ref("");
    const discountForm = ref({
      id: "",
      name: "",
      start_time: null,
      end_time: null,
      value: 1,
    });
    const discountFormRef = ref(null);
    const currentDiscountIndex = ref(-1);

    // 编辑促销
    const handleEditPromotion = (promotion, index) => {
      promotionDialogTitle.value = "编辑赠品";
      // 填充促销数据到表单
      promotionForm.value = {
        ...promotion,
        type: "赠品",
        start_time: promotion.start_time ? new Date(promotion.start_time) : null,
        end_time: promotion.end_time ? new Date(promotion.end_time) : null,
        quantity: promotion.quantity || 0,
        sku_name: promotion.sku_name || "",
        condition: promotion.condition || promotion.promotion_condition || 0,
        image: promotion.image || "",
        imageList: promotion.imageList || (promotion.image ? [{ url: getImageUrl(promotion.image) }] : []),
      };
      currentPromotionIndex.value = index;
      promotionDialogVisible.value = true;
    };

    // 删除促销
    const handleDeletePromotion = async (promotionId) => {
      if (promotionId) {
        try {
          await deletePromotion(promotionId);
          ElMessage.success("删除赠品成功");
          fetchGoodsList();
        } catch (error) {
          ElMessage.error("删除赠品失败");
          console.error("Error deleting promotion:", error);
        }
      } else {
        // 删除表单中的促销
        form.value.promotions = form.value.promotions.filter(
          (promotion) => promotion.id !== promotionId
        );
      }
    };
    
    // 添加折扣
    const handleAddDiscount = () => {
      form.value.discounts.push({
        id: "",
        name: "",
        start_time: null,
        end_time: null,
        value: 1,
      });
    };
    
    // 编辑折扣
    const handleEditDiscount = (discount, index) => {
      discountDialogTitle.value = "编辑折扣";
      // 填充折扣数据到表单
      discountForm.value = {
        ...discount,
        start_time: discount.start_time ? new Date(discount.start_time) : null,
        end_time: discount.end_time ? new Date(discount.end_time) : null,
        value: discount.value || 1,
      };
      currentDiscountIndex.value = index;
      discountDialogVisible.value = true;
    };
    
    // 删除折扣
    const handleDeleteDiscount = (discountId) => {
      // 删除表单中的折扣
      form.value.discounts = form.value.discounts.filter(
        (discount) => discount.id !== discountId
      );
    };
    
    // 保存折扣
    const handleSaveDiscount = () => {
      // 保存到表单中
      if (currentDiscountIndex.value >= 0) {
        // 编辑现有折扣
        form.value.discounts[currentDiscountIndex.value] = {
          ...discountForm.value,
        };
      } else {
        // 添加新折扣
        form.value.discounts.push(discountForm.value);
      }
      ElMessage.success("折扣已保存");
      discountDialogVisible.value = false;
    };

    // 编辑规格
    const handleEditSku = (product, sku, index) => {
      skuDialogTitle.value = "编辑规格";
      skuForm.value = {
        id: sku.id,
        sku_name: sku.sku_name,
        price: sku.price,
        stock: sku.stock,
        imageList: (sku.images || []).map((img) => ({ url: getImageUrl(img) })),
        images: sku.images || [],
        product_id: product.id,
      };
      currentSkuIndex.value = index;
      skuDialogVisible.value = true;
    };

    // 删除规格
    const handleDeleteSku = async (skuId, index) => {
      try {
        if(skuId){
          await deleteProductSku(skuId);
          ElMessage.success("删除规格成功");
          fetchGoodsList();
        }else{
          form.value.skus.splice(index, 1)
        }
        
      } catch (error) {
        ElMessage.error("删除规格失败");
        console.error("Error deleting sku:", error);
      }
    };

    const handleSaveGoods = async () => {
      try {
        await formRef.value.validate();

        // 准备提交的数据
        const submitData = {
          ...form.value,
          price: Number(form.value.price),
          stock: Number(form.value.stock),
          measurement_type: form.value.measurement_type || "spec",
          skus: form.value.skus.map((sku) => ({
            ...sku,
            price: Number(sku.price),
            stock: Number(sku.stock),
            images: sku.imageList
              ? sku.imageList.map((item) =>
                  item.response ? item.response.url : item.url
                )
              : [],
          })),
          promotions: form.value.promotions.map((promotion) => ({
            ...promotion,
            type: "赠品",
            start_time: promotion.start_time
              ? dayjs(promotion.start_time).format("YYYY-MM-DD HH:mm:ss")
              : null,
            end_time: promotion.end_time
              ? dayjs(promotion.end_time).format("YYYY-MM-DD HH:mm:ss")
              : null,
            quantity: Number(promotion.quantity) || 0,
            sku_name: promotion.sku_name || "",
            condition: Number(promotion.condition) || 0,
            image: promotion.image || "",
          })),
          discounts: form.value.discounts.map((discount) => ({
            ...discount,
            start_time: discount.start_time
              ? dayjs(discount.start_time).format("YYYY-MM-DD HH:mm:ss")
              : null,
            end_time: discount.end_time
              ? dayjs(discount.end_time).format("YYYY-MM-DD HH:mm:ss")
              : null,
            value: Number(discount.value) || 1,
          })),
        };
        if (form.value.id) {
          // 编辑商品
          await updateProduct(form.value.id, submitData);
          ElMessage.success("编辑成功");
        } else {
          // 添加商品
          await createProduct(submitData);
          ElMessage.success("添加成功");
        }
        dialogVisible.value = false;
        fetchGoodsList();
      } catch (error) {
        if (error.name === "Error") {
          ElMessage.error("操作失败");
          console.error("Error saving goods:", error);
        }
      }
    };

    const handleDeleteGoods = (id) => {
      // 确认删除
      ElMessageBox.confirm("确定要删除该商品吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          try {
            // 执行删除操作
            await deleteProduct(id);
            ElMessage.success("删除成功");
            // 重新获取商品列表
            fetchGoodsList();
          } catch (error) {
            ElMessage.error("删除失败");
            console.error("Error deleting goods:", error);
          }
        })
        .catch(() => {
          // 取消删除
        });
    };

    const handleSizeChange = (size) => {
      pageSize.value = size;
      fetchGoodsList();
    };

    const handleCurrentChange = (current) => {
      currentPage.value = current;
      fetchGoodsList();
    };

    // 根据标签内容返回不同的颜色类型
    const getLabelType = (label) => {
      // 定义标签颜色映射
      const labelColorMap = {
        限时优惠: "primary",
        新品上市: "success",
        热卖推荐: "warning",
        会员专享: "info",
        满减活动: "danger",
      };
      // 如果标签在映射中存在，则返回对应的颜色类型，否则返回默认类型
      return labelColorMap[label] || "info";
    };

    return {
      searchQuery,
      currentPage,
      pageSize,
      total,
      goodsList,
      dialogVisible,
      dialogTitle,
      form,
      formRef,
      quillEditor,
      rules,
      skuDialogVisible,
      skuDialogTitle,
      skuForm,
      skuFormRef,
      skuRules,
      promotionDialogVisible,
      promotionDialogTitle,
      promotionForm,
      promotionFormRef,
      discountDialogVisible,
      discountDialogTitle,
      discountForm,
      discountFormRef,
      getImageUrl,
      getLabelType,
      handleAddGoods,
      handleEditGoods,
      handleSaveGoods,
      handleDeleteGoods,
      handleAddSku,
      handleEditSku,
      handleDeleteSku,
      handleAddPromotion,
      handleEditPromotion,
      handleDeletePromotion,
      handleSavePromotion,
      handleAddDiscount,
      handleEditDiscount,
      handleDeleteDiscount,
      handleSaveDiscount,
      handleImageUploadSuccess,
      handleSkuImageUploadSuccess,
      handleSkuDialogImageUploadSuccess,
      handlePromotionDialogImageUploadSuccess,
      handleImageUploadError,
      handleSaveSku,
      handleSizeChange,
      handleCurrentChange,
      handlePromotionImageUploadSuccess,
    };
  },
};
</script>

<style scoped>
.goods-container {
  background: transparent;
}

.goods-card {
  margin-bottom: 24px;
  border-radius: 20px;
  overflow: hidden;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.15);
  transition: all 0.3s ease;
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

/* 商品列表样式 */
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

/* 规格样式 */
.sku-item {
  margin-bottom: 12px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.sku-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.sku-info {
  margin-bottom: 8px;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sku-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sku-item:hover .sku-actions {
  opacity: 1;
}

.sku-images {
  display: flex;
  flex-wrap: wrap;
  margin-top: 8px;
  gap: 8px;
}

/* 弹窗中的规格样式 */
.sku-item {
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
  background-color: #f9f9f9;
  transition: all 0.3s ease;
}

.sku-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.sku-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.sku-index {
  font-weight: 600;
  font-size: 14px;
  color: #409eff;
}

.sku-form {
  margin-top: 12px;
}

/* 促销样式 */
.promotion-item {
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
  background-color: #f9f9f9;
  transition: all 0.3s ease;
}

.promotion-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.promotion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.promotion-index {
  font-weight: 600;
  font-size: 14px;
  color: #409eff;
}

.promotion-form {
  margin-top: 12px;
}

.promotion-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.promotion-item:hover .promotion-actions {
  opacity: 1;
}

/* 表格中的促销项样式 */
.promotion-item {
  margin-bottom: 8px;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.promotion-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.promotion-info {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

/* 规格列表样式 */
.sku-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 4px;
}

.sku-tag {
  background-color: #f0f2f5;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

/* 促销列表样式 */
.promotion-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.promotion-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: #f0f2f5;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

/* 上传组件样式 */
.avatar-uploader {
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.sku-image-uploader {
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

/* 表单布局样式 */
.goods-form {
  padding: 20px;
  max-height: calc(100vh - 150px);
  overflow-y: auto;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20px;
  gap: 20px;
}

.form-item-col {
  flex: 1;
  min-width: 300px;
}

.form-item-full {
  flex: 100%;
  min-width: 100%;
}

/* 富文本编辑器样式 */
.quill-editor {
  height: 400px;
  width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.quill-editor:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.quill-editor .ql-container {
  height: calc(100% - 42px);
}

.quill-editor .ql-editor {
  height: 100%;
  font-size: 14px;
  line-height: 1.5;
  color: #303133;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .form-item-col {
    flex: 100%;
    min-width: 100%;
  }

  .quill-editor {
    height: 300px;
  }
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

/* 图片样式 */
:deep(.el-image) {
  border-radius: 4px;
  transition: all 0.3s ease;
}

:deep(.el-image:hover) {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
</style>
