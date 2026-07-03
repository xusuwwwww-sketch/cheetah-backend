import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', component: () => import('../views/Dashboard.vue'), meta: { title: '数据概览' } },
  { path: '/activities', component: () => import('../views/Activities.vue'), meta: { title: '活动管理' } },
  { path: '/contents', component: () => import('../views/Contents.vue'), meta: { title: '内容管理' } },
  { path: '/users', component: () => import('../views/Users.vue'), meta: { title: '留资管理' } },
  { path: '/communities', component: () => import('../views/Communities.vue'), meta: { title: '社群管理' } },
  { path: '/banners', component: () => import('../views/Banners.vue'), meta: { title: '轮播图配置' } },
  { path: '/popups', component: () => import('../views/Popups.vue'), meta: { title: '启动弹窗' } },
  { path: '/users', component: () => import('../views/Users.vue'), meta: { title: '用户留资' } },
]

export default createRouter({ history: createWebHashHistory(), routes })
