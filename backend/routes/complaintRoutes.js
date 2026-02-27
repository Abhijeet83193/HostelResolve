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
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/')
    .get(getComplaints)
    .post(createComplaint);

router.get('/stats', getComplaintStats);

router.post('/:id/comments', addComment);
router.post('/:id/upvote', upvoteComplaint);

router.route('/:id')
    .get(getComplaintById)
    .put(updateComplaint);

module.exports = router;
