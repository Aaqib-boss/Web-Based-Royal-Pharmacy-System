const Return = require('../models/return');
const Cash = require('../models/cash');
const Cheque = require('../models/cheque');

// ==========================================
// RETURN MODULE CONTROLLERS
// ==========================================

// @desc    Get all returns
// @route   GET /api/returns
// @access  Private
const getReturns = async (req, res) => {
  try {
    const returns = await Return.find({ userId: req.user._id })
      .populate('pharmacyId', 'companyName city refName')
      .populate('products', 'productName price')
      .sort({ date: -1 });

    res.json(returns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a return entry
// @route   POST /api/returns
// @access  Private
const createReturn = async (req, res) => {
  const { date, invoiceNumber, pharmacyId, city, products, qty, bonus, reason, notes } = req.body;

  if (!invoiceNumber || !pharmacyId || !city || !products || !qty || !reason) {
    return res.status(400).json({ message: 'Required fields are missing' });
  }

  if (products.length !== qty.length) {
    return res.status(400).json({ message: 'Products and quantities count mismatch' });
  }

  if (bonus && products.length !== bonus.length) {
    return res.status(400).json({ message: 'Products and bonus counts mismatch' });
  }

  try {
    const newReturn = await Return.create({
      userId: req.user._id,
      date: date || new Date(),
      invoiceNumber,
      pharmacyId,
      city,
      products,
      qty: qty.map(q => Number(q)),
      bonus: bonus ? bonus.map(b => Number(b)) : products.map(() => 0),
      reason,
      notes
    });

    const populatedReturn = await Return.findById(newReturn._id)
      .populate('pharmacyId', 'companyName city refName')
      .populate('products', 'productName price');

    res.status(201).json(populatedReturn);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a return entry
// @route   PUT /api/returns/:id
// @access  Private
const updateReturn = async (req, res) => {
  const { date, invoiceNumber, pharmacyId, city, products, qty, bonus, reason, notes } = req.body;

  try {
    const returnEntry = await Return.findOne({ _id: req.params.id, userId: req.user._id });

    if (!returnEntry) {
      return res.status(404).json({ message: 'Return entry not found or unauthorized' });
    }

    if (products && qty && products.length !== qty.length) {
      return res.status(400).json({ message: 'Products and quantities count mismatch' });
    }

    if (products && bonus && products.length !== bonus.length) {
      return res.status(400).json({ message: 'Products and bonus counts mismatch' });
    }

    returnEntry.date = date || returnEntry.date;
    returnEntry.invoiceNumber = invoiceNumber || returnEntry.invoiceNumber;
    returnEntry.pharmacyId = pharmacyId || returnEntry.pharmacyId;
    returnEntry.city = city || returnEntry.city;
    returnEntry.products = products || returnEntry.products;
    returnEntry.qty = qty ? qty.map(q => Number(q)) : returnEntry.qty;
    returnEntry.bonus = bonus ? bonus.map(b => Number(b)) : (returnEntry.bonus || returnEntry.products.map(() => 0));
    returnEntry.reason = reason || returnEntry.reason;
    returnEntry.notes = notes !== undefined ? notes : returnEntry.notes;

    await returnEntry.save();

    const populatedReturn = await Return.findById(returnEntry._id)
      .populate('pharmacyId', 'companyName city refName')
      .populate('products', 'productName price');

    res.json(populatedReturn);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a return entry
// @route   DELETE /api/returns/:id
// @access  Private
const deleteReturn = async (req, res) => {
  try {
    const returnEntry = await Return.findOne({ _id: req.params.id, userId: req.user._id });

    if (!returnEntry) {
      return res.status(404).json({ message: 'Return entry not found or unauthorized' });
    }

    await Return.deleteOne({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Return entry deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ==========================================
// CASH MODULE CONTROLLERS
// ==========================================

// @desc    Get filtered cash entries
// @route   GET /api/cash
// @access  Private
const getCashEntries = async (req, res) => {
  try {
    const { startDate, endDate, invoiceNumber, pharmacyId, city } = req.query;
    let query = { userId: req.user._id };

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // Extend to end of the day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Invoice number filter (case-insensitive regex)
    if (invoiceNumber) {
      query.invoiceNumber = { $regex: invoiceNumber, $options: 'i' };
    }

    // Pharmacy ID filter
    if (pharmacyId) {
      query.pharmacyId = pharmacyId;
    }

    // City filter (case-insensitive regex)
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    const cashEntries = await Cash.find(query)
      .populate('pharmacyId', 'companyName city')
      .sort({ date: -1 });

    res.json(cashEntries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a cash entry
// @route   POST /api/cash
// @access  Private
const createCashEntry = async (req, res) => {
  const { date, invoiceNumber, pharmacyId, city, amount } = req.body;

  if (!invoiceNumber || !pharmacyId || !city || amount === undefined) {
    return res.status(400).json({ message: 'Required fields are missing' });
  }

  try {
    const cash = await Cash.create({
      userId: req.user._id,
      date: date || new Date(),
      invoiceNumber,
      pharmacyId,
      city,
      amount: Number(amount)
    });

    const populatedCash = await Cash.findById(cash._id).populate('pharmacyId', 'companyName city');
    res.status(201).json(populatedCash);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a cash entry
// @route   PUT /api/cash/:id
// @access  Private
const updateCashEntry = async (req, res) => {
  const { date, invoiceNumber, pharmacyId, city, amount } = req.body;

  try {
    const cash = await Cash.findOne({ _id: req.params.id, userId: req.user._id });

    if (!cash) {
      return res.status(404).json({ message: 'Cash entry not found or unauthorized' });
    }

    cash.date = date || cash.date;
    cash.invoiceNumber = invoiceNumber || cash.invoiceNumber;
    cash.pharmacyId = pharmacyId || cash.pharmacyId;
    cash.city = city || cash.city;
    cash.amount = amount !== undefined ? Number(amount) : cash.amount;

    await cash.save();

    const populatedCash = await Cash.findById(cash._id).populate('pharmacyId', 'companyName city');
    res.json(populatedCash);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a cash entry
// @route   DELETE /api/cash/:id
// @access  Private
const deleteCashEntry = async (req, res) => {
  try {
    const cash = await Cash.findOne({ _id: req.params.id, userId: req.user._id });

    if (!cash) {
      return res.status(404).json({ message: 'Cash entry not found or unauthorized' });
    }

    await Cash.deleteOne({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Cash entry deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ==========================================
// CHEQUE MODULE CONTROLLERS
// ==========================================

// @desc    Get filtered cheque entries
// @route   GET /api/cheque (or /api/cheques)
// @access  Private
const getChequeEntries = async (req, res) => {
  try {
    const { startDate, endDate, invoiceNumber, pharmacyId, city } = req.query;
    let query = { userId: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (invoiceNumber) {
      query.invoiceNumber = { $regex: invoiceNumber, $options: 'i' };
    }

    if (pharmacyId) {
      query.pharmacyId = pharmacyId;
    }

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    const chequeEntries = await Cheque.find(query)
      .populate('pharmacyId', 'companyName city')
      .sort({ date: -1 });

    res.json(chequeEntries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a cheque entry
// @route   POST /api/cheques
// @access  Private
const createChequeEntry = async (req, res) => {
  const { date, invoiceNumber, pharmacyId, city, chequeNumber, bankName, amount } = req.body;

  if (!invoiceNumber || !pharmacyId || !city || !chequeNumber || !bankName || amount === undefined) {
    return res.status(400).json({ message: 'Required fields are missing' });
  }

  try {
    const cheque = await Cheque.create({
      userId: req.user._id,
      date: date || new Date(),
      invoiceNumber,
      pharmacyId,
      city,
      chequeNumber,
      bankName,
      amount: Number(amount)
    });

    const populatedCheque = await Cheque.findById(cheque._id).populate('pharmacyId', 'companyName city');
    res.status(201).json(populatedCheque);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a cheque entry
// @route   PUT /api/cheques/:id
// @access  Private
const updateChequeEntry = async (req, res) => {
  const { date, invoiceNumber, pharmacyId, city, chequeNumber, bankName, amount } = req.body;

  try {
    const cheque = await Cheque.findOne({ _id: req.params.id, userId: req.user._id });

    if (!cheque) {
      return res.status(404).json({ message: 'Cheque entry not found or unauthorized' });
    }

    cheque.date = date || cheque.date;
    cheque.invoiceNumber = invoiceNumber || cheque.invoiceNumber;
    cheque.pharmacyId = pharmacyId || cheque.pharmacyId;
    cheque.city = city || cheque.city;
    cheque.chequeNumber = chequeNumber || cheque.chequeNumber;
    cheque.bankName = bankName || cheque.bankName;
    cheque.amount = amount !== undefined ? Number(amount) : cheque.amount;

    await cheque.save();

    const populatedCheque = await Cheque.findById(cheque._id).populate('pharmacyId', 'companyName city');
    res.json(populatedCheque);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a cheque entry
// @route   DELETE /api/cheques/:id
// @access  Private
const deleteChequeEntry = async (req, res) => {
  try {
    const cheque = await Cheque.findOne({ _id: req.params.id, userId: req.user._id });

    if (!cheque) {
      return res.status(404).json({ message: 'Cheque entry not found or unauthorized' });
    }

    await Cheque.deleteOne({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Cheque entry deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getReturns,
  createReturn,
  updateReturn,
  deleteReturn,
  getCashEntries,
  createCashEntry,
  updateCashEntry,
  deleteCashEntry,
  getChequeEntries,
  createChequeEntry,
  updateChequeEntry,
  deleteChequeEntry
};
