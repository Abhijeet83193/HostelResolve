const express = require('express');
const router = express.Router();
const {
    createComplaint,
    getComplaints,
    getComplaintById,
    updateComplaint,
    getComplaintStats,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/')
    .get(getComplaints)
    .post(createComplaint);

router.get('/stats', getComplaintStats);

router.route('/:id')
    .get(getComplaintById)
    .put(updateComplaint);

module.exports = router;
