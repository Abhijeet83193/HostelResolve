const Announcement = require('../models/Announcement');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private
exports.getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find()
            .populate('createdBy', 'name role')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: announcements,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private (Warden only)
exports.createAnnouncement = async (req, res) => {
    try {
        if (req.user.role !== 'warden') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to create announcements',
            });
        }

        const { title, content, category } = req.body;
        
        let imageUrls = [];
        if (req.files && req.files.images) {
            imageUrls = req.files.images.map(file => file.path);
        }

        const announcement = await Announcement.create({
            title,
            content,
            category,
            createdBy: req.user._id,
            images: imageUrls
        });

        res.status(201).json({
            success: true,
            data: announcement,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Warden only)
exports.deleteAnnouncement = async (req, res) => {
    try {
        if (req.user.role !== 'warden') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete announcements',
            });
        }

        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found',
            });
        }

        await announcement.deleteOne();

        res.json({
            success: true,
            message: 'Announcement removed',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
