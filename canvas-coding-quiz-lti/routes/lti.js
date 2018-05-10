const express = require('express'),
      router = express.Router(),
      ltiCtrl = require('../controllers/ltiCtrl.js');

router.post('/', ltiCtrl.post)
router.post('/grade', ltiCtrl.submit)
router.get('/:challengeId/:syntax/:htmlId', ltiCtrl.get)
// router.get('/', ltiCtrl.get)



module.exports = router







