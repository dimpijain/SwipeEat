const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Swipe = require('../models/Swipe');
const Group = require('../models/Group');
const verifyToken = require('../middleware/verifyToken');

// ✅ IMPROVED ROUTE
// @route   POST /api/swipes/save
// @desc    Save or update a swipe for a restaurant
router.post('/save', verifyToken, async (req, res) => {
    try {
        const { groupId, restaurantId, direction } = req.body;
        const userId = req.user.id;

        if (!groupId || !restaurantId || !direction || !['left', 'right'].includes(direction)) {
            return res.status(400).json({ success: false, message: 'Missing or invalid required fields.' });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found.' });
        }

        if (!group.members.some(m => m.user.toString() === userId)) {
            return res.status(403).json({ success: false, message: 'User is not a member of this group.' });
        }

        // Use findOneAndUpdate with 'upsert' to create or update in one step
        await Swipe.findOneAndUpdate(
            { userId, groupId, restaurantId }, // find a swipe with this combination
            { direction },                     // update its direction
            { upsert: true }                   // if it doesn't exist, create it
        );

        // If it was a right swipe, check for a group match
        if (direction === 'right') {
            const groupMembers = group.members.map(m => m.user.toString());
            const rightSwipes = await Swipe.find({ groupId, restaurantId, direction: 'right' });
            
            const usersWhoSwipedRight = new Set(rightSwipes.map(s => s.userId.toString()));

            const allMembersSwipedRight = groupMembers.every(memberId => usersWhoSwipedRight.has(memberId));

            // If everyone swiped right and it's not already a match, add it
            if (allMembersSwipedRight && !group.matchedRestaurants.includes(restaurantId)) {
                group.matchedRestaurants.push(restaurantId);
                await group.save();
                console.log(`🍽️ Match found for restaurant ${restaurantId} in group ${groupId}`);
            }
        }

        return res.status(200).json({ success: true, message: 'Swipe saved successfully.' });
    } catch (error) {
        console.error('❌ Error saving swipe:', error);
        return res.status(500).json({ success: false, message: 'Failed to save swipe.' });
    }
});


// ✅ NEW ROUTE ADDED
// @route   GET /api/swipes/user/:groupId
// @desc    Get all swipes made by the logged-in user for a specific group
router.get('/user/:groupId', verifyToken, async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        // Find all swipes by this user in this group and only return the restaurantId
        const swipes = await Swipe.find({ userId, groupId }).select('restaurantId');

        return res.status(200).json({ success: true, swipes });

    } catch (error) {
        console.error('❌ Error fetching user swipes for group:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch user swipes.'
        });
    }
});


module.exports = router;