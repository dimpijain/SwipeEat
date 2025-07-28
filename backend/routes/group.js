// routes/groups.js (or whatever you've named it, e.g., groupRoutes.js)
const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User'); // Assuming you have a User model
const verifyToken = require('../middleware/verifyToken');
const Swipe = require('../models/Swipe'); // Add this

// Endpoint to fetch user's created and joined groups
router.get('/my', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        // Populate members.user to get user names for the frontend modal
        const createdGroups = await Group.find({ createdBy: userId }).populate('members.user', 'name').lean();
        // For joined groups, exclude those created by the user to avoid duplication
        const joinedGroups = await Group.find({ 'members.user': userId, createdBy: { $ne: userId } }).populate('members.user', 'name').lean();

        return res.status(200).json({ success: true, createdGroups, joinedGroups });
    } catch (error) {
        console.error('Error fetching my groups:', error);
        return res.status(500).json({ message: 'Failed to fetch my groups' });
    }
});

// Endpoint to create a new group
router.post('/create', verifyToken, async (req, res) => {
    try {
        const { name, preferences } = req.body;
        const createdBy = req.user.id;

        // Generate a unique 6-character join code
        let joinCode;
        let isUnique = false;
        while (!isUnique) {
            joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            const existingGroup = await Group.findOne({ joinCode });
            if (!existingGroup) {
                isUnique = true;
            }
        }

        const newGroup = new Group({
            name,
            createdBy,
            members: [{ user: createdBy }], // Creator is automatically a member
            preferences,
            joinCode
        });

        await newGroup.save();

        // Populate the createdBy and members for the response if needed by frontend
        const populatedGroup = await Group.findById(newGroup._id).populate('createdBy', 'name').populate('members.user', 'name');

        return res.status(201).json({ success: true, message: 'Group created successfully!', group: populatedGroup });
    } catch (error) {
        console.error('Error creating group:', error);
        return res.status(500).json({ message: error.message || 'Failed to create group' });
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

        // Check if user is already a member
        const isMember = group.members.some(member => member.user.toString() === userId);
        if (isMember) {
            return res.status(409).json({ success: false, message: 'You are already a member of this group.' });
        }

        group.members.push({ user: userId, joinedAt: new Date() });
        await group.save();

        // Populate members for the response if needed by frontend
        const populatedGroup = await Group.findById(group._id).populate('members.user', 'name');

        return res.status(200).json({ success: true, message: 'Successfully joined group!', group: populatedGroup });
    } catch (error) {
        console.error('Error joining group:', error);
        return res.status(500).json({ message: error.message || 'Failed to join group.' });
    }
});

// Endpoint to delete a group (only by creator)
router.delete('/:groupId', verifyToken, async (req, res) => { // Matches DELETE /api/groups/:groupId
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

        await group.deleteOne(); // Use deleteOne()
        // Also delete all associated swipes for this group
        await Swipe.deleteMany({ groupId: groupId });

        return res.status(200).json({ success: true, message: 'Group deleted successfully.' });
    } catch (error) {
        console.error('Error deleting group:', error);
        return res.status(500).json({ message: error.message || 'Failed to delete group.' });
    }
});

// Endpoint to leave a group
router.post('/:groupId/leave', verifyToken, async (req, res) => { // Matches POST /api/groups/:groupId/leave
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found.' });
        }

        // Check if the user is the creator. Creators cannot "leave" their own group, they must "delete" it.
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
        return res.status(500).json({ message: error.message || 'Failed to leave group.' });
    }
});

router.get('/:groupId/matches', verifyToken, async (req, res) => {
    try {
        const { groupId } = req.params;

        // Find the group by its ID and populate the matchedRestaurants field.
        // The .populate() method is crucial here. It replaces the restaurant IDs
        // in the matchedRestaurants array with the full restaurant documents.
        // NOTE: This assumes your Group model references a 'Restaurant' model.
        // If your restaurant collection is named differently, change 'Restaurant'.
        const group = await Group.findById(groupId).populate('matchedRestaurants');

        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found.' });
        }

        // The frontend expects an object with a 'matchedRestaurants' key
        return res.status(200).json({ 
            success: true, 
            matchedRestaurants: group.matchedRestaurants 
        });

    } catch (error) {
        console.error('Error fetching group matches:', error);
        return res.status(500).json({ message: 'Failed to fetch group matches.' });
    }
});

module.exports = router;