const express = require('express');
const router = express.Router();
const {
    getAnnouncements,
    createAnnouncement,
    deleteAnnouncement,
} = require('../controllers/announcementController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.route('/')
    .get(getAnnouncements)
    .post(upload.fields([{ name: 'images', maxCount: 3 }]), createAnnouncement);

router.route('/:id')
    .delete(deleteAnnouncement);

module.exports = router;
