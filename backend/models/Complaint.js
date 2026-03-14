const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please add a title'],
            trim: true,
            maxlength: [100, 'Title cannot be more than 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Please add a description'],
        },
        category: {
            type: String,
            required: [true, 'Please specify a category'],
            enum: [
                'Plumbing',
                'Electrical',
                'Internet',
                'Infrastructure',
                'Mess',
                'Cleaning',
                'Security',
                'Other',
            ],
        },
        priority: {
            type: String,
            required: [true, 'Please specify priority'],
            enum: ['Low', 'Medium', 'High', 'Urgent'],
            default: 'Medium',
        },
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
            default: 'Pending',
        },
        hostel: {
            type: String,
            required: [true, 'Please specify the hostel'],
        },
        room: {
            type: String,
            required: [true, 'Please specify the room number'],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        images: {
            type: [String],
            default: [],
        },
        isEscalated: {
            type: Boolean,
            default: false,
        },
        upvotes: {
            type: Number,
            default: 0,
        },
        upvotedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        comments: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                text: {
                    type: String,
                    required: true,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Complaint', complaintSchema);
