import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', component: () => import('../views/Dashboard.vue'), meta: { title: '数据概览' } },
  { path: '/activities', component: () => import('../views/Activities.vue'), meta: { title: '活动管理' } },
  { path: '/reports', component: () => import('../views/Reports.vue'), meta: { title: '报告管理' } },
  { path: '/materials', component: () => import('../views/Materials.vue'), meta: { title: '资料管理' } },
  { path: '/consults', component: () => import('../views/Consults.vue'), meta: { title: '咨询预约' } },
  { path: '/banners', component: () => import('../views/Banners.vue'), meta: { title: '轮播图配置' } },
  { path: '/users', component: () => import('../views/Users.vue'), meta: { title: '用户留资' } },
]

export default createRouter({ history: createWebHashHistory(), routes })
