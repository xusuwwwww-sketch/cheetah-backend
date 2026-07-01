const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/activity')
const auth = require('../middleware/auth')

router.get('/types', ctrl.types)
router.get('/', ctrl.list)
router.get('/:id', ctrl.detail)
router.post('/:id/signup', auth, ctrl.signup)
router.post('/:id/cancel', auth, ctrl.cancelSignup)

module.exports = router
