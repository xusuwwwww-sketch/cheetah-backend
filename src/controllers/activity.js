const db = require('../config/db')

// 活动列表
exports.list = async (req, res) => {
  const { type, type_slug, keyword, page = 1, size = 20 } = req.query
  const typeFilter = type_slug || type  // 兼容两种参数名
  const offset = (page - 1) * size
  let where = 'WHERE a.status != 0'
  const params = []
  if (typeFilter && typeFilter !== 'all') { where += ' AND a.type_slug = ?'; params.push(typeFilter) }
  if (keyword) { where += ' AND a.title LIKE ?'; params.push(`%${keyword}%`) }
  try {
    const [rows] = await db.query(
      `SELECT a.*, 
              (SELECT COUNT(*) FROM activity_signups s WHERE s.activity_id = a.id AND s.status = 1) AS signup_count
       FROM activities a ${where}
       ORDER BY a.sort_order DESC, a.id DESC LIMIT ? OFFSET ?`,
      [...params, Number(size), offset]
    )
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM activities a ${where}`, params
    )
    res.json({ code: 0, msg: 'success', data: { list: rows, total, page: Number(page), size: Number(size) } })
  } catch (err) {
    res.json({ code: 500, msg: '获取失败', detail: err.message })
  }
}

// 活动详情
exports.detail = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.*,
              (SELECT COUNT(*) FROM activity_signups s WHERE s.activity_id = a.id AND s.status = 1) AS signup_count
       FROM activities a WHERE a.id = ? AND a.status != 0`,
      [req.params.id]
    )
    if (!rows[0]) return res.json({ code: 404, msg: '活动不存在' })
    res.json({ code: 0, msg: 'success', data: rows[0] })
  } catch (err) {
    res.json({ code: 500, msg: '获取失败', detail: err.message })
  }
}

// 报名活动（需登录）
exports.signup = async (req, res) => {
  const activityId = req.params.id
  const userId = req.user.id
  try {
    const [acts] = await db.query('SELECT * FROM activities WHERE id = ?', [activityId])
    const act = acts[0]
    if (!act) return res.json({ code: 404, msg: '活动不存在' })
    if (act.status === 2) return res.json({ code: 400, msg: '活动已结束' })
    if (act.signup_deadline && new Date(act.signup_deadline) < new Date()) {
      return res.json({ code: 400, msg: '报名已截止' })
    }

    // 检查名额（实时 COUNT，无冗余字段）
    if (act.quota > 0) {
      const [[{ cnt }]] = await db.query(
        'SELECT COUNT(*) as cnt FROM activity_signups WHERE activity_id = ? AND status = 1',
        [activityId]
      )
      if (cnt >= act.quota) return res.json({ code: 400, msg: '名额已满' })
    }

    await db.query(
      'INSERT INTO activity_signups (user_id, activity_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE status = 1, cancelled_at = NULL',
      [userId, activityId]
    )
    // 记录行为日志
    await db.query(
      'INSERT INTO user_events (user_id, event_type, target_type, target_id) VALUES (?, ?, ?, ?)',
      [userId, 'signup', 'activity', activityId]
    ).catch(() => {}) // 日志失败不影响主流程

    res.json({ code: 0, msg: '报名成功' })
  } catch (err) {
    res.json({ code: 500, msg: '报名失败', detail: err.message })
  }
}

// 取消报名
exports.cancelSignup = async (req, res) => {
  const activityId = req.params.id
  const userId = req.user.id
  try {
    await db.query(
      'UPDATE activity_signups SET status = 0, cancelled_at = NOW() WHERE user_id = ? AND activity_id = ?',
      [userId, activityId]
    )
    res.json({ code: 0, msg: '已取消报名' })
  } catch (err) {
    res.json({ code: 500, msg: '操作失败', detail: err.message })
  }
}

// 获取活动类型列表
exports.types = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM activity_types ORDER BY sort_order ASC')
    res.json({ code: 0, msg: 'success', data: rows })
  } catch (err) {
    res.json({ code: 500, msg: '获取失败', detail: err.message })
  }
}
