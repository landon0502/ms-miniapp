<template>
  <div class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '200px'" class="layout-aside">
      <div class="logo" :class="{ collapsed: isCollapse }">
        <h1>{{ isCollapse ? "" : "后台管理系统" }}</h1>
      </div>
      <div :style="{ height: 'calc(100vh - 64px)', overflow: 'hidden' }">
        <SidebarMenu :is-collapse="isCollapse" />
      </div>
    </el-aside>
    <el-container class="layout-main">
      <el-header class="layout-header">
        <div class="header-left"></div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32">{{
                userInfo.username?.[0] || "A"
              }}</el-avatar>
              <span>{{ userInfo.username || "管理员" }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  <span>退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="layout-content">
        <el-page-header
          class="page-header bg-white"
          :icon="''"
          :title="pageTitle"
          @back="goBack"
        >
          <template #breadcrumb>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ pageTitle }}</el-breadcrumb-item>
            </el-breadcrumb>
          </template>
        </el-page-header>
        <div class="page-content">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../store/modules/user";
import { Menu, SwitchButton } from "@element-plus/icons-vue";
import SidebarMenu from "./Menu.vue";

export default {
  name: "Layout",
  components: {
    SidebarMenu,
    Menu,
    SwitchButton,
  },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const isCollapse = ref(false);

    const userInfo = computed(() => {
      return userStore.userInfo;
    });

    const pageTitle = computed(() => {
      return router.currentRoute.value.meta.title || "页面";
    });

    const toggleSidebar = () => {
      isCollapse.value = !isCollapse.value;
    };

    const handleLogout = () => {
      userStore.logout();
      router.push("/login");
    };

    const goBack = () => {
      router.back();
    };

    return {
      userInfo,
      isCollapse,
      pageTitle,
      toggleSidebar,
      handleLogout,
      goBack,
    };
  },
};
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.layout-aside {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  color: #303133;
  transition: width 0.3s;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
}

.logo {
  height: 64px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  transition: all 0.3s;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.logo.collapsed {
  padding: 10px;
}

.logo h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  transition: all 0.3s;
  color: #fff;
}

.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.layout-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 64px;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.layout-content {
  flex: 1;
  padding: 0 0 24px;
  overflow-y: auto;
  background: rgba(245, 247, 250, 0.9);
  position: relative;
}

.page-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #FFF;
  padding: 24px 24px 10px;
  margin: 0;
}

.page-content {
  margin: 0;
  padding: 10px 20px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
