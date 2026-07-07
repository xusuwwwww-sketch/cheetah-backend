import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/login', component: () => import('../views/Login.vue'), meta: { public: true } },
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', component: () => import('../views/Dashboard.vue'), meta: { title: '数据概览' } },
  { path: '/activities', component: () => import('../views/Activities.vue'), meta: { title: '活动管理' } },
  { path: '/contents', component: () => import('../views/Contents.vue'), meta: { title: '内容管理' } },
  { path: '/users', component: () => import('../views/Users.vue'), meta: { title: '留资管理' } },
  { path: '/communities', component: () => import('../views/Communities.vue'), meta: { title: '社群管理' } },
  { path: '/banners', component: () => import('../views/Banners.vue'), meta: { title: '轮播图配置' } },
  { path: '/popups', component: () => import('../views/Popups.vue'), meta: { title: '启动弹窗' } },
]

const router = createRouter({ history: createWebHashHistory(), routes })

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('admin_token')
  if (!to.meta.public && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
