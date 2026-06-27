const express = require('express');
const router = express.Router();
const {
  loginUser,
  forgotPassword,
  resetPassword,
  createUser,
  getUsers,
  deleteUser,
  updateUser,
  registerUser,
  updateProfilePhoto,
  deleteProfilePhoto,
  deleteAccount,
  getUserProfile,
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Private/Admin routes
router.post('/create-user', protect, admin, createUser);
router.get('/users', protect, admin, getUsers);
router.put('/users/:id', protect, admin, updateUser);
router.delete('/users/:id', protect, admin, deleteUser);

// Profile routes
router.get('/profile', protect, getUserProfile);
router.put('/profile/photo', protect, upload.single('profilePhoto'), updateProfilePhoto);
router.delete('/profile/photo', protect, deleteProfilePhoto);
router.delete('/profile', protect, deleteAccount);

module.exports = router;
