const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Swipe = require('../models/Swipe');
const Group = require('../models/Group');
const  verifyToken  = require('../middleware/verifyToken');

// @route   POST /api/swipes/save
// @desc    Save a swipe for a restaurant by a user in a group
router.post('/save', verifyToken, async (req, res) => {
    try {
        const { groupId, restaurantId, direction } = req.body;
        const userId = req.user.id;

        // Basic validation
        if (!groupId || !restaurantId || !direction) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: groupId, restaurantId, or direction.'
            });
        }

        if (!['left', 'right'].includes(direction)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid direction value.'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid groupId format.'
            });
        }

        // Check if group exists
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found.'
            });
        }

        // Check if user is a member of the group
        const isMember = group.members.some(m => m.user.toString() === userId);
        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: 'User is not a member of this group.'
            });
        }

        // Check for existing swipe
        const existingSwipe = await Swipe.findOne({ userId, groupId, restaurantId });
        if (existingSwipe) {
            return res.status(200).json({
                success: true,
                message: 'Swipe already exists.',
                data: {
                    existingDirection: existingSwipe.direction,
                    isNewSwipe: false
                }
            });
        }

        // Save new swipe
        const newSwipe = new Swipe({
            userId,
            groupId,
            restaurantId,
            direction
        });
        await newSwipe.save();

        // If swipe is right, check for match
        if (direction === 'right') {
            const groupMembers = group.members.map(m => m.user.toString());
            const rightSwipes = await Swipe.find({ groupId, restaurantId, direction: 'right' });
            const usersWhoSwipedRight = new Set(rightSwipes.map(s => s.userId.toString()));

            const allMembersSwipedRight = groupMembers.every(memberId =>
                usersWhoSwipedRight.has(memberId)
            );

            if (allMembersSwipedRight && !group.matchedRestaurants.includes(restaurantId)) {
                group.matchedRestaurants.push(restaurantId);
                await group.save();
                console.log(`🍽️ Match found for restaurant ${restaurantId} in group ${groupId}`);
            }
        }

        return res.status(201).json({
            success: true,
            message: 'Swipe saved successfully.',
            data: {
                isNewSwipe: true
            }
        });
    } catch (error) {
        console.error('❌ Error saving swipe:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to save swipe.'
        });
    }
});

module.exports = router;
