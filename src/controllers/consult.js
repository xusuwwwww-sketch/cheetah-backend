const db = require('../config/db')

// 提交预约咨询
exports.create = async (req, res) => {
  const { name, phone, company, topic, note, scheduled_at } = req.body
  if (!name || !phone) return res.json({ code: 400, msg: '姓名和手机号为必填项' })
  // 手机号简单校验
  if (!/^1[3-9]\d{9}$/.test(phone) && !/^\+?\d{7,15}$/.test(phone)) {
    return res.json({ code: 400, msg: '手机号格式不正确' })
  }
  try {
    await db.query(
      `INSERT INTO consults (user_id, name, phone, company, topic, note, scheduled_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user?.id || null,
        name,
        phone,
        company || null,
        topic || null,
        note || null,
        scheduled_at || null
      ]
    )
    // 行为日志
    if (req.user?.id) {
      await db.query(
        'INSERT INTO user_events (user_id, event_type, target_type) VALUES (?, ?, ?)',
        [req.user.id, 'consult', 'consult']
      ).catch(() => {})
    }
    res.json({ code: 0, msg: '预约成功，顾问将在24小时内联系您' })
  } catch (err) {
    res.json({ code: 500, msg: '提交失败', detail: err.message })
  }
}
