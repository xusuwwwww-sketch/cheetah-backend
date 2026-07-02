const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

// 中间件
app.use(cors())
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 路由
app.use('/api/user', require('./routes/user'))
app.use('/api/activities', require('./routes/activity'))
app.use('/api/reports', require('./routes/report'))
app.use('/api/materials', require('./routes/material'))
app.use('/api/consult', require('./routes/consult'))
app.use('/api/config', require('./routes/config'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/upload', require('./routes/upload'))

// 静态文件：上传的图片
app.use('/uploads', require('express').static('public/uploads'))

// 静态文件服务（运营后台）
app.use('/admin', require('express').static('public/admin'))

// 健康检查
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }))

// 404
app.use((req, res) => res.status(404).json({ code: 404, msg: '接口不存在' }))

// 错误处理
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ code: 500, msg: '服务器内部错误' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`✅ 猎豹出海工具箱 API 已启动：http://localhost:${PORT}`)
})

module.exports = app
