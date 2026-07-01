const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/material')

router.get('/', ctrl.list)
router.get('/:id', ctrl.detail)

module.exports = router
