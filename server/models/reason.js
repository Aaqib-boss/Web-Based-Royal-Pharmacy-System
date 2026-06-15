const mongoose = require('mongoose');

const reasonSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reasonName: {
      type: String,
      required: [true, 'Please add a reason name'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Reason', reasonSchema);
