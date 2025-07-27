const express = require('express');
const router = express.Router();
const Swipe = require('../models/Swipe'); // Ensure path is correct
const Group = require('../models/Group'); // Ensure path is correct
const verifyToken = require('../middleware/verifyToken'); // Ensure path is correct
const mongoose = require('mongoose');

const SWIPE_DIRECTIONS = {
    LEFT: 'left',
    RIGHT: 'right'
};

/**
 * @swagger
 * /api/swipes/save:
 * post:
 * summary: Save a swipe action
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * groupId:
 * type: string
 * restaurantId:
 * type: string
 * direction:
 * type: string
 * enum: [left, right]
 * responses:
 * 201:
 * description: Swipe saved successfully
 * 200:
 * description: Swipe already exists (or left swipe acknowledged)
 * 400:
 * description: Bad Request (e.g., missing fields, invalid ID format, invalid direction)
 * 403:
 * description: Forbidden (User not a member of the group)
 * 404:
 * description: Not Found (Group not found)
 * 500:
 * description: Internal Server Error
 */
router.post('/save', verifyToken, async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { groupId, restaurantId, direction } = req.body;
        const userId = req.user.id; // User ID from verifyToken middleware

        // --- Input Validation ---
        if (!groupId || !restaurantId || !direction) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: groupId, restaurantId, or direction.'
            });
        }

        if (!Object.values(SWIPE_DIRECTIONS).includes(direction)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid direction value. Must be "left" or "right".'
            });
        }

        // --- Crucial: Validate Mongoose ObjectIDs before queries ---
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({
                success: false,
                message: `Invalid groupId format: ${groupId}`
            });
        }
        // Assuming restaurantId might also be stored as an ObjectId in your Swipe model
        // If restaurantId is just a string (e.g., from Google Places ID), this check isn't needed.
        // Uncomment the below if restaurantId is a Mongoose ObjectId in your Swipe model
        /*
        if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
            return res.status(400).json({
                success: false,
                message: `Invalid restaurantId format: ${restaurantId}`
            });
        }
        */

        await session.withTransaction(async () => {
            // Check if group exists
            const group = await Group.findById(groupId).session(session);
            if (!group) {
                // Return 404 if group not found
                return res.status(404).json({ success: false, message: 'Group not found.' });
            }

            // Check if user is member of group
            // Ensure group.members is an array of objects with a `user` field that is an ObjectId
            const isMember = group.members.some(m => m.user && m.user.toString() === userId);
            if (!isMember) {
                // Return 403 if user is not a member
                return res.status(403).json({ success: false, message: 'User is not a member of this group.' });
            }

            // Check for existing swipe by this user for this restaurant in this group
            const existingSwipe = await Swipe.findOne({
                userId,
                groupId,
                restaurantId
            }).session(session);

            if (existingSwipe) {
                // If a swipe already exists, return 200 OK with information
                // This handles idempotency and prevents duplicate entries.
                // The frontend can use `isNewSwipe: false` to decide if it needs to update UI.
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
            await newSwipe.save({ session });

            // --- Match Logic (only for RIGHT swipes) ---
            if (direction === SWIPE_DIRECTIONS.RIGHT) {
                const groupMembers = group.members.map(member => member.user.toString());

                // Find all right swipes for this restaurant in this group
                const rightSwipes = await Swipe.find({
                    groupId,
                    restaurantId,
                    direction: SWIPE_DIRECTIONS.RIGHT
                }).session(session);

                const usersWhoSwipedRight = new Set(rightSwipes.map(s => s.userId.toString()));

                // Check if ALL group members have swiped right on this restaurant
                const allMembersSwipedRight = groupMembers.every(memberId =>
                    usersWhoSwipedRight.has(memberId)
                );

                // If all members swiped right AND this restaurant is not already matched
                if (allMembersSwipedRight && !group.matchedRestaurants.includes(restaurantId)) {
                    group.matchedRestaurants.push(restaurantId);
                    await group.save({ session });
                    console.log(`Match found for restaurant ${restaurantId} in group ${groupId}`);
                    // Optionally, you could emit a WebSocket event here to notify all group members
                }
            }

            // Respond with 201 Created for a new swipe
            return res.status(201).json({
                success: true,
                message: 'Swipe saved successfully.',
                data: {
                    isNewSwipe: true
                }
            });
        });
    } catch (error) {
        // --- Centralized Error Handling ---
        console.error('Error saving swipe:', error); // Log the full error for debugging

        let statusCode = 500;
        let errorMessage = 'Failed to save swipe. An unexpected server error occurred.';

        // Handle specific known error types
        if (error.name === 'ValidationError') {
            statusCode = 400;
            errorMessage = error.message; // Mongoose validation error message
        } else if (error.name === 'CastError' && error.path === '_id') {
            // This catches malformed ObjectIds that slip past initial validation (less likely now with explicit checks)
            statusCode = 400;
            errorMessage = `Invalid ID format for ${error.model.modelName} ID: ${error.value}`;
        } else if (error.message.includes('Group not found')) {
            statusCode = 404;
            errorMessage = error.message;
        } else if (error.message.includes('User is not a member of this group')) {
            statusCode = 403;
            errorMessage = error.message;
        } else {
            // Generic 500 for other unexpected errors
            errorMessage = error.message || errorMessage;
        }

        return res.status(statusCode).json({
            success: false,
            message: errorMessage
        });
    } finally {
        // Ensure the session is ended even if an error occurs
        if (session.inTransaction()) {
             // If somehow still in transaction on error, abort it
            await session.abortTransaction();
        }
        session.endSession();
    }
});

module.exports = router;