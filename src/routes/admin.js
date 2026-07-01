const express = require('express')
const router = express.Router()
const db = require('../config/db')

// 通用列表查询
const listQuery = (table, extra = '') => async (req, res) => {
  const { page = 1, size = 20 } = req.query
  const offset = (page - 1) * size
  try {
    const [list] = await db.query(`SELECT * FROM ${table} ${extra} ORDER BY id DESC LIMIT ? OFFSET ?`, [Number(size), offset])
    const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM ${table}`)
    res.json({ code: 0, data: { list, total } })
  } catch(e) { res.json({ code: 500, msg: e.message }) }
}

// 统计
router.get('/stats/activities', async (req, res) => {
  const [[r]] = await db.query('SELECT COUNT(*) as total FROM activities')
  res.json({ code: 0, data: r })
})
router.get('/stats/reports', async (req, res) => {
  const [[r]] = await db.query('SELECT COUNT(*) as total FROM reports')
  res.json({ code: 0, data: r })
})
router.get('/stats/users', async (req, res) => {
  const [[r]] = await db.query('SELECT COUNT(*) as total FROM users')
  res.json({ code: 0, data: r })
})

// 活动 CRUD
router.get('/activities', listQuery('activities'))
router.post('/activities', async (req, res) => {
  const { title, type, start_time, end_time, location, organizer, quota, description, gradient, icon, is_online } = req.body
  try {
    await db.query('INSERT INTO activities (title,type,start_time,end_time,location,organizer,quota,description,gradient,icon,is_online,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,1)',
      [title, type||'live', start_time||null, end_time||null, location||'', organizer||'猎豹出海', quota||0, description||'', gradient||'linear-gradient(135deg, #ff6b35, #ff9a5c)', icon||'LIVE', is_online||1])
    res.json({ code: 0, msg: '创建成功' })
  } catch(e) { res.json({ code: 500, msg: e.message }) }
})
router.put('/activities/:id', async (req, res) => {
  const { title, type, start_time, location, organizer, quota, description, gradient, icon } = req.body
  try {
    await db.query('UPDATE activities SET title=?,type=?,start_time=?,location=?,organizer=?,quota=?,description=?,gradient=?,icon=? WHERE id=?',
      [title, type, start_time||null, location, organizer, quota||0, description, gradient, icon, req.params.id])
    res.json({ code: 0, msg: '更新成功' })
  } catch(e) { res.json({ code: 500, msg: e.message }) }
})
router.patch('/activities/:id/status', async (req, res) => {
  await db.query('UPDATE activities SET status=? WHERE id=?', [req.body.status, req.params.id])
  res.json({ code: 0, msg: '操作成功' })
})

// 报告列表
router.get('/reports', listQuery('reports'))
// 资料列表
router.get('/materials', listQuery('materials'))
// 咨询列表
router.get('/consults', listQuery('consults'))
// 轮播图列表
router.get('/banners', listQuery('banners'))
// 用户列表
router.get('/users', listQuery('users'))

module.exports = router
