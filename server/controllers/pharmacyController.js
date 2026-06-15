const Pharmacy = require('../models/pharmacy');

// @desc    Get pharmacies with search query
// @route   GET /api/pharmacies
// @access  Private
const getPharmacies = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { userId: req.user._id };

    if (search) {
      // Escape special characters in search regex
      const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      query.companyName = { $regex: escapedSearch, $options: 'i' };
    }

    const pharmacies = await Pharmacy.find(query).sort({ companyName: 1 });
    res.json(pharmacies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a pharmacy
// @route   POST /api/pharmacies
// @access  Private
const createPharmacy = async (req, res) => {
  const { companyName, refName, address, contactNumber, city } = req.body;

  if (!companyName || !refName || !address || !contactNumber || !city) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validate contact number (exactly 10 digits)
  const digitsOnly = contactNumber.replace(/\D/g, '');
  if (digitsOnly.length !== 10 || contactNumber.length !== 10) {
    return res.status(400).json({ message: 'Contact number must be exactly 10 digits' });
  }

  try {
    const pharmacy = await Pharmacy.create({
      userId: req.user._id,
      companyName,
      refName,
      address,
      contactNumber,
      city
    });

    res.status(201).json(pharmacy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a pharmacy
// @route   PUT /api/pharmacies/:id
// @access  Private
const updatePharmacy = async (req, res) => {
  const { companyName, refName, address, contactNumber, city } = req.body;

  try {
    const pharmacy = await Pharmacy.findOne({ _id: req.params.id, userId: req.user._id });

    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found or unauthorized' });
    }

    if (contactNumber) {
      const digitsOnly = contactNumber.replace(/\D/g, '');
      if (digitsOnly.length !== 10 || contactNumber.length !== 10) {
        return res.status(400).json({ message: 'Contact number must be exactly 10 digits' });
      }
    }

    pharmacy.companyName = companyName || pharmacy.companyName;
    pharmacy.refName = refName || pharmacy.refName;
    pharmacy.address = address || pharmacy.address;
    pharmacy.contactNumber = contactNumber || pharmacy.contactNumber;
    pharmacy.city = city || pharmacy.city;

    const updatedPharmacy = await pharmacy.save();
    res.json(updatedPharmacy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a pharmacy
// @route   DELETE /api/pharmacies/:id
// @access  Private
const deletePharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ _id: req.params.id, userId: req.user._id });

    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found or unauthorized' });
    }

    await Pharmacy.deleteOne({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Pharmacy deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPharmacies,
  createPharmacy,
  updatePharmacy,
  deletePharmacy
};
