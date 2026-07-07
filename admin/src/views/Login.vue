<template>
  <div class="login-page">
    <div class="login-box">
      <div class="login-logo">🐆</div>
      <div class="login-title">猎豹出海工具箱</div>
      <div class="login-subtitle">后台管理系统</div>
      <el-form @submit.prevent="handleLogin">
        <el-form-item>
          <el-input v-model="form.username" placeholder="用户名" size="large" prefix-icon="User" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" type="password" placeholder="密码" size="large" prefix-icon="Lock" show-password @keyup.enter="handleLogin" />
        </el-form-item>
        <el-button type="primary" size="large" style="width:100%;margin-top:8px" :loading="loading" @click="handleLogin">登 录</el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from '../utils/request'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const form = ref({ username: '', password: '' })

const handleLogin = async () => {
  if (!form.value.username || !form.value.password) return ElMessage.warning('请输入用户名和密码')
  loading.value = true
  try {
    const res = await axios.post('/api/auth/login', form.value)
    if (res.data.code === 0) {
      localStorage.setItem('admin_token', res.data.data.token)
      ElMessage.success('登录成功')
      router.push('/dashboard')
    } else {
      ElMessage.error(res.data.msg)
    }
  } catch {
    ElMessage.error('网络错误')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3a5f 0%, #0f2027 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-box {
  background: white;
  border-radius: 16px;
  padding: 48px 40px;
  width: 380px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  text-align: center;
}
.login-logo { font-size: 48px; margin-bottom: 8px; }
.login-title { font-size: 20px; font-weight: 700; color: #1a1a1a; margin-bottom: 4px; }
.login-subtitle { font-size: 13px; color: #999; margin-bottom: 32px; }
</style>
