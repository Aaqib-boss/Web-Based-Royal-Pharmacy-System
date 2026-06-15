const Product = require('../models/product');

// @desc    Get products with search query
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { userId: req.user._id };

    if (search) {
      const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      query.productName = { $regex: escapedSearch, $options: 'i' };
    }

    const products = await Product.find(query).sort({ productName: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res) => {
  const { productName, price } = req.body;

  if (!productName || price === undefined) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const product = await Product.create({
      userId: req.user._id,
      productName,
      price: Number(price)
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res) => {
  const { productName, price } = req.body;

  try {
    const product = await Product.findOne({ _id: req.params.id, userId: req.user._id });

    if (!product) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }

    product.productName = productName || product.productName;
    product.price = price !== undefined ? Number(price) : product.price;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, userId: req.user._id });

    if (!product) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }

    await Product.deleteOne({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
