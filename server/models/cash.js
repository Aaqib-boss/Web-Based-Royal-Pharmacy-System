const mongoose = require('mongoose');

const cashSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Please add a date'],
      default: Date.now,
    },
    invoiceNumber: {
      type: String,
      required: [true, 'Please add an invoice number'],
      trim: true,
    },
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: [true, 'Please reference a pharmacy'],
    },
    city: {
      type: String,
      required: [true, 'Please add a city'],
    },
    amount: {
      type: Number,
      required: [true, 'Please add an amount'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Cash', cashSchema);
