const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 路由
app.use('/api/user', require('./routes/user'))
app.use('/api/activities', require('./routes/activity'))
app.use('/api/reports', require('./routes/report'))
app.use('/api/materials', require('./routes/material'))
app.use('/api/consult', require('./routes/consult'))
app.use('/api/config', require('./routes/config'))

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
