const db = require('../config/db')

// 活动列表
exports.list = async (req, res) => {
  const { type, keyword, page = 1, size = 20 } = req.query
  const offset = (page - 1) * size
  let where = 'WHERE status = 1'
  const params = []
  if (type) { where += ' AND type = ?'; params.push(type) }
  if (keyword) { where += ' AND title LIKE ?'; params.push(`%${keyword}%`) }
  try {
    const [rows] = await db.query(
      `SELECT * FROM activities ${where} ORDER BY sort_order DESC, id DESC LIMIT ? OFFSET ?`,
      [...params, Number(size), offset]
    )
    const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM activities ${where}`, params)
    res.json({ code: 0, msg: 'success', data: { list: rows, total, page: Number(page), size: Number(size) } })
  } catch (err) {
    res.json({ code: 500, msg: '获取失败', detail: err.message })
  }
}

// 活动详情
exports.detail = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM activities WHERE id = ? AND status = 1', [req.params.id])
    if (!rows[0]) return res.json({ code: 404, msg: '活动不存在' })
    res.json({ code: 0, msg: 'success', data: rows[0] })
  } catch (err) {
    res.json({ code: 500, msg: '获取失败', detail: err.message })
  }
}

// 报名活动
exports.signup = async (req, res) => {
  const activityId = req.params.id
  const userId = req.user.id
  try {
    const [acts] = await db.query('SELECT * FROM activities WHERE id = ?', [activityId])
    const act = acts[0]
    if (!act) return res.json({ code: 404, msg: '活动不存在' })
    if (act.quota > 0 && act.signup_count >= act.quota) return res.json({ code: 400, msg: '名额已满' })

    await db.query(
      'INSERT INTO activity_signups (user_id, activity_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE status = 1',
      [userId, activityId]
    )
    await db.query('UPDATE activities SET signup_count = signup_count + 1 WHERE id = ?', [activityId])
    res.json({ code: 0, msg: '报名成功' })
  } catch (err) {
    res.json({ code: 500, msg: '报名失败', detail: err.message })
  }
}
