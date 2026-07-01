const jwt = require('jsonwebtoken')
require('dotenv').config()

// 可选鉴权：有 token 则解析挂载，无 token 也放行
module.exports = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) { req.user = null; return next() }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'cheetah_secret')
  } catch {
    req.user = null
  }
  next()
}
