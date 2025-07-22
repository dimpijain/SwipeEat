const express = require('express');
const { createGroup } = require('../controllers/groupController');

const router = express.Router();

router.post('group/create', createGroup);
const { joinGroup } = require('../controllers/groupController');
router.post('group/join', joinGroup);


module.exports = router; 



