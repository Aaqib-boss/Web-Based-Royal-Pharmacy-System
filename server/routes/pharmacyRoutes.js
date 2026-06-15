const express = require('express');
const router = express.Router();
const {
  getPharmacies,
  createPharmacy,
  updatePharmacy,
  deletePharmacy
} = require('../controllers/pharmacyController');
const { protect } = require('../middleware/authMiddleware');

// All pharmacy routes require auth
router.use(protect);

router.route('/')
  .get(getPharmacies)
  .post(createPharmacy);

router.route('/:id')
  .put(updatePharmacy)
  .delete(deletePharmacy);

module.exports = router;
