const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/activity')
const auth = require('../middleware/auth')

router.get('/', ctrl.list)
router.get('/:id', ctrl.detail)
router.post('/:id/signup', auth, ctrl.signup)

module.exports = router
