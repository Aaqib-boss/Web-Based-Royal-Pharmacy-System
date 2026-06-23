const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyName: {
      type: String,
      required: [true, 'Please add a company/pharmacy name'],
      trim: true,
    },
    refName: {
      type: String,
      required: [true, 'Please add a reference name'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
    },
    contactNumber: {
      type: String,
      required: [true, 'Please add a contact number'],
    },
    contactNumber2: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: [true, 'Please add a city'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Pharmacy', pharmacySchema);
