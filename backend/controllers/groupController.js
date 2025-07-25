const Group = require('../models/Group');
const jwt = require('jsonwebtoken');

// Create new group
const createGroup = async (req, res) => {
  try {
    const { name, preferences } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Generate unique join code
    let joinCode;
    let isUnique = false;
    while (!isUnique) {
      joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existingGroup = await Group.findOne({ joinCode });
      isUnique = !existingGroup;
    }

    const newGroup = new Group({
      name,
      createdBy: userId,
      members: [{ user: userId }],
      preferences,
      joinCode
    });

    const savedGroup = await newGroup.save();

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      group: savedGroup,
      joinCode // Send back the join code
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create group',
      error: error.message
    });
  }
};

// Join existing group
const joinGroup = async (req, res) => {
  try {
    const { code } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const group = await Group.findOne({ joinCode: code.toUpperCase() });
    
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Check if user is already a member
    const isMember = group.members.some(member => member.user.equals(userId));
    if (isMember) {
      return res.status(400).json({ success: false, message: 'Already a member' });
    }

    group.members.push({ user: userId });
    await group.save();

    res.status(200).json({
      success: true,
      message: 'Joined group successfully',
      group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to join group',
      error: error.message
    });
  }
};

const getUserGroups = async (req, res) => {
  try {
    // 1. Token verification
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    // 2. JWT verification with error handling
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }

    const userId = decoded.id;

    // 3. Database query with optimization
    const groups = await Group.find({
      $or: [
        { createdBy: userId },
        { 'members.user': userId }
      ]
    })
    .populate('createdBy', 'name')
    .populate('members.user', 'name')
    .lean();

    // 4. Format groups with safer ID comparison
    const formattedGroups = groups.map(group => ({
      ...group,
      isOwner: group.createdBy._id.toString() === userId.toString()
    }));

    // 5. Send response
    res.status(200).json({
      success: true,
      createdGroups: formattedGroups.filter(g => g.isOwner),
      joinedGroups: formattedGroups.filter(g => !g.isOwner),
      count: {
        created: formattedGroups.filter(g => g.isOwner).length,
        joined: formattedGroups.filter(g => !g.isOwner).length
      }
    });

  } catch (error) {
    console.error('[GetUserGroups Error]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch groups',
      error: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Internal server error'
    });
  }
};

// Leave group
const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Owner cannot leave their own group
    if (group.createdBy.equals(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Group owner cannot leave. Please delete the group instead.' 
      });
    }

    // Remove user from members
    group.members = group.members.filter(member => !member.user.equals(userId));
    await group.save();

    res.status(200).json({
      success: true,
      message: 'Left group successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to leave group',
      error: error.message
    });
  }
};

// controllers/groupController.js
const getRestaurants = async (req, res) => {
  try {
    // In a real app, this would call Yelp/Google Places API
    // and filter based on group preferences
    const group = await Group.findById(req.params.groupId);
    
    // Mock implementation - replace with real API call
    //const mockRestaurants = [...]; // Same as frontend mock data
    
    res.status(200).json(mockRestaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const saveSwipe = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { restaurantId, action } = req.body;
    const userId = req.user.id; // From JWT
    
    await Group.findByIdAndUpdate(groupId, {
      $push: {
        swipes: {
          user: userId,
          restaurant: restaurantId,
          action, // 'like' or 'dislike'
          timestamp: new Date()
        }
      }
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createGroup,
  joinGroup,
  getUserGroups,
  leaveGroup,
  getRestaurants,
  saveSwipe
};