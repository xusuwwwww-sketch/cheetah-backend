const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../public/uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const name = Date.now() + '-' + Math.random().toString(36).substr(2, 8) + ext
    cb(null, name)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/
    if (allowed.test(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('只支持图片格式（jpg/png/gif/webp）'))
    }
  }
})

router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) return res.json({ code: 400, msg: '未收到文件' })
  const host = process.env.SERVER_HOST || req.get('host') || 'localhost:3000'
  const protocol = req.protocol || 'http'
  const url = `${protocol}://${host}/uploads/${req.file.filename}`
  res.json({ code: 0, msg: 'success', data: { url, filename: req.file.filename } })
})

module.exports = router
