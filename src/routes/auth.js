const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const ADMIN_USER = process.env.ADMIN_USER || 'admin'
const ADMIN_PASS_HASH = process.env.ADMIN_PASS_HASH || bcrypt.hashSync(process.env.ADMIN_PASS || 'Cheetah2026!', 10)
const JWT_SECRET = process.env.JWT_SECRET || 'cheetah_secret_2026'

router.post('/login', (req, res) => {
  const { username, password } = req.body
  if (username !== ADMIN_USER) return res.json({ code: 401, msg: '用户名或密码错误' })
  if (!bcrypt.compareSync(password, ADMIN_PASS_HASH)) return res.json({ code: 401, msg: '用户名或密码错误' })
  const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ code: 0, msg: '登录成功', data: { token } })
})

router.get('/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.json({ code: 401, msg: '未登录' })
  try {
    const user = jwt.verify(token, JWT_SECRET)
    res.json({ code: 0, data: user })
  } catch {
    res.json({ code: 401, msg: 'token已过期' })
  }
})

module.exports = router
