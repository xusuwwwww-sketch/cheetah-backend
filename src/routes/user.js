const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/user')
const auth = require('../middleware/auth')

router.post('/login', ctrl.login)
router.post('/update-basic', auth, ctrl.updateBasic)
router.post('/update-deep', auth, ctrl.updateDeep)
router.get('/profile', auth, ctrl.getProfile)
router.get('/favorites', auth, ctrl.getFavorites)
router.post('/favorites/toggle', auth, ctrl.toggleFavorite)
router.get('/downloads', auth, ctrl.getDownloads)
router.get('/signups', auth, ctrl.getSignups)
router.get('/consults', auth, ctrl.getConsults)

module.exports = router
