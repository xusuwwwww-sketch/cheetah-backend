const express = require('express')
const router = express.Router()
const db = require('../config/db')

// 通用分页列表
const listQuery = (table, joins = '', where = '') => async (req, res) => {
  const { page = 1, size = 20, keyword } = req.query
  const offset = (page - 1) * size
  let condition = where ? `WHERE ${where}` : ''
  const params = []
  if (keyword) {
    condition += condition ? ' AND title LIKE ?' : 'WHERE title LIKE ?'
    params.push(`%${keyword}%`)
  }
  try {
    const [list] = await db.query(
      `SELECT * FROM ${table} ${joins} ${condition} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...params, Number(size), offset]
    )
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM ${table} ${joins} ${condition}`, params
    )
    res.json({ code: 0, data: { list, total } })
  } catch (e) { res.json({ code: 500, msg: e.message }) }
}

// ---- 统计 ----
router.get('/stats', async (req, res) => {
  try {
    const [[u]] = await db.query('SELECT COUNT(*) as total FROM users')
    const [[a]] = await db.query('SELECT COUNT(*) as total FROM activities')
    const [[r]] = await db.query('SELECT COUNT(*) as total FROM reports')
    const [[m]] = await db.query('SELECT COUNT(*) as total FROM materials')
    const [[c]] = await db.query('SELECT COUNT(*) as total FROM consults WHERE status = 0')
    const [[s]] = await db.query('SELECT COUNT(*) as total FROM activity_signups WHERE status = 1')
    res.json({ code: 0, data: { users: u.total, activities: a.total, reports: r.total, materials: m.total, pending_consults: c.total, signups: s.total } })
  } catch (e) { res.json({ code: 500, msg: e.message }) }
})

// ---- 用户 ----
router.get('/users', async (req, res) => {
  const { page = 1, size = 20, level } = req.query
  const offset = (page - 1) * size
  let where = ''
  const params = []
  if (level) { where = 'WHERE u.level = ?'; params.push(Number(level)) }
  try {
    const [list] = await db.query(
      `SELECT u.id, u.openid, u.nickname, u.avatar, u.level, u.last_login_at, u.created_at,
              p.name, p.company, p.industry, p.email, p.phone, p.budget_min, p.budget_max, p.core_need
       FROM users u LEFT JOIN user_profiles p ON p.user_id = u.id
       ${where} ORDER BY u.id DESC LIMIT ? OFFSET ?`,
      [...params, Number(size), offset]
    )
    const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM users u ${where}`, params)
    res.json({ code: 0, data: { list, total } })
  } catch (e) { res.json({ code: 500, msg: e.message }) }
})

// ---- 活动 CRUD ----
router.get('/activities', async (req, res) => {
  const { page = 1, size = 20, keyword } = req.query
  const offset = (page - 1) * size
  let where = keyword ? 'WHERE a.title LIKE ?' : ''
  const params = keyword ? [`%${keyword}%`] : []
  try {
    const [list] = await db.query(
      `SELECT a.*,
        (SELECT COUNT(*) FROM activity_signups s WHERE s.activity_id=a.id AND s.status=1) AS signup_count,
        (SELECT COUNT(*) FROM user_favorites f WHERE f.target_type='activity' AND f.target_id=a.id) AS fav_count
       FROM activities a ${where} ORDER BY a.id DESC LIMIT ? OFFSET ?`,
      [...params, Number(size), offset]
    )
    const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM activities a ${where}`, params)
    res.json({ code: 0, data: { list, total } })
  } catch(e) { res.json({ code: 500, msg: e.message }) }
})
router.post('/activities', async (req, res) => {
  const { title, type_slug, start_time, end_time, signup_deadline, location, organizer, quota, description, gradient, is_online } = req.body
  if (!title) return res.json({ code: 400, msg: '标题必填' })
  try {
    const fixTime = t => t ? t.replace('T', ' ').substring(0, 19) : null
    await db.query(
      `INSERT INTO activities (title, type_slug, start_time, end_time, signup_deadline, location, organizer, quota, description, gradient, is_online, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [title, type_slug || 'live', fixTime(start_time), fixTime(end_time), fixTime(signup_deadline), location || '', organizer || '猎豹出海', quota || 0, description || '', gradient || 'linear-gradient(135deg, #ff6b35, #ff9a5c)', is_online ?? 1]
    )
    res.json({ code: 0, msg: '创建成功' })
  } catch (e) { res.json({ code: 500, msg: e.message }) }
})
router.put('/activities/:id', async (req, res) => {
  const { title, type_slug, start_time, end_time, signup_deadline, location, organizer, quota, description, gradient, cover_url } = req.body
  try {
    const fixTime = t => t ? t.replace('T', ' ').substring(0, 19) : null
    await db.query(
      `UPDATE activities SET title=?, type_slug=?, start_time=?, end_time=?, signup_deadline=?,
       location=?, organizer=?, quota=?, description=?, gradient=?, cover_url=? WHERE id=?`,
      [title, type_slug, fixTime(start_time), fixTime(end_time), fixTime(signup_deadline), location, organizer, quota || 0, description, gradient, cover_url||null, req.params.id]
    )
    res.json({ code: 0, msg: '更新成功' })
  } catch (e) { res.json({ code: 500, msg: e.message }) }
})
router.patch('/activities/:id/status', async (req, res) => {
  await db.query('UPDATE activities SET status=? WHERE id=?', [req.body.status, req.params.id])
  res.json({ code: 0, msg: '操作成功' })
})

// ---- 报告 CRUD ----
router.get('/reports', async (req, res) => {
  const { page = 1, size = 20, keyword } = req.query
  const offset = (page - 1) * size
  let where = keyword ? 'WHERE r.title LIKE ?' : ''
  const params = keyword ? [`%${keyword}%`] : []
  try {
    const [list] = await db.query(
      `SELECT r.*,
        (SELECT COUNT(*) FROM user_downloads d WHERE d.target_type='report' AND d.target_id=r.id) AS download_count
       FROM reports r ${where} ORDER BY r.id DESC LIMIT ? OFFSET ?`,
      [...params, Number(size), offset]
    )
    const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM reports r ${where}`, params)
    res.json({ code: 0, data: { list, total } })
  } catch(e) { res.json({ code: 500, msg: e.message }) }
})
router.post('/reports', async (req, res) => {
  const { title, source, industry, region, year, is_free, price, summary, content, file_url, gradient } = req.body
  if (!title) return res.json({ code: 400, msg: '标题必填' })
  try {
    await db.query(
      `INSERT INTO reports (title, source, industry, region, year, is_free, price, summary, content, file_url, gradient, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [title, source || '', industry || '', region || '', year || '', is_free ?? 1, price || 0, summary || '', content || '', file_url || '', gradient || '']
    )
    res.json({ code: 0, msg: '创建成功' })
  } catch (e) { res.json({ code: 500, msg: e.message }) }
})
router.put('/reports/:id', async (req, res) => {
  const { title, source, industry, region, year, is_free, price, summary, content, file_url, gradient } = req.body
  try {
    await db.query(
      `UPDATE reports SET title=?, source=?, industry=?, region=?, year=?, is_free=?, price=?, summary=?, content=?, file_url=?, gradient=? WHERE id=?`,
      [title, source, industry, region, year, is_free, price, summary, content, file_url, gradient, req.params.id]
    )
    res.json({ code: 0, msg: '更新成功' })
  } catch (e) { res.json({ code: 500, msg: e.message }) }
})
router.patch('/reports/:id/status', async (req, res) => {
  await db.query('UPDATE reports SET status=? WHERE id=?', [req.body.status, req.params.id])
  res.json({ code: 0, msg: '操作成功' })
})

// ---- 资料 CRUD ----
router.get('/materials', async (req, res) => {
  const { content_type, page = 1, size = 20 } = req.query
  const offset = (page - 1) * size
  let where = ''
  const params = []
  if (content_type) { where = 'WHERE m.content_type = ?'; params.push(content_type) }
  try {
    const [list] = await db.query(
      `SELECT m.*,
        (SELECT COUNT(*) FROM user_events e WHERE e.target_type='material' AND e.target_id=m.id AND e.event_type='view') AS view_count,
        (SELECT COUNT(*) FROM user_downloads d WHERE d.target_type='material' AND d.target_id=m.id) AS download_count
       FROM materials m ${where} ORDER BY m.id DESC LIMIT ? OFFSET ?`,
      [...params, Number(size), offset]
    )
    const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM materials m ${where}`, params)
    res.json({ code: 0, data: { list, total } })
  } catch(e) { res.json({ code: 500, msg: e.message }) }
})
router.post('/materials', async (req, res) => {
  const { content_type, title, author, file_size, file_url, cover_url, summary, content, gradient, sort_order } = req.body
  if (!title) return res.json({ code: 400, msg: '标题必填' })
  try {
    await db.query(
      `INSERT INTO materials (content_type, title, author, file_size, file_url, cover_url, summary, content, gradient, sort_order, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [content_type || 'material', title, author || '', file_size || '', file_url || '', cover_url || null, summary || '', content || '', gradient || '', sort_order || 0]
    )
    res.json({ code: 0, msg: '创建成功' })
  } catch (e) { res.json({ code: 500, msg: e.message }) }
})
router.put('/materials/:id', async (req, res) => {
  const { content_type, title, author, file_size, file_url, cover_url, summary, content, gradient, sort_order } = req.body
  try {
    await db.query(
      `UPDATE materials SET content_type=?, title=?, author=?, file_size=?, file_url=?, cover_url=?, summary=?, content=?, gradient=?, sort_order=? WHERE id=?`,
      [content_type || 'material', title, author || '', file_size || '', file_url || '', cover_url || null, summary || '', content || '', gradient || '', sort_order || 0, req.params.id]
    )
    res.json({ code: 0, msg: '更新成功' })
  } catch (e) { res.json({ code: 500, msg: e.message }) }
})
router.patch('/materials/:id/status', async (req, res) => {
  await db.query('UPDATE materials SET status=? WHERE id=?', [req.body.status, req.params.id])
  res.json({ code: 0, msg: '操作成功' })
})

// ---- 咨询管理 ----
router.get('/consults', async (req, res) => {
  const { page = 1, size = 20, status } = req.query
  const offset = (page - 1) * size
  let where = ''
  const params = []
  if (status !== undefined && status !== '') { where = 'WHERE status = ?'; params.push(Number(status)) }
  try {
    const [list] = await db.query(`SELECT * FROM consults ${where} ORDER BY id DESC LIMIT ? OFFSET ?`, [...params, Number(size), offset])
    const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM consults ${where}`, params)
    res.json({ code: 0, data: { list, total } })
  } catch(e) { res.json({ code: 500, msg: e.message }) }
})
router.patch('/consults/:id', async (req, res) => {
  const { status, advisor_id, follow_up_note } = req.body
  try {
    await db.query(
      'UPDATE consults SET status=?, advisor_id=?, follow_up_note=?, updated_at=NOW() WHERE id=?',
      [status, advisor_id || null, follow_up_note || null, req.params.id]
    )
    res.json({ code: 0, msg: '更新成功' })
  } catch (e) { res.json({ code: 500, msg: e.message }) }
})

// ---- 轮播图 CRUD ----
router.get('/banners', listQuery('banners'))
router.post('/banners', async (req, res) => {
  const { tag, title, description, gradient, cover_url, link_type, link_id, link_url } = req.body
  try {
    await db.query(
      'INSERT INTO banners (tag, title, description, gradient, cover_url, link_type, link_id, link_url, status) VALUES (?,?,?,?,?,?,?,?,1)',
      [tag || '', title, description || '', gradient || '', cover_url || null, link_type || 'none', link_id || null, link_url || '']
    )
    res.json({ code: 0, msg: '创建成功' })
  } catch (e) { res.json({ code: 500, msg: e.message }) }
})
router.patch('/banners/:id/status', async (req, res) => {
  await db.query('UPDATE banners SET status=? WHERE id=?', [req.body.status, req.params.id])
  res.json({ code: 0, msg: '操作成功' })
})
router.put('/banners/:id', async (req, res) => {
  const { tag, title, description, gradient, cover_url, link_type, link_id, link_url, sort_order } = req.body
  try {
    await db.query(
      'UPDATE banners SET tag=?, title=?, description=?, gradient=?, cover_url=?, link_type=?, link_id=?, link_url=?, sort_order=? WHERE id=?',
      [tag||'', title, description||'', gradient||'', cover_url||null, link_type||'none', link_id||null, link_url||'', sort_order||0, req.params.id]
    )
    res.json({ code: 0, msg: '更新成功' })
  } catch(e) { res.json({ code: 500, msg: e.message }) }
})

// ---- 标签管理 ----
router.get('/tags', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM tags ORDER BY type, sort_order ASC')
  res.json({ code: 0, data: rows })
})
router.post('/tags', async (req, res) => {
  const { name, type } = req.body
  if (!name) return res.json({ code: 400, msg: '标签名必填' })
  try {
    await db.query('INSERT INTO tags (name, type) VALUES (?, ?)', [name, type || 'topic'])
    res.json({ code: 0, msg: '创建成功' })
  } catch (e) { res.json({ code: 500, msg: e.message }) }
})

// ---- 社群申请管理 ----
router.get('/community-joins', async (req, res) => {
  const [rows] = await db.query(
    `SELECT cj.*, u.nickname, p.name, p.phone, c.title AS community_title
     FROM community_joins cj
     JOIN users u ON u.id = cj.user_id
     LEFT JOIN user_profiles p ON p.user_id = cj.user_id
     JOIN communities c ON c.id = cj.community_id
     ORDER BY cj.id DESC LIMIT 100`
  )
  res.json({ code: 0, data: rows })
})
router.patch('/community-joins/:id', async (req, res) => {
  await db.query('UPDATE community_joins SET status=?, updated_at=NOW() WHERE id=?', [req.body.status, req.params.id])
  res.json({ code: 0, msg: '操作成功' })
})

module.exports = router

// ---- 弹窗管理 ----
router.get('/popups', async (req, res) => {
  try {
    const [list] = await db.query('SELECT * FROM popups ORDER BY sort_order DESC, id DESC')
    res.json({ code: 0, data: list })
  } catch(e) { res.json({ code: 500, msg: e.message }) }
})
router.post('/popups', async (req, res) => {
  const { title, cover_url, gradient, description, btn_text, link_type, link_id, link_url, show_once, sort_order, start_time, end_time } = req.body
  if (!title) return res.json({ code: 400, msg: '标题必填' })
  try {
    await db.query(
      'INSERT INTO popups (title, cover_url, gradient, description, btn_text, link_type, link_id, link_url, show_once, sort_order, start_time, end_time, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,1)',
      [title, cover_url||null, gradient||'', description||'', btn_text||'立即查看', link_type||'none', link_id||null, link_url||'', show_once??1, sort_order||0, start_time||null, end_time||null]
    )
    res.json({ code: 0, msg: '创建成功' })
  } catch(e) { res.json({ code: 500, msg: e.message }) }
})
router.put('/popups/:id', async (req, res) => {
  const { title, cover_url, gradient, description, btn_text, link_type, link_id, link_url, show_once, sort_order, start_time, end_time } = req.body
  try {
    await db.query(
      'UPDATE popups SET title=?, cover_url=?, gradient=?, description=?, btn_text=?, link_type=?, link_id=?, link_url=?, show_once=?, sort_order=?, start_time=?, end_time=? WHERE id=?',
      [title, cover_url||null, gradient||'', description||'', btn_text||'立即查看', link_type||'none', link_id||null, link_url||'', show_once??1, sort_order||0, start_time||null, end_time||null, req.params.id]
    )
    res.json({ code: 0, msg: '更新成功' })
  } catch(e) { res.json({ code: 500, msg: e.message }) }
})
router.patch('/popups/:id/status', async (req, res) => {
  await db.query('UPDATE popups SET status=? WHERE id=?', [req.body.status, req.params.id])
  res.json({ code: 0, msg: '操作成功' })
})

// ---- 社群管理 ----
router.get('/communities', async (req, res) => {
  const [list] = await db.query('SELECT * FROM communities ORDER BY sort_order ASC, id ASC')
  res.json({ code: 0, data: list })
})
router.post('/communities', async (req, res) => {
  const { title, description, qr_url, icon_color, sort_order } = req.body
  if (!title) return res.json({ code: 400, msg: '名称必填' })
  try {
    await db.query('INSERT INTO communities (title, description, qr_url, icon_color, sort_order, status) VALUES (?,?,?,?,?,1)',
      [title, description||'', qr_url||null, icon_color||'#fff0ea', sort_order||0])
    res.json({ code: 0, msg: '创建成功' })
  } catch(e) { res.json({ code: 500, msg: e.message }) }
})
router.put('/communities/:id', async (req, res) => {
  const { title, description, qr_url, icon_color, sort_order } = req.body
  try {
    await db.query('UPDATE communities SET title=?, description=?, qr_url=?, icon_color=?, sort_order=? WHERE id=?',
      [title, description||'', qr_url||null, icon_color||'#fff0ea', sort_order||0, req.params.id])
    res.json({ code: 0, msg: '更新成功' })
  } catch(e) { res.json({ code: 500, msg: e.message }) }
})
router.patch('/communities/:id/status', async (req, res) => {
  await db.query('UPDATE communities SET status=? WHERE id=?', [req.body.status, req.params.id])
  res.json({ code: 0, msg: '操作成功' })
})
router.delete('/communities/:id', async (req, res) => {
  await db.query('DELETE FROM communities WHERE id=?', [req.params.id])
  res.json({ code: 0, msg: '删除成功' })
})

// ---- 内容删除 ----
router.delete('/materials/:id', async (req, res) => {
  await db.query('DELETE FROM materials WHERE id=?', [req.params.id])
  res.json({ code: 0, msg: '删除成功' })
})
router.delete('/reports/:id', async (req, res) => {
  await db.query('DELETE FROM reports WHERE id=?', [req.params.id])
  res.json({ code: 0, msg: '删除成功' })
})
router.delete('/activities/:id', async (req, res) => {
  await db.query('DELETE FROM activities WHERE id=?', [req.params.id])
  res.json({ code: 0, msg: '删除成功' })
})
