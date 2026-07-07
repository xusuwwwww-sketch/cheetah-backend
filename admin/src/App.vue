<template>
  <router-view v-if="$route.meta.public" />
  <el-container v-else class="layout">
    <el-aside width="200px" class="aside">
      <div class="logo">🐆 猎豹出海后台</div>
      <el-menu :default-active="$route.path" router background-color="#1a1a2e" text-color="#adb5bd" active-text-color="#ff6b35">
        <el-menu-item v-for="item in menus" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <span class="page-title">{{ $route.meta.title }}</span>
        <el-button size="small" @click="logout">退出登录</el-button>
      </el-header>
      <el-main><router-view /></el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

const menus = [
  { path: '/dashboard', title: '数据概览', icon: 'DataLine' },
  { path: '/activities', title: '活动管理', icon: 'Calendar' },
  { path: '/contents', title: '内容管理', icon: 'Files' },
  { path: '/users', title: '留资管理', icon: 'User' },
  { path: '/communities', title: '社群管理', icon: 'ChatDotSquare' },
  { path: '/banners', title: '轮播图配置', icon: 'Picture' },
  { path: '/popups', title: '启动弹窗', icon: 'Bell' },
]

const logout = () => {
  localStorage.removeItem('admin_token')
  router.push('/login')
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
.layout { height: 100vh; }
.aside { background: #1a1a2e !important; }
.logo { padding: 20px 16px; color: #ff6b35; font-size: 15px; font-weight: 800; border-bottom: 1px solid rgba(255,255,255,.1); }
.header { background: #fff; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between; }
.page-title { font-size: 16px; font-weight: 700; color: #1a1a2e; }
</style>
