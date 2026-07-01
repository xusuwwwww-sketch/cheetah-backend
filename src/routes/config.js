const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/config')

router.get('/banners', ctrl.getBanners)
router.get('/communities', ctrl.getCommunities)

module.exports = router
