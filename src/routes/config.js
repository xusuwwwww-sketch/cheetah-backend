const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/config')
const auth = require('../middleware/auth')
const optAuth = require('../middleware/optAuth')

router.get('/banners', ctrl.getBanners)
router.get('/communities', optAuth, ctrl.getCommunities)
router.post('/communities/join', auth, ctrl.joinCommunity)
router.get('/tags', ctrl.getTags)

module.exports = router

// 弹窗（前端调用）
router.get('/popup', async (req, res) => {
  const db = require('../config/db')
  try {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
    const [rows] = await db.query(
      `SELECT * FROM popups WHERE status = 1
       AND (start_time IS NULL OR start_time <= ?)
       AND (end_time IS NULL OR end_time >= ?)
       ORDER BY sort_order DESC, id DESC LIMIT 1`,
      [now, now]
    )
    if (rows[0]) {
      res.json({ code: 0, data: rows[0] })
    } else {
      res.json({ code: 0, data: null })
    }
  } catch(e) { res.json({ code: 500, msg: e.message }) }
})
