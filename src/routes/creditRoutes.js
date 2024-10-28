const express = require('express');
const router = express.Router();
const creditController = require('../controllers/creditController');
const creditValidator = require('../middlewares/validators/creditValidator');
//const authMiddleware = require('../middlewares/authMiddleware');

router.post('/achat_credit',
    //authMiddleware,
    creditValidator,
    creditController.achatCredit
  );

module.exports = router;