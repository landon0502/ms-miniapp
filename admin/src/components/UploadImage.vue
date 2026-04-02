<template>
  <div :class="{'upload-image-container': true, 'hide-upload-button': fileList.length >= limit}">
    <el-upload
      class="upload-image"
      :class="{ 'avatar-uploader': !multiple, 'multi-uploader': multiple }"
      :action="uploadUrl"
      name="file"
      accept="image/*"
      :show-file-list="showFileList"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-remove="handleRemove"
      :before-upload="beforeUpload"
      :multiple="multiple"
      :limit="limit"
      :file-list="fileList"
      :list-type="listType"
    >
      <template v-if="!showFileList || fileList.length < limit">
        <div class="upload-button-content">
          <el-icon><Plus /></el-icon>
          <span v-if="buttonText" class="upload-text">{{ buttonText }}</span>
        </div>
      </template>
      <template v-else>
        <div class="upload-button-hidden"></div>
      </template>
    </el-upload>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { Plus } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const props = defineProps({
  // 图片URL或URL数组
  modelValue: {
    type: [String, Array],
    default: "",
  },
  // 上传地址
  action: {
    type: String,
    default: "/api/upload",
  },
  // 是否多选
  multiple: {
    type: Boolean,
    default: false,
  },
  // 最大上传数量
  limit: {
    type: Number,
    default: 1,
  },
  // 是否显示文件列表
  showFileList: {
    type: Boolean,
    default: true,
  },
  // 列表类型
  listType: {
    type: String,
    default: "picture-card",
  },
  // 按钮文字
  buttonText: {
    type: String,
    default: "",
  },
  // 上传前校验
  beforeUpload: {
    type: Function,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue", "success", "error", "remove"]);

// 上传地址
const uploadUrl = computed(() => {
  const baseUrl =
    location.protocol + "//" + import.meta.env.VITE_API_BASE_URL || "";
  return baseUrl + props.action;
});

// 文件列表
const fileList = ref([]);

// 初始化文件列表
const initFileList = () => {
  if (!props.modelValue) {
    fileList.value = [];
    return;
  }
  if (props.multiple && Array.isArray(props.modelValue)) {
    fileList.value = props.modelValue.map((url, index) => ({
      name: `image-${index}`,
      url: getFullUrl(url),
      response: { url },
    }));
  } else if (typeof props.modelValue === "string" && props.modelValue) {
    fileList.value = [
      {
        name: "image",
        url: getFullUrl(props.modelValue),
        response: { url: props.modelValue },
      },
    ];
  } else {
    fileList.value = [];
  }
};

// 获取完整URL
const getFullUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  if (url.startsWith("http")) return url;
  const baseUrl =
    location.protocol + "//" + import.meta.env.VITE_API_BASE_URL || "";
  return baseUrl + url;
};

// 监听modelValue变化
watch(() => props.modelValue, initFileList, { immediate: true });

// 处理上传成功
const handleSuccess = (response, file, fileListData) => {
  if (response.success) {
    fileList.value = fileListData;
    updateValue();
    emit("success", response, file, fileListData);
    ElMessage.success("图片上传成功");
  } else {
    ElMessage.error("图片上传失败: " + (response.message || "未知错误"));
    emit("error", new Error(response.message), file, fileListData);
  }
};

// 处理上传失败
const handleError = (error, file, fileListData) => {
  ElMessage.error("图片上传失败");
  emit("error", error, file, fileListData);
};

// 处理删除
const handleRemove = (file, fileListData) => {
  fileList.value = fileListData;
  updateValue();
  emit("remove", file, fileListData);
};

// 更新值
const updateValue = () => {
  const urls = fileList.value
    .map((item) => item.response?.url || item.url)
    .filter((url) => typeof url === "string" && url !== "");
  if (props.multiple) {
    emit("update:modelValue", urls);
  } else {
    emit("update:modelValue", urls[0] || "");
  }
};

// 默认上传前校验
const defaultBeforeUpload = (file) => {
  const isImage = file.type.startsWith("image/");
  if (!isImage) {
    ElMessage.error("只能上传图片文件!");
    return false;
  }
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    ElMessage.error("图片大小不能超过 5MB!");
    return false;
  }
  return true;
};
</script>

<style scoped lang="scss">
.upload-image {
  display: inline-block;
}

.avatar-uploader :deep(.el-upload) {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader :deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
}

.multi-uploader :deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
}

.upload-text {
  margin-left: 8px;
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.upload-button-hidden {
  display: none;
}

.upload-image-container {
  :deep(.el-upload-list--picture-card ){
    .el-upload-list__item {
      width: 100px;
      height: 100px;
    }
  }
}
.hide-upload-button {
  :deep(.el-upload--picture-card) {
    display: none !important;
  }
}
</style>
