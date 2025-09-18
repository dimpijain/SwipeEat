const express = require('express');
const router = express.Router();
const Swipe = require('../models/Swipe');
const Group = require('../models/Group');
const verifyToken = require('../middleware/verifyToken');

router.post('/save', verifyToken, async (req, res) => {
    try {
        const { groupId, restaurantId, direction } = req.body;
        const userId = req.user.id;

        await Swipe.findOneAndUpdate(
            { userId, groupId, restaurantId },
            { direction },
            { upsert: true }
        );

        if (direction === 'right') {
            const group = await Group.findById(groupId);
            if (!group) return res.status(404).json({ success: false, message: "Group not found" });

            const groupMemberCount = group.members.length;
            const rightSwipeCount = await Swipe.countDocuments({ groupId, restaurantId, direction: 'right' });

            // ✅ Check if the number of right swipes equals the number of group members
            if (rightSwipeCount === groupMemberCount) {
                if (!group.matchedRestaurants.includes(restaurantId)) {
                    group.matchedRestaurants.push(restaurantId);
                    await group.save();
                }
                
                // ✅ Announce the match to everyone in the group room
                const io = req.app.get('socketio');
                io.in(groupId).emit('matchFound', { restaurantId });
            }
        }

        return res.status(200).json({ success: true, message: 'Swipe saved.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to save swipe.' });
    }
});

// This route is still needed so each user can filter out their own previously swiped cards
router.get('/user/:groupId', verifyToken, async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;
        const swipes = await Swipe.find({ userId, groupId }).select('restaurantId');
        res.status(200).json({ success: true, swipes });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch user swipes.' });
    }
});

module.exports = router;