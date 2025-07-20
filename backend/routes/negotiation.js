// routes/negotiation.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid'); // To generate unique session IDs
const auth = require('../middleware/auth'); // Import authentication middleware
const NegotiationSession = require('../models/NegotiationSession');

// @route   POST api/negotiations/create
// @desc    Create a new negotiation session
// @access  Private (only logged-in users can create)
router.post('/create', auth, async (req, res) => {
    try {
        const newSessionId = uuidv4(); // Generate a unique ID
        const userId = req.user.id; // Get user ID from authenticated request

        const newSession = new NegotiationSession({
            sessionId: newSessionId,
            participants: [userId], // Creator is the first participant
            status: 'active'
        });

        await newSession.save();

        res.json({ msg: 'Negotiation session created', sessionId: newSession.sessionId });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/negotiations/join
// @desc    Join an existing negotiation session
// @access  Private
router.post('/join', auth, async (req, res) => {
    const { sessionId } = req.body;
    const userId = req.user.id;

    try {
        let session = await NegotiationSession.findOne({ sessionId });

        if (!session) {
            return res.status(404).json({ msg: 'Negotiation session not found' });
        }

        // Add user to participants if not already present
        if (!session.participants.includes(userId)) {
            session.participants.push(userId);
            await session.save();
        }

        res.json({ msg: 'Joined negotiation session', sessionId: session.sessionId });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;