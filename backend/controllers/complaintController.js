const Complaint = require('../models/Complaint');

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private
exports.createComplaint = async (req, res) => {
    try {
        const { title, description, category, priority, hostel, room } = req.body;

        const complaint = await Complaint.create({
            title,
            description,
            category,
            priority,
            hostel,
            room,
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

        // Role-based restrictions
        if (req.user.role === 'warden') {
            // Warden can update status and assignedTo
            complaint.status = req.body.status || complaint.status;
            complaint.assignedTo = req.body.assignedTo || complaint.assignedTo;
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
        }

        const updatedComplaint = await complaint.save();

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
