// routes/group.js
const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');
const Swipe = require('../models/Swipe');
const verifyToken = require('../middleware/verifyToken');

// Endpoint to fetch user's created and joined groups
router.get('/my', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const createdGroups = await Group.find({ createdBy: userId }).populate('members.user', 'name').lean();
        const joinedGroups = await Group.find({ 'members.user': userId, createdBy: { $ne: userId } }).populate('members.user', 'name').lean();

        return res.status(200).json({ success: true, createdGroups, joinedGroups });
    } catch (error) {
        console.error('Error fetching my groups:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch my groups' });
    }
});

// ✅ NEW ROUTE ADDED
// @route   GET /api/group/:id
// @desc    Get a single group's details by its ID
// @access  Private
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found.' });
        }

        const isMember = group.members.some(m => m.user.toString() === req.user.id);
        if (!isMember) {
            return res.status(403).json({ success: false, message: 'Access denied. You are not a member of this group.' });
        }

        return res.status(200).json({ success: true, group });

    } catch (error) {
        console.error('Error fetching group by ID:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, message: 'Invalid group ID format.' });
        }
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Endpoint to create a new group
router.post('/create', verifyToken, async (req, res) => {
    try {
        // Correctly destructure nested preferences
        const { name, location, radius, cuisinePreferences } = req.body;
        const createdBy = req.user.id;

        let joinCode;
        let isUnique = false;
        while (!isUnique) {
            joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            if (!await Group.findOne({ joinCode })) {
                isUnique = true;
            }
        }

        const newGroup = new Group({
            name,
            createdBy,
            members: [{ user: createdBy }],
            location,
            radius,
            cuisinePreferences,
            joinCode
        });

        await newGroup.save();
        const populatedGroup = await Group.findById(newGroup._id).populate('createdBy', 'name').populate('members.user', 'name');

        return res.status(201).json({ success: true, message: 'Group created successfully!', group: populatedGroup });
    } catch (error) {
        console.error('Error creating group:', error);
        return res.status(500).json({ success: false, message: error.message || 'Failed to create group' });
    }
});

// Endpoint to join a group
router.post('/join', verifyToken, async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user.id;
        const group = await Group.findOne({ joinCode: code });

        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found or invalid code.' });
        }

        if (group.members.some(member => member.user.toString() === userId)) {
            return res.status(409).json({ success: false, message: 'You are already a member of this group.' });
        }

        group.members.push({ user: userId });
        await group.save();
        const populatedGroup = await Group.findById(group._id).populate('members.user', 'name');

        return res.status(200).json({ success: true, message: 'Successfully joined group!', group: populatedGroup });
    } catch (error) {
        console.error('Error joining group:', error);
        return res.status(500).json({ success: false, message: error.message || 'Failed to join group.' });
    }
});

// Endpoint to delete a group
router.delete('/:groupId', verifyToken, async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found.' });
        }

        if (group.createdBy.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'You are not authorized to delete this group.' });
        }

        await Group.deleteOne({ _id: groupId });
        await Swipe.deleteMany({ groupId: groupId });

        return res.status(200).json({ success: true, message: 'Group deleted successfully.' });
    } catch (error) {
        console.error('Error deleting group:', error);
        return res.status(500).json({ success: false, message: error.message || 'Failed to delete group.' });
    }
});

// Endpoint to leave a group
router.post('/:groupId/leave', verifyToken, async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found.' });
        }

        if (group.createdBy.toString() === userId) {
            return res.status(403).json({ success: false, message: 'Creators cannot leave their own group. Please delete the group instead.' });
        }

        const initialMemberCount = group.members.length;
        group.members = group.members.filter(member => member.user.toString() !== userId);

        if (group.members.length === initialMemberCount) {
            return res.status(404).json({ success: false, message: 'You are not a member of this group.' });
        }

        await group.save();
        return res.status(200).json({ success: true, message: 'Successfully left the group.' });
    } catch (error) {
        console.error('Error leaving group:', error);
        return res.status(500).json({ success: false, message: error.message || 'Failed to leave group.' });
    }
});

// ✅ MODIFIED ROUTE
// This now returns an array of string IDs, not populated objects.
router.get('/:groupId/matches', verifyToken, async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await Group.findById(groupId).select('matchedRestaurants');

        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found.' });
        }

        // The frontend now expects 'matchedRestaurantIds'
        return res.status(200).json({
            success: true,
            matchedRestaurantIds: group.matchedRestaurants
        });

    } catch (error) {
        console.error('Error fetching group matches:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch group matches.' });
    }
});

module.exports = router;