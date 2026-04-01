<template>
  <div class="login-wrapper">
    <div class="login-background">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">
            <div class="logo-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#gradient1)" />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="url(#gradient1)"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="url(#gradient1)"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <defs>
                  <linearGradient
                    id="gradient1"
                    x1="2"
                    y1="2"
                    x2="22"
                    y2="22"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#667eea" />
                    <stop offset="1" stop-color="#764ba2" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 class="system-name">后台管理系统</h1>
            <p class="system-desc">Admin Management System</p>
          </div>
        </div>
        <div class="login-body">
          <el-form
            :model="loginForm"
            :rules="loginRules"
            ref="loginFormRef"
            class="login-form w-full"
          >
            <el-form-item prop="username">
              <div class="input-wrapper w-full">
                <el-icon class="input-icon"><User /></el-icon>
                <el-input
                  v-model="loginForm.username"
                  placeholder="请输入用户名"
                  class="custom-input flex-1"
                  size="large"
                />
              </div>
            </el-form-item>
            <el-form-item prop="password">
              <div class="input-wrapper w-full">
                <el-icon class="input-icon"><Lock /></el-icon>
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="请输入密码"
                  class="custom-input flex-1"
                  size="large"
                  show-password
                />
              </div>
            </el-form-item>
            <div class="login-options">
              <el-checkbox v-model="rememberMe">记住我</el-checkbox>
              <a href="javascript:;" class="forgot-link">忘记密码？</a>
            </div>
            <el-form-item>
              <el-button
                type="primary"
                class="login-btn"
                @click="handleLogin"
                :loading="loading"
                size="large"
              >
                {{ loading ? "登录中..." : "立即登录" }}
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="login-footer">
          <div class="divider">
            <span>快速登录</span>
          </div>
          <div class="social-login">
            <div class="social-item" @click="quickLogin('wechat')">
              <el-icon><ChatDotRound /></el-icon>
            </div>
            <div class="social-item" @click="quickLogin('dingtalk')">
              <el-icon><Message /></el-icon>
            </div>
            <div class="social-item" @click="quickLogin('feishu')">
              <el-icon><Document /></el-icon>
            </div>
          </div>
        </div>
      </div>

      <div class="copyright">
        <p>© 2026 后台管理系统 | Powered by Vue 3 + Element Plus</p>
      </div>
      <div class="copyright text-10px transform-scale-90">
        <p class="opacity-50">
          This system is intended for technical sharing and learning purposes
          only. Please do not use it for commercial activities. Any consequences
          arising from unauthorized commercial use shall be borne by the user.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../store/modules/user";
import { ElMessage } from "element-plus";
import {
  User,
  Lock,
  ChatDotRound,
  Message,
  Document,
} from "@element-plus/icons-vue";
import { login } from "../api/auth";

const router = useRouter();
const userStore = useUserStore();
const loginFormRef = ref(null);
const loading = ref(false);
const rememberMe = ref(false);

const loginForm = ref({
  username: "admin",
  password: "123456",
});

const loginRules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    {
      min: 3,
      max: 20,
      message: "用户名长度在 3 到 20 个字符",
      trigger: "blur",
    },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度不能少于 6 个字符", trigger: "blur" },
  ],
};

const handleLogin = async () => {
  if (!loginFormRef.value) return;

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const response = await login({
          username: loginForm.value.username,
          password: loginForm.value.password,
        });

        if (response.success) {
          const { token, user } = response.data;
          userStore.setToken(token);
          userStore.setUserInfo(user);
          ElMessage.success({
            message: "登录成功，欢迎回来！",
            duration: 2000,
          });
          setTimeout(() => {
            router.push("/dashboard");
          }, 500);
        } else {
          ElMessage.error(response.message || "登录失败，请重试");
        }
      } catch (error) {
        console.error("登录失败:", error);
        ElMessage.error("登录失败，请检查网络连接或账号密码");
      } finally {
        loading.value = false;
      }
    }
  });
};

const quickLogin = (type) => {
  const typeMap = {
    wechat: "微信",
    dingtalk: "钉钉",
    feishu: "飞书",
  };
  ElMessage.info(`${typeMap[type]}登录功能开发中...`);
};
</script>

<style scoped>
.login-wrapper {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-background {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 20s infinite ease-in-out;
}

.circle-1 {
  width: 400px;
  height: 400px;
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.circle-2 {
  width: 300px;
  height: 300px;
  bottom: -50px;
  right: -50px;
  animation-delay: 5s;
}

.circle-3 {
  width: 200px;
  height: 200px;
  top: 50%;
  right: 10%;
  animation-delay: 10s;
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(30px, -30px) rotate(120deg);
  }
  66% {
    transform: translate(-20px, 20px) rotate(240deg);
  }
}

.login-container {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 460px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 48px 40px;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-icon {
  width: 72px;
  height: 72px;
  margin-bottom: 20px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.system-name {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px 0;
  letter-spacing: 1px;
}

.system-desc {
  font-size: 14px;
  color: #909399;
  margin: 0;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.login-form {
  margin: 0;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  z-index: 10;
  font-size: 18px;
  color: #909399;
  transition: color 0.3s;
}

.custom-input {
  width: 100%;
}

.custom-input :deep(.el-input__wrapper) {
  padding-left: 48px !important;
  border-radius: 12px;
  background: #f7f8fa;
  border: 1px solid transparent;
  box-shadow: none;
  transition: all 0.3s;
}

.custom-input :deep(.el-input__wrapper:hover) {
  background: #f0f2f5;
}

.custom-input :deep(.el-input__wrapper.is-focus) {
  background: #fff;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.custom-input :deep(.el-input__inner) {
  font-size: 15px;
  color: #303133;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 4px;
}

.forgot-link {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.forgot-link:hover {
  color: #764ba2;
}

.login-btn {
  width: 100%;
  height: 50px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
}

.login-btn:active {
  transform: translateY(0);
}

.login-footer {
  margin-top: 32px;
}

.divider {
  position: relative;
  text-align: center;
  margin-bottom: 24px;
}

.divider::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #e4e7ed, transparent);
}

.divider span {
  position: relative;
  display: inline-block;
  padding: 0 16px;
  background: #fff;
  color: #909399;
  font-size: 13px;
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.social-item {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f7f8fa;
  color: #606266;
  font-size: 22px;
  cursor: pointer;
  transition: all 0.3s;
}

.social-item:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  transform: scale(1.1);
}

.copyright {
  margin-top: 32px;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  animation: fadeIn 1s ease-out 0.3s both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.copyright p {
  margin: 0;
}

@media (max-width: 576px) {
  .login-card {
    padding: 32px 24px;
    border-radius: 16px;
  }

  .system-name {
    font-size: 24px;
  }

  .logo-icon {
    width: 60px;
    height: 60px;
  }
}
</style>
