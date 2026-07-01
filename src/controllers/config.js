const db = require('../config/db')

// 轮播图
exports.getBanners = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM banners WHERE status = 1 ORDER BY sort_order ASC')
    res.json({ code: 0, msg: 'success', data: rows })
  } catch (err) {
    res.json({ code: 500, msg: '获取失败' })
  }
}

// 社群列表（含当前用户入群状态）
exports.getCommunities = async (req, res) => {
  const userId = req.user?.id || null
  try {
    const [rows] = await db.query('SELECT * FROM communities WHERE status = 1 ORDER BY sort_order ASC')

    // 实时计算社群人数
    const [counts] = await db.query(
      'SELECT community_id, COUNT(*) as cnt FROM community_joins WHERE status = 1 GROUP BY community_id'
    )
    const countMap = {}
    counts.forEach(r => { countMap[r.community_id] = r.cnt })

    // 查用户入群状态
    let joinMap = {}
    if (userId) {
      const [joins] = await db.query(
        'SELECT community_id, status FROM community_joins WHERE user_id = ?', [userId]
      )
      joins.forEach(r => { joinMap[r.community_id] = r.status })
    }

    const data = rows.map(r => ({
      ...r,
      member_count: countMap[r.id] || 0,
      join_status: joinMap[r.id] ?? null  // null=未申请 0=申请中 1=已入群
    }))

    res.json({ code: 0, msg: 'success', data })
  } catch (err) {
    res.json({ code: 500, msg: '获取失败', detail: err.message })
  }
}

// 申请加入社群
exports.joinCommunity = async (req, res) => {
  const { community_id } = req.body
  if (!community_id) return res.json({ code: 400, msg: '参数缺失' })
  if (!req.user) return res.json({ code: 401, msg: '请先登录' })
  try {
    await db.query(
      `INSERT INTO community_joins (user_id, community_id, status)
       VALUES (?, ?, 0)
       ON DUPLICATE KEY UPDATE status = 0, updated_at = NOW()`,
      [req.user.id, community_id]
    )
    await db.query(
      'INSERT INTO user_events (user_id, event_type, target_type, target_id) VALUES (?, ?, ?, ?)',
      [req.user.id, 'join', 'community', community_id]
    ).catch(() => {})
    res.json({ code: 0, msg: '申请已提交，请等待管理员审核' })
  } catch (err) {
    res.json({ code: 500, msg: '申请失败', detail: err.message })
  }
}

// 标签列表（用于筛选）
exports.getTags = async (req, res) => {
  const { type } = req.query
  try {
    let where = ''
    const params = []
    if (type) { where = 'WHERE type = ?'; params.push(type) }
    const [rows] = await db.query(`SELECT * FROM tags ${where} ORDER BY sort_order ASC, id ASC`, params)
    res.json({ code: 0, msg: 'success', data: rows })
  } catch (err) {
    res.json({ code: 500, msg: '获取失败' })
  }
}
