const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/consult')
const optAuth = require('../middleware/optAuth')

router.post('/', optAuth, ctrl.create)

module.exports = router
