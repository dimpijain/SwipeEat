// routes/swipes.js
const express = require('express');
const router = express.Router();
const Swipe = require('../models/Swipe');
const Group = require('../models/Group');
const verifyToken = require('../middleware/verifyToken');

router.post('/save', verifyToken, async (req, res) => {
    try {
        const { groupId, restaurantId, direction } = req.body;
        const userId = req.user.id;

        // Validate inputs
        if (!groupId || !restaurantId || !direction) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!['left', 'right'].includes(direction)) {
            return res.status(400).json({ error: 'Invalid direction value' });
        }

        // Check if group exists
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Check if user is member of group
        const isMember = group.members.some(m => m.user.toString() === userId);
        if (!isMember) {
            return res.status(403).json({ error: 'User is not a member of this group' });
        }

        // Check if user already swiped this restaurant
        const existingSwipe = await Swipe.findOne({
            userId,
            groupId,
            restaurantId
        });

        if (existingSwipe) {
            return res.status(409).json({ 
                error: 'You have already swiped on this restaurant',
                existingDirection: existingSwipe.direction
            });
        }

        // Save swipe
        const newSwipe = new Swipe({
            userId,
            groupId,
            restaurantId,
            direction
        });
        await newSwipe.save();

        // Check for matches if swiped right
        if (direction === 'right') {
            const groupMembers = group.members.map(member => member.user.toString());
            const rightSwipes = await Swipe.find({
                groupId,
                restaurantId,
                direction: 'right'
            });

            const usersWhoSwipedRight = new Set(rightSwipes.map(s => s.userId.toString()));
            const allMembersSwipedRight = groupMembers.every(memberId => 
                usersWhoSwipedRight.has(memberId)
            );

            if (allMembersSwipedRight && !group.matchedRestaurants.includes(restaurantId)) {
                group.matchedRestaurants.push(restaurantId);
                await group.save();
                console.log(`Match found for restaurant ${restaurantId} in group ${groupId}`);
            }
        }

        return res.status(201).json({ 
            message: 'Swipe saved successfully',
            isNewSwipe: true
        });
    } catch (error) {
        console.error('Error saving swipe:', error);
        return res.status(500).json({ 
            error: 'Failed to save swipe',
            details: error.message 
        });
    }
});

module.exports = router;