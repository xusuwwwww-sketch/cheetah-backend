const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/material')
const auth = require('../middleware/auth')
const optAuth = require('../middleware/optAuth')

// content_type=report|case|material
router.get('/', ctrl.list)
router.get('/:id', optAuth, ctrl.detail)
router.post('/:id/download', auth, ctrl.download)

module.exports = router
