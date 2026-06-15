const express = require('express');
const router = express.Router();
const {
  getReasons,
  createReason,
  updateReason,
  deleteReason
} = require('../controllers/reasonController');
const { protect } = require('../middleware/authMiddleware');

// All reason routes require authentication
router.use(protect);

router.route('/')
  .get(getReasons)
  .post(createReason);

router.route('/:id')
  .put(updateReason)
  .delete(deleteReason);

module.exports = router;
