const db = require('../config/db')

// 提交预约咨询
exports.create = async (req, res) => {
  const { name, phone, company, topic, note } = req.body
  if (!name || !phone) return res.json({ code: 400, msg: '姓名和电话为必填项' })
  try {
    await db.query(
      'INSERT INTO consults (user_id, name, phone, company, topic, note) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user?.id || null, name, phone, company || null, topic || null, note || null]
    )
    res.json({ code: 0, msg: '预约成功，顾问将在24小时内联系您' })
  } catch (err) {
    res.json({ code: 500, msg: '提交失败', detail: err.message })
  }
}
