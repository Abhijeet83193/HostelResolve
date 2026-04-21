const Complaint = require('../models/Complaint');
const { createNotification } = require('./notificationController');

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private
exports.createComplaint = async (req, res) => {
    try {
        const { title, description, category, priority, hostel, room } = req.body;

        const images = req.files ? req.files.map(file => file.path) : [];

        const complaint = await Complaint.create({
            title,
            description,
            category,
            priority,
            hostel,
            room,
            images,
            createdBy: req.user._id,
        });

        res.status(201).json({
            success: true,
            data: complaint,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private
exports.getComplaints = async (req, res) => {
    try {
        const { status, category, priority, search } = req.query;
        let query = {};

        // Filters
        if (status && status !== 'all') query.status = status;
        if (category && category !== 'all') query.category = category;
        if (priority && priority !== 'all') query.priority = priority;

        // Search in title or description
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const complaints = await Complaint.find(query)
            .populate('createdBy', 'name email hostel room role')
            .populate('assignedTo', 'name email role')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: complaints.length,
            data: complaints,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Private
exports.getComplaintById = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
            .populate('createdBy', 'name email hostel room role')
            .populate('assignedTo', 'name email role')
            .populate('comments.user', 'name role');

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found',
            });
        }

        res.json({
            success: true,
            data: complaint,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update complaint
// @route   PUT /api/complaints/:id
// @access  Private
exports.updateComplaint = async (req, res) => {
    try {
        let complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found',
            });
        }

        const oldStatus = complaint.status;
        const oldAssignedTo = complaint.assignedTo;

        // Role-based restrictions
        if (req.user.role === 'warden') {
            // Warden can update status and assignedTo
            complaint.status = req.body.status || complaint.status;
            complaint.assignedTo = req.body.assignedTo || complaint.assignedTo;

            // Handle resolvedImages if status is being set to Resolved or by warden
            if (req.body.existingResolvedImages) {
                const keepResolvedImages = Array.isArray(req.body.existingResolvedImages)
                    ? req.body.existingResolvedImages
                    : [req.body.existingResolvedImages];
                complaint.resolvedImages = keepResolvedImages;
            }

            if (req.files && req.files.resolvedImages) {
                const newResolvedImageUrls = req.files.resolvedImages.map(file => file.path);
                complaint.resolvedImages = [...complaint.resolvedImages, ...newResolvedImageUrls];
            }
        } else {
            // Student can only update their own complaint it it's still pending
            if (complaint.createdBy.toString() !== req.user._id.toString()) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authorized to update this complaint',
                });
            }
            if (complaint.status !== 'Pending') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot update complaint once it is beyond Pending status',
                });
            }

            complaint.title = req.body.title || complaint.title;
            complaint.description = req.body.description || complaint.description;
            complaint.category = req.body.category || complaint.category;
            complaint.priority = req.body.priority || complaint.priority;

            // Handle Images
            if (req.body.existingImages) {
                const keepImages = Array.isArray(req.body.existingImages)
                    ? req.body.existingImages
                    : [req.body.existingImages];
                complaint.images = keepImages;
            }

            // Append new images if any (using upload.fields)
            if (req.files && req.files.images) {
                const newImageUrls = req.files.images.map(file => file.path);
                complaint.images = [...complaint.images, ...newImageUrls];
            }
        }

        const updatedComplaint = await complaint.save();

        // --- Trigger Notifications ---

        // 1. Status Change Notification
        if (oldStatus !== updatedComplaint.status) {
            await createNotification({
                recipient: updatedComplaint.createdBy,
                sender: req.user._id,
                type: 'status_change',
                complaint: updatedComplaint._id,
                message: `Your complaint status has been updated to "${updatedComplaint.status}"`,
            });
        }

        // 2. Assignment Notification
        if (req.user.role === 'warden' && updatedComplaint.assignedTo && (!oldAssignedTo || oldAssignedTo.toString() !== updatedComplaint.assignedTo.toString())) {
            await createNotification({
                recipient: updatedComplaint.assignedTo,
                sender: req.user._id,
                type: 'assigned',
                complaint: updatedComplaint._id,
                message: `A new complaint titled "${updatedComplaint.title}" has been assigned to you`,
            });
        }

        res.json({
            success: true,
            data: updatedComplaint,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get dashboard stats
// @route   GET /api/complaints/stats
// @access  Private
exports.getComplaintStats = async (req, res) => {
    try {
        const stats = await Complaint.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        const formattedStats = {
            total: 0,
            pending: 0,
            inProgress: 0,
            resolved: 0,
            rejected: 0,
        };

        stats.forEach((item) => {
            formattedStats.total += item.count;
            if (item._id === 'Pending') formattedStats.pending = item.count;
            if (item._id === 'In Progress') formattedStats.inProgress = item.count;
            if (item._id === 'Resolved') formattedStats.resolved = item.count;
            if (item._id === 'Rejected') formattedStats.rejected = item.count;
        });

        // Get average rating for resolved complaints
        const ratingStats = await Complaint.aggregate([
            {
                $match: {
                    status: 'Resolved',
                    'feedback.rating': { $exists: true },
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$feedback.rating' },
                    feedbackCount: { $sum: 1 },
                },
            },
        ]);

        formattedStats.averageRating = ratingStats.length > 0 ? ratingStats[0].averageRating.toFixed(1) : 0;
        formattedStats.feedbackCount = ratingStats.length > 0 ? ratingStats[0].feedbackCount : 0;

        res.json({
            success: true,
            data: formattedStats,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Add comment to complaint
// @route   POST /api/complaints/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found',
            });
        }

        const comment = {
            user: req.user._id,
            text: req.body.text,
        };

        complaint.comments.push(comment);
        await complaint.save();

        // Trigger Notification to Complaint Creator (if someone else commented)
        if (complaint.createdBy.toString() !== req.user._id.toString()) {
            await createNotification({
                recipient: complaint.createdBy,
                sender: req.user._id,
                type: 'new_comment',
                complaint: complaint._id,
                message: `${req.user.name} commented on your complaint: "${complaint.title}"`,
            });
        }

        const updatedComplaint = await Complaint.findById(req.params.id)
            .populate('comments.user', 'name role');

        res.json({
            success: true,
            data: updatedComplaint.comments[updatedComplaint.comments.length - 1],
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Upvote complaint
// @route   POST /api/complaints/:id/upvote
// @access  Private
exports.upvoteComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found',
            });
        }

        // Check if user has already upvoted
        const upvoteIndex = complaint.upvotedBy.indexOf(req.user._id);

        if (upvoteIndex === -1) {
            // Add upvote
            complaint.upvotedBy.push(req.user._id);
            complaint.upvotes += 1;
        } else {
            // Remove upvote (toggle)
            complaint.upvotedBy.splice(upvoteIndex, 1);
            complaint.upvotes -= 1;
        }

        await complaint.save();

        res.json({
            success: true,
            upvotes: complaint.upvotes,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private
exports.deleteComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found',
            });
        }

        // Authorization: Only creator (if pending) or warden can delete
        if (req.user.role !== 'warden') {
            if (complaint.createdBy.toString() !== req.user._id.toString()) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authorized to delete this complaint',
                });
            }
            if (complaint.status !== 'Pending') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete complaint once it is beyond Pending status',
                });
            }
        }

        await complaint.deleteOne();

        res.json({
            success: true,
            message: 'Complaint deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
// @desc    Submit feedback for resolved complaint
// @route   POST /api/complaints/:id/feedback
// @access  Private
exports.submitFeedback = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found',
            });
        }

        // Only creator can give feedback
        if (complaint.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to give feedback on this complaint',
            });
        }

        // Only students can give feedback
        if (req.user.role !== 'student') {
            return res.status(403).json({
                success: false,
                message: 'Only students are authorized to provide feedback',
            });
        }

        // Can only give feedback if status is Resolved
        if (complaint.status !== 'Resolved') {
            return res.status(400).json({
                success: false,
                message: 'Feedback can only be provided for resolved complaints',
            });
        }

        complaint.feedback = {
            rating: Number(rating),
            comment,
            givenAt: new Date(),
        };

        await complaint.save();

        // Notify assigned staff (if any)
        if (complaint.assignedTo) {
            await createNotification({
                recipient: complaint.assignedTo,
                sender: req.user._id,
                type: 'feedback_received',
                complaint: complaint._id,
                message: `You received a ${rating}-star rating for complaint: "${complaint.title}"`,
            });
        }

        res.json({
            success: true,
            data: complaint,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Re-open resolved complaint
// @route   POST /api/complaints/:id/reopen
// @access  Private
exports.reopenComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found',
            });
        }

        // Only creator can re-open
        if (complaint.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to re-open this complaint',
            });
        }

        // Can only re-open if status is Resolved
        if (complaint.status !== 'Resolved') {
            return res.status(400).json({
                success: false,
                message: 'Only resolved complaints can be re-opened',
            });
        }

        complaint.status = 'In Progress';
        // Optionally add a comment about why it was re-opened
        complaint.comments.push({
            user: req.user._id,
            text: 'Complaint re-opened by student due to dissatisfaction with resolution.',
        });

        await complaint.save();

        // Notify assigned staff (if any)
        if (complaint.assignedTo) {
            await createNotification({
                recipient: complaint.assignedTo,
                sender: req.user._id,
                type: 'status_change',
                complaint: complaint._id,
                message: `Complaint titled "${complaint.title}" has been re-opened by the student.`,
            });
        }

        res.json({
            success: true,
            data: complaint,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
