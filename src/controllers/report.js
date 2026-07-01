const db = require('../config/db')

// 报告列表（支持多标签筛选）
exports.list = async (req, res) => {
  const { industry, region, year, is_free, tag_ids, page = 1, size = 20 } = req.query
  const offset = (page - 1) * size
  let where = 'WHERE r.status = 1'
  const params = []

  if (industry) { where += ' AND r.industry = ?'; params.push(industry) }
  if (region)   { where += ' AND r.region = ?';   params.push(region) }
  if (year)     { where += ' AND r.year = ?';     params.push(year) }
  if (is_free !== undefined) { where += ' AND r.is_free = ?'; params.push(Number(is_free)) }

  // 多标签筛选（tag_ids=1,2,3）
  if (tag_ids) {
    const ids = tag_ids.split(',').map(Number).filter(Boolean)
    if (ids.length) {
      where += ` AND r.id IN (
        SELECT content_id FROM content_tags
        WHERE content_type = 'report' AND tag_id IN (${ids.map(() => '?').join(',')})
        GROUP BY content_id HAVING COUNT(DISTINCT tag_id) = ?
      )`
      params.push(...ids, ids.length)
    }
  }

  try {
    const [rows] = await db.query(
      `SELECT r.id, r.title, r.cover_url, r.gradient, r.source, r.industry, r.region,
              r.year, r.is_free, r.price, r.summary, r.created_at,
              (SELECT COUNT(*) FROM user_downloads d WHERE d.target_type='report' AND d.target_id=r.id) AS download_count
       FROM reports r ${where}
       ORDER BY r.sort_order DESC, r.id DESC LIMIT ? OFFSET ?`,
      [...params, Number(size), offset]
    )
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM reports r ${where}`, params
    )
    res.json({ code: 0, msg: 'success', data: { list: rows, total, page: Number(page), size: Number(size) } })
  } catch (err) {
    res.json({ code: 500, msg: '获取失败', detail: err.message })
  }
}

// 报告详情（含标签）
exports.detail = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM reports WHERE id = ? AND status = 1', [req.params.id]
    )
    if (!rows[0]) return res.json({ code: 404, msg: '报告不存在' })

    // 查标签
    const [tags] = await db.query(
      `SELECT t.id, t.name, t.type FROM tags t
       JOIN content_tags ct ON ct.tag_id = t.id
       WHERE ct.content_type = 'report' AND ct.content_id = ?`,
      [req.params.id]
    )
    // 查收藏状态（已登录才查）
    let favorited = false
    if (req.user) {
      const [fav] = await db.query(
        'SELECT id FROM user_favorites WHERE user_id=? AND target_type=? AND target_id=?',
        [req.user.id, 'report', req.params.id]
      )
      favorited = !!fav[0]
    }

    res.json({ code: 0, msg: 'success', data: { ...rows[0], tags, favorited } })
  } catch (err) {
    res.json({ code: 500, msg: '获取失败', detail: err.message })
  }
}

// 查看/下载报告（需基础留资）
exports.view = async (req, res) => {
  const userId = req.user.id
  const reportId = req.params.id
  try {
    const [users] = await db.query('SELECT level FROM users WHERE id = ?', [userId])
    if (!users[0] || users[0].level < 2) {
      return res.json({ code: 403, msg: 'need_basic_info', tip: '请先完善基础信息后下载' })
    }
    const [rows] = await db.query(
      'SELECT file_url FROM reports WHERE id = ? AND status = 1', [reportId]
    )
    if (!rows[0]) return res.json({ code: 404, msg: '报告不存在' })

    // 记录下载
    await db.query(
      'INSERT INTO user_downloads (user_id, target_type, target_id) VALUES (?, ?, ?)',
      [userId, 'report', reportId]
    )
    // 行为日志
    await db.query(
      'INSERT INTO user_events (user_id, event_type, target_type, target_id) VALUES (?, ?, ?, ?)',
      [userId, 'download', 'report', reportId]
    ).catch(() => {})

    res.json({ code: 0, msg: 'success', data: { file_url: rows[0].file_url } })
  } catch (err) {
    res.json({ code: 500, msg: '获取失败', detail: err.message })
  }
}
