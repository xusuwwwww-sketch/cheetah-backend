const db = require('../config/db')

// 资料列表
exports.list = async (req, res) => {
  const { tab, page = 1, size = 20 } = req.query
  const offset = (page - 1) * size
  let where = 'WHERE status = 1'
  const params = []
  if (tab) { where += ' AND tab = ?'; params.push(tab) }
  try {
    const [rows] = await db.query(
      `SELECT id, tab, title, cover_url, gradient, author, file_size, summary, created_at FROM materials ${where} ORDER BY sort_order DESC, id DESC LIMIT ? OFFSET ?`,
      [...params, Number(size), offset]
    )
    res.json({ code: 0, msg: 'success', data: rows })
  } catch (err) {
    res.json({ code: 500, msg: '获取失败', detail: err.message })
  }
}

// 资料详情
exports.detail = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM materials WHERE id = ? AND status = 1', [req.params.id])
    if (!rows[0]) return res.json({ code: 404, msg: '资料不存在' })
    res.json({ code: 0, msg: 'success', data: rows[0] })
  } catch (err) {
    res.json({ code: 500, msg: '获取失败', detail: err.message })
  }
}
