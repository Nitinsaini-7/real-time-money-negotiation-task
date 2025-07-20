// models/NegotiationSession.js
const mongoose = require('mongoose');

const NegotiationSessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    offers: [{
        offerAmount: {
            type: Number,
            required: true
        },
        offeredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'declined'],
            default: 'pending'
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('NegotiationSession', NegotiationSessionSchema);