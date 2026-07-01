const db = require('../config/db')

// 轮播图
exports.getBanners = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM banners WHERE status = 1 ORDER BY sort_order ASC')
    res.json({ code: 0, msg: 'success', data: rows })
  } catch (err) {
    res.json({ code: 500, msg: '获取失败' })
  }
}

// 社群列表
exports.getCommunities = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM communities WHERE status = 1 ORDER BY sort_order ASC')
    res.json({ code: 0, msg: 'success', data: rows })
  } catch (err) {
    res.json({ code: 500, msg: '获取失败' })
  }
}
