const Group = require('../models/Group.js');
const jwt = require('jsonwebtoken');

const createGroup = async (req, res) => {
  try {
    const { name, preferences } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const group = new Group({
      name,
      createdBy: userId,
      members: [userId],
      preferences,
    });

    await group.save();

    res.status(201).json({ message: 'Group created successfully', group });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const joinGroup = async (req, res) => {
  try {
    const { code } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const group = await Group.findById(code); // You can replace with `customCode` if used
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (group.members.includes(userId)) {
      return res.status(400).json({ message: 'Already a member' });
    }

    group.members.push(userId);
    await group.save();

    res.status(200).json({ message: 'Joined group successfully', group });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createGroup, joinGroup };



