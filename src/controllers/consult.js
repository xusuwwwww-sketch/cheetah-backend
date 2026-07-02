const db = require('../config/db')

// 提交预约咨询
exports.create = async (req, res) => {
  const { name, industry, position, company, budget_info, core_need, pain_point, phone, topic, note, scheduled_at } = req.body
  
  // 必填校验
  if (!name) return res.json({ code: 400, msg: '姓名为必填项' })
  if (!industry) return res.json({ code: 400, msg: '行业为必填项' })
  if (!company) return res.json({ code: 400, msg: '公司名称为必填项' })
  if (!budget_info) return res.json({ code: 400, msg: '推广预算为必填项' })
  if (!core_need) return res.json({ code: 400, msg: '核心需求为必填项' })

  try {
    await db.query(
      `INSERT INTO consults (user_id, name, industry, position, company, budget_info, core_need, pain_point, phone, topic, note, scheduled_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user?.id || null,
        name,
        industry,
        position || null,
        company,
        budget_info,
        core_need,
        pain_point || null,
        phone || null,
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
