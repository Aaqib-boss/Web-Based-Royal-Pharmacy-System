const express = require('express');
const router = express.Router();
const {
  getChequeEntries,
  createChequeEntry,
  updateChequeEntry,
  deleteChequeEntry
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

// Require authentication for all cheque routes
router.use(protect);

router.route('/')
  .get(getChequeEntries)
  .post(createChequeEntry);

router.route('/:id')
  .put(updateChequeEntry)
  .delete(deleteChequeEntry);

module.exports = router;
