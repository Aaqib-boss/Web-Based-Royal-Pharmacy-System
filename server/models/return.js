const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema(
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
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      }
    ],
    qty: [
      {
        type: Number,
        required: true,
      }
    ],
    bonus: [
      {
        type: Number,
        required: true,
        default: 0,
      }
    ],
    reason: {
      type: String,
      required: [true, 'Please add a reason for the return'],
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Return', returnSchema);
