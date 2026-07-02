import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', component: () => import('../views/Dashboard.vue'), meta: { title: '数据概览' } },
  { path: '/activities', component: () => import('../views/Activities.vue'), meta: { title: '活动管理' } },
  { path: '/contents', component: () => import('../views/Contents.vue'), meta: { title: '内容管理' } },
  { path: '/consults', component: () => import('../views/Consults.vue'), meta: { title: '咨询预约' } },
  { path: '/banners', component: () => import('../views/Banners.vue'), meta: { title: '轮播图配置' } },
  { path: '/users', component: () => import('../views/Users.vue'), meta: { title: '用户留资' } },
]

export default createRouter({ history: createWebHashHistory(), routes })
