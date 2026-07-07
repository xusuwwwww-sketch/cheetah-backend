import axios from 'axios'
import router from '../router'

const request = axios.create()

request.interceptors.request.use(config => {
  const token = localStorage.getItem('admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

request.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      // 只有不在登录页时才跳转，避免循环
      if (router.currentRoute.value.path !== '/login') {
        localStorage.removeItem('admin_token')
        router.push('/login')
      }
    }
    return Promise.reject(err)
  }
)

export default request
