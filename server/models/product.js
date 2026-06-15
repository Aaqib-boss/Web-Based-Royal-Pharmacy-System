const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productName: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please add a product price'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
