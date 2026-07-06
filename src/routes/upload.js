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
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedMime = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]
    if (allowedMime.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('不支持的文件格式，支持：图片/PDF/Word/PPT/Excel'))
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
