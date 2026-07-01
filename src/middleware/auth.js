const jwt = require('jsonwebtoken')
require('dotenv').config()

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ code: 401, msg: '请先登录' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'cheetah_secret')
    next()
  } catch {
    res.status(401).json({ code: 401, msg: 'token 已过期，请重新登录' })
  }
}
