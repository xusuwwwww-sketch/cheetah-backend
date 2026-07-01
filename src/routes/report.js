const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/report')
const auth = require('../middleware/auth')

router.get('/', ctrl.list)
router.get('/:id', ctrl.detail)
router.post('/:id/view', auth, ctrl.view)

module.exports = router
