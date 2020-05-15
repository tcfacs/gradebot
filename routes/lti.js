const router = require('express').Router()
const ltiCtrl = require('../controllers/ltiCtrl.js')

router.post('/', ltiCtrl.post)
router.post('/checkanswer', ltiCtrl.check)
router.post('/grade/:sessionId', ltiCtrl.submit)
router.get('/getstate/:sessionId', ltiCtrl.getState)
router.get('/:challengeId/:sessionId', ltiCtrl.get)

module.exports = router