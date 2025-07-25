const express = require('express');
const {
  createGroup,
  joinGroup,
  getUserGroups,
  leaveGroup,
 
} = require('../controllers/groupController');

const router = express.Router();

// Group management routes
router.post('/create', createGroup);
router.post('/join', joinGroup);
router.get('/my', getUserGroups);
router.post('/:groupId/leave', leaveGroup);



module.exports = router;



