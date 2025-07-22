const express = require('express');
const { createGroup } = require('../controllers/groupController');

const router = express.Router();

router.post('/create', createGroup);
const { joinGroup } = require('../controllers/groupController');
router.post('/join', joinGroup);


module.exports = router; 



