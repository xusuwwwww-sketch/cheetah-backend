const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/config')
const auth = require('../middleware/auth')
const optAuth = require('../middleware/optAuth')

router.get('/banners', ctrl.getBanners)
router.get('/communities', optAuth, ctrl.getCommunities)
router.post('/communities/join', auth, ctrl.joinCommunity)
router.get('/tags', ctrl.getTags)

module.exports = router
