const express = require('express')
const router = express.Router()
const indexCtrl = require('../controllers/indexCtrl.js')

router.get('/:assignmentid', indexCtrl.getInit)
router.get('/get-state', indexCtrl.getState)
router.post('/check-answer', indexCtrl.check)

module.exports = router