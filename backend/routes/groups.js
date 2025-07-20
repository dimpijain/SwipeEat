// routes/groups.js
const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// Create a group
router.post('/create', async (req, res) => {
  const { name, userId } = req.body;

  try {
    const inviteCode = uuidv4().slice(0, 8); // generate short unique code
    const group = new Group({
      name,
      inviteCode,
      members: [userId],
    });

    await group.save();

    res.status(201).json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join a group using invite code
router.post('/join', async (req, res) => {
  const { inviteCode, userId } = req.body;

  try {
    const group = await Group.findOne({ inviteCode });
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (group.members.includes(userId)) {
      return res.status(400).json({ message: 'User already in group' });
    }

    group.members.push(userId);
    await group.save();

    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get group details
router.get('/:groupId', async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId).populate('members', 'name email');
    if (!group) return res.status(404).json({ message: 'Group not found' });

    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove member from group (optional)
router.post('/:groupId/remove-member', async (req, res) => {
  const { userId } = req.body;
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    group.members = group.members.filter(m => m.toString() !== userId);
    await group.save();

    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
