const express = require('express')
const router = express.Router()
const userCtrl = require('../controllers/user')
const auth = require('../middleware/auth')

router.post('/login', userCtrl.login)
router.post('/update-basic', auth, userCtrl.updateBasic)
router.post('/update-deep', auth, userCtrl.updateDeep)
router.get('/profile', auth, userCtrl.getProfile)

module.exports = router
