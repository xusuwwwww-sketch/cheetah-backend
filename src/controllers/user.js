const axios = require('axios')
const jwt = require('jsonwebtoken')
const db = require('../config/db')
require('dotenv').config()

// 微信登录
exports.login = async (req, res) => {
  const { code } = req.body
  if (!code) return res.json({ code: 400, msg: '缺少 code 参数' })

  // 开发模式：固定测试账号（以 dev_ 开头的 code 直接走测试逻辑）
  if (code.startsWith('dev_')) {
    const testOpenid = 'dev_openid_test_001'
    try {
      const [rows] = await db.query('SELECT * FROM users WHERE openid = ?', [testOpenid])
      let user = rows[0]
      if (!user) {
        const [result] = await db.query('INSERT INTO users (openid, nickname, level) VALUES (?, ?, 1)', [testOpenid, '测试用户'])
        await db.query('INSERT INTO user_profiles (user_id) VALUES (?)', [result.insertId])
        user = { id: result.insertId, openid: testOpenid, nickname: '测试用户', level: 1 }
      }
      const token = jwt.sign({ id: user.id, openid: user.openid }, process.env.JWT_SECRET || 'cheetah_secret', { expiresIn: '30d' })
      return res.json({ code: 0, msg: 'success', data: { token, user } })
    } catch (err) {
      return res.json({ code: 500, msg: '测试登录失败', detail: err.message })
    }
  }

  try {
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
        'INSERT INTO users (openid, level) VALUES (?, 1)', [openid]
      )
      // 同步创建 profile 占位行
      await db.query('INSERT INTO user_profiles (user_id) VALUES (?)', [result.insertId])
      user = { id: result.insertId, openid, level: 1 }
    }

    // 更新最后登录时间
    await db.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id])

    const token = jwt.sign(
      { id: user.id, openid: user.openid },
      process.env.JWT_SECRET || 'cheetah_secret',
      { expiresIn: process.env.JWT_EXPIRES || '30d' }
    )
    res.json({ code: 0, msg: 'success', data: { token, user } })
  } catch (err) {
    res.json({ code: 500, msg: '服务器错误', detail: err.message })
  }
}

// 更新基础信息（第二层留资）
exports.updateBasic = async (req, res) => {
  const { name, industry, position, email, phone } = req.body
  if (!name || !industry || !position || !email) {
    return res.json({ code: 400, msg: '请填写完整信息' })
  }
  try {
    await db.query(
      `INSERT INTO user_profiles (user_id, name, industry, position, email, phone)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name=VALUES(name), industry=VALUES(industry),
       position=VALUES(position), email=VALUES(email), phone=VALUES(phone)`,
      [req.user.id, name, industry, position, email, phone || null]
    )
    await db.query(
      'UPDATE users SET level = GREATEST(level, 2) WHERE id = ?',
      [req.user.id]
    )
    res.json({ code: 0, msg: 'success' })
  } catch (err) {
    res.json({ code: 500, msg: '更新失败', detail: err.message })
  }
}

// 更新深度留资（第三层）
exports.updateDeep = async (req, res) => {
  const { company, budget_min, budget_max, core_need, pain_point } = req.body
  if (!company || !core_need) {
    return res.json({ code: 400, msg: '请填写完整信息' })
  }
  try {
    await db.query(
      `INSERT INTO user_profiles (user_id, company, budget_min, budget_max, core_need, pain_point)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE company=VALUES(company), budget_min=VALUES(budget_min),
       budget_max=VALUES(budget_max), core_need=VALUES(core_need), pain_point=VALUES(pain_point)`,
      [req.user.id, company, budget_min || 0, budget_max || 0, core_need, pain_point || null]
    )
    await db.query('UPDATE users SET level = 3 WHERE id = ?', [req.user.id])
    res.json({ code: 0, msg: 'success' })
  } catch (err) {
    res.json({ code: 500, msg: '更新失败', detail: err.message })
  }
}

// 获取用户信息（含 profile）
exports.getProfile = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.openid, u.nickname, u.avatar, u.level, u.last_login_at, u.created_at,
              p.name, p.industry, p.position, p.email, p.phone,
              p.company, p.budget_min, p.budget_max, p.core_need, p.pain_point
       FROM users u
       LEFT JOIN user_profiles p ON p.user_id = u.id
       WHERE u.id = ?`,
      [req.user.id]
    )
    if (!rows[0]) return res.json({ code: 404, msg: '用户不存在' })
    res.json({ code: 0, msg: 'success', data: rows[0] })
  } catch (err) {
    res.json({ code: 500, msg: '获取失败', detail: err.message })
  }
}

// 获取用户收藏列表
exports.getFavorites = async (req, res) => {
  const { type, page = 1, size = 20 } = req.query
  const offset = (page - 1) * size
  let where = 'WHERE f.user_id = ?'
  const params = [req.user.id]
  if (type) { where += ' AND f.target_type = ?'; params.push(type) }
  try {
    const [rows] = await db.query(
      `SELECT f.id, f.target_type, f.target_id, f.created_at FROM user_favorites f
       ${where} ORDER BY f.id DESC LIMIT ? OFFSET ?`,
      [...params, Number(size), offset]
    )
    res.json({ code: 0, msg: 'success', data: rows })
  } catch (err) {
    res.json({ code: 500, msg: '获取失败', detail: err.message })
  }
}

// 切换收藏状态
exports.toggleFavorite = async (req, res) => {
  const { target_type, target_id } = req.body
  if (!target_type || !target_id) return res.json({ code: 400, msg: '参数缺失' })
  try {
    const [rows] = await db.query(
      'SELECT id FROM user_favorites WHERE user_id=? AND target_type=? AND target_id=?',
      [req.user.id, target_type, target_id]
    )
    if (rows[0]) {
      await db.query('DELETE FROM user_favorites WHERE id=?', [rows[0].id])
      res.json({ code: 0, msg: 'success', data: { favorited: false } })
    } else {
      await db.query(
        'INSERT INTO user_favorites (user_id, target_type, target_id) VALUES (?,?,?)',
        [req.user.id, target_type, target_id]
      )
      res.json({ code: 0, msg: 'success', data: { favorited: true } })
    }
  } catch (err) {
    res.json({ code: 500, msg: '操作失败', detail: err.message })
  }
}

// 获取下载/查看记录
exports.getDownloads = async (req, res) => {
  const { type, page = 1, size = 20 } = req.query
  const offset = (page - 1) * size
  let where = 'WHERE user_id = ?'
  const params = [req.user.id]
  if (type) { where += ' AND target_type = ?'; params.push(type) }
  try {
    const [rows] = await db.query(
      `SELECT * FROM user_downloads ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...params, Number(size), offset]
    )
    res.json({ code: 0, msg: 'success', data: rows })
  } catch (err) {
    res.json({ code: 500, msg: '获取失败', detail: err.message })
  }
}

// 获取用户报名列表
exports.getSignups = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.id, s.status, s.created_at, a.id as activity_id, a.title, a.start_time, a.type_slug, a.location
       FROM activity_signups s
       JOIN activities a ON a.id = s.activity_id
       WHERE s.user_id = ? ORDER BY s.id DESC`,
      [req.user.id]
    )
    res.json({ code: 0, msg: 'success', data: rows })
  } catch (err) {
    res.json({ code: 500, msg: '获取失败', detail: err.message })
  }
}

// 获取用户咨询记录
exports.getConsults = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, topic, status, scheduled_at, created_at FROM consults WHERE user_id = ? ORDER BY id DESC',
      [req.user.id]
    )
    res.json({ code: 0, msg: 'success', data: rows })
  } catch (err) {
    res.json({ code: 500, msg: '获取失败', detail: err.message })
  }
}
