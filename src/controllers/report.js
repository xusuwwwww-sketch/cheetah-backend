const db = require('../config/db')

// 报告列表
exports.list = async (req, res) => {
  const { industry, region, year, page = 1, size = 20 } = req.query
  const offset = (page - 1) * size
  let where = 'WHERE status = 1'
  const params = []
  if (industry) { where += ' AND industry = ?'; params.push(industry) }
  if (region) { where += ' AND region = ?'; params.push(region) }
  if (year) { where += ' AND year = ?'; params.push(year) }
  try {
    const [rows] = await db.query(
      `SELECT id, title, cover_url, gradient, source, industry, region, year, is_free, price, summary, download_count, created_at FROM reports ${where} ORDER BY sort_order DESC, id DESC LIMIT ? OFFSET ?`,
      [...params, Number(size), offset]
    )
    const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM reports ${where}`, params)
    res.json({ code: 0, msg: 'success', data: { list: rows, total } })
  } catch (err) {
    res.json({ code: 500, msg: '获取失败', detail: err.message })
  }
}

// 报告详情
exports.detail = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM reports WHERE id = ? AND status = 1', [req.params.id])
    if (!rows[0]) return res.json({ code: 404, msg: '报告不存在' })
    res.json({ code: 0, msg: 'success', data: rows[0] })
  } catch (err) {
    res.json({ code: 500, msg: '获取失败', detail: err.message })
  }
}

// 查看/下载报告（需要基础留资）
exports.view = async (req, res) => {
  const userId = req.user.id
  try {
    const [users] = await db.query('SELECT level FROM users WHERE id = ?', [userId])
    if (!users[0] || users[0].level < 2) {
      return res.json({ code: 403, msg: 'need_basic_info', tip: '请先完善基础信息后下载' })
    }
    const [rows] = await db.query('SELECT file_url FROM reports WHERE id = ? AND status = 1', [req.params.id])
    if (!rows[0]) return res.json({ code: 404, msg: '报告不存在' })
    await db.query('UPDATE reports SET download_count = download_count + 1 WHERE id = ?', [req.params.id])
    res.json({ code: 0, msg: 'success', data: { file_url: rows[0].file_url } })
  } catch (err) {
    res.json({ code: 500, msg: '获取失败', detail: err.message })
  }
}
