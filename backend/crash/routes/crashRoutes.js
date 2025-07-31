const express = require('express');
const router = express.Router();
const {
  startCrash,
  cashOutCrash,
  getCrashState
} = require('../controllers/crashController');

router.post('/start', startCrash);
router.post('/cashout', cashOutCrash);
router.get('/state', getCrashState);

module.exports = router;
