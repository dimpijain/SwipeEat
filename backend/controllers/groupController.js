import Group from '../models/Group.js';
import User from '../models/User.js'; // optional: to verify user
import jwt from 'jsonwebtoken';

export const createGroup = async (req, res) => {
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
