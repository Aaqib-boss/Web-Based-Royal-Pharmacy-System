const express = require('express');
const router = express.Router();
const {
  getCashEntries,
  createCashEntry,
  updateCashEntry,
  deleteCashEntry
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

// Require authentication for all cash routes
router.use(protect);

router.route('/')
  .get(getCashEntries)
  .post(createCashEntry);

router.route('/:id')
  .put(updateCashEntry)
  .delete(deleteCashEntry);

module.exports = router;
