const axios = require('axios')
const jwt = require('jsonwebtoken')
const db = require('../config/db')
require('dotenv').config()

// 微信登录
exports.login = async (req, res) => {
  const { code } = req.body
  if (!code) return res.json({ code: 400, msg: '缺少 code 参数' })

  try {
    // 换取 openid
    const wxRes = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: process.env.WX_APPID,
        secret: process.env.WX_SECRET,
        js_code: code,
        grant_type: 'authorization_code'
      }
    })

    const { openid, errcode } = wxRes.data
    if (errcode) return res.json({ code: 400, msg: '微信登录失败', detail: wxRes.data })

    // 查找或创建用户
    const [rows] = await db.query('SELECT * FROM users WHERE openid = ?', [openid])
    let user = rows[0]

    if (!user) {
      const [result] = await db.query(
        'INSERT INTO users (openid, level) VALUES (?, 1)',
        [openid]
      )
      user = { id: result.insertId, openid, level: 1 }
    }

    // 生成 JWT
    const token = jwt.sign(
      { id: user.id, openid: user.openid },
      process.env.JWT_SECRET || 'cheetah_secret',
      { expiresIn: process.env.JWT_EXPIRES || '7d' }
    )

    res.json({ code: 0, msg: 'success', data: { token, user } })
  } catch (err) {
    res.json({ code: 500, msg: '服务器错误', detail: err.message })
  }
}

// 更新基础信息（第二层留资）
exports.updateBasic = async (req, res) => {
  const { name, industry, position, email } = req.body
  if (!name || !industry || !position || !email) {
    return res.json({ code: 400, msg: '请填写完整信息' })
  }
  try {
    await db.query(
      'UPDATE users SET name=?, industry=?, position=?, email=?, level=GREATEST(level,2) WHERE id=?',
      [name, industry, position, email, req.user.id]
    )
    res.json({ code: 0, msg: 'success' })
  } catch (err) {
    res.json({ code: 500, msg: '更新失败', detail: err.message })
  }
}

// 更新深度留资（第三层）
exports.updateDeep = async (req, res) => {
  const { company, budget, core_need, pain_point } = req.body
  if (!company || !budget || !core_need) {
    return res.json({ code: 400, msg: '请填写完整信息' })
  }
  try {
    await db.query(
      'UPDATE users SET company=?, budget=?, core_need=?, pain_point=?, level=3 WHERE id=?',
      [company, budget, core_need, pain_point || null, req.user.id]
    )
    res.json({ code: 0, msg: 'success' })
  } catch (err) {
    res.json({ code: 500, msg: '更新失败', detail: err.message })
  }
}

// 获取用户信息
exports.getProfile = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE id=?', [req.user.id])
    if (!rows[0]) return res.json({ code: 404, msg: '用户不存在' })
    res.json({ code: 0, msg: 'success', data: rows[0] })
  } catch (err) {
    res.json({ code: 500, msg: '获取失败', detail: err.message })
  }
}
