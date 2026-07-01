const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/consult')
const auth = require('../middleware/auth')

router.post('/', auth, ctrl.create)

module.exports = router
