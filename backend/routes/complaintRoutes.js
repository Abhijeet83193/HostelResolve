const express = require('express');
const router = express.Router();
const {
    createComplaint,
    getComplaints,
    getComplaintById,
    updateComplaint,
    getComplaintStats,
    addComment,
    upvoteComplaint,
    deleteComplaint,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

// All routes are protected
router.use(protect);

router.route('/')
    .get(getComplaints)
    .post(upload.array('images', 5), createComplaint);

router.get('/stats', getComplaintStats);

router.post('/:id/comments', addComment);
router.post('/:id/upvote', upvoteComplaint);

router.route('/:id')
    .get(getComplaintById)
    .put(updateComplaint)
    .delete(deleteComplaint);

module.exports = router;
