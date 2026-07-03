const db = require('../config/db')

// 资料分类列表
exports.categories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM material_categories ORDER BY sort_order ASC')
    res.json({ code: 0, msg: 'success', data: rows })
  } catch (err) {
    res.json({ code: 500, msg: '获取失败', detail: err.message })
  }
}

// 内容列表（报告/案例/资料通用）
exports.list = async (req, res) => {
  const { content_type, page = 1, size = 20 } = req.query
  const offset = (page - 1) * size
  let where = 'WHERE m.status = 1'
  const params = []
  if (content_type) { where += ' AND m.content_type = ?'; params.push(content_type) }

  try {
    const [rows] = await db.query(
      `SELECT m.id, m.content_type, m.title, m.cover_url, m.gradient,
              m.author, m.file_size, m.summary, m.created_at
       FROM materials m
       ${where}
       ORDER BY m.sort_order DESC, m.id DESC LIMIT ? OFFSET ?`,
      [...params, Number(size), offset]
    )
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM materials m ${where}`, params
    )
    res.json({ code: 0, msg: 'success', data: { list: rows, total, page: Number(page), size: Number(size) } })
  } catch (err) {
    res.json({ code: 500, msg: '获取失败', detail: err.message })
  }
}

// 内容详情（含标签 + 收藏状态）
exports.detail = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM materials WHERE id = ? AND status = 1', [req.params.id]
    )
    if (!rows[0]) return res.json({ code: 404, msg: '内容不存在' })

    const [tags] = await db.query(
      `SELECT t.id, t.name, t.type FROM tags t
       JOIN content_tags ct ON ct.tag_id = t.id
       WHERE ct.content_type = 'material' AND ct.content_id = ?`,
      [req.params.id]
    )
    let favorited = false
    if (req.user) {
      const [fav] = await db.query(
        'SELECT id FROM user_favorites WHERE user_id=? AND target_type=? AND target_id=?',
        [req.user.id, 'material', req.params.id]
      )
      favorited = !!fav[0]
    }

    res.json({ code: 0, msg: 'success', data: { ...rows[0], tags, favorited } })
  } catch (err) {
    res.json({ code: 500, msg: '获取失败', detail: err.message })
  }
}

// 下载资料（报告和资料库可下载，需要基础留资）
exports.download = async (req, res) => {
  const userId = req.user.id
  const materialId = req.params.id
  try {
    const [rows] = await db.query(
      'SELECT content_type, file_url FROM materials WHERE id = ? AND status = 1', [materialId]
    )
    if (!rows[0]) return res.json({ code: 404, msg: '内容不存在' })
    if (rows[0].content_type === 'case') {
      return res.json({ code: 400, msg: '案例库不支持下载' })
    }

    const [users] = await db.query('SELECT level FROM users WHERE id = ?', [userId])
    if (!users[0] || users[0].level < 2) {
      return res.json({ code: 403, msg: 'need_basic_info', tip: '请先完善基础信息后下载' })
    }

    await db.query(
      'INSERT INTO user_downloads (user_id, target_type, target_id) VALUES (?, ?, ?)',
      [userId, 'material', materialId]
    )
    await db.query(
      'INSERT INTO user_events (user_id, event_type, target_type, target_id) VALUES (?, ?, ?, ?)',
      [userId, 'download', 'material', materialId]
    ).catch(() => {})

    res.json({ code: 0, msg: 'success', data: { file_url: rows[0].file_url } })
  } catch (err) {
    res.json({ code: 500, msg: '获取失败', detail: err.message })
  }
}
