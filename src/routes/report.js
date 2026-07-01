const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/report')
const auth = require('../middleware/auth')
const optAuth = require('../middleware/optAuth')

router.get('/', ctrl.list)
router.get('/:id', optAuth, ctrl.detail)
router.post('/:id/view', auth, ctrl.view)

module.exports = router
