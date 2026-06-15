const express = require('express');
const router = express.Router();
const {
  getReturns,
  createReturn,
  updateReturn,
  deleteReturn
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

// Require authentication for all return routes
router.use(protect);

router.route('/')
  .get(getReturns)
  .post(createReturn);

router.route('/:id')
  .put(updateReturn)
  .delete(deleteReturn);

module.exports = router;
