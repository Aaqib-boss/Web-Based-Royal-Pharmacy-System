const Reason = require('../models/reason');

// @desc    Get reasons with search query
// @route   GET /api/reasons
// @access  Private
const getReasons = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { userId: req.user._id };

    if (search) {
      const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      query.reasonName = { $regex: escapedSearch, $options: 'i' };
    }

    const reasons = await Reason.find(query).sort({ reasonName: 1 });
    res.json(reasons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a reason
// @route   POST /api/reasons
// @access  Private
const createReason = async (req, res) => {
  const { reasonName } = req.body;

  if (!reasonName) {
    return res.status(400).json({ message: 'Reason name is required' });
  }

  try {
    const reason = await Reason.create({
      userId: req.user._id,
      reasonName
    });

    res.status(201).json(reason);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a reason
// @route   PUT /api/reasons/:id
// @access  Private
const updateReason = async (req, res) => {
  const { reasonName } = req.body;

  try {
    const reason = await Reason.findOne({ _id: req.params.id, userId: req.user._id });

    if (!reason) {
      return res.status(404).json({ message: 'Reason not found or unauthorized' });
    }

    reason.reasonName = reasonName || reason.reasonName;

    const updatedReason = await reason.save();
    res.json(updatedReason);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a reason
// @route   DELETE /api/reasons/:id
// @access  Private
const deleteReason = async (req, res) => {
  try {
    const reason = await Reason.findOne({ _id: req.params.id, userId: req.user._id });

    if (!reason) {
      return res.status(404).json({ message: 'Reason not found or unauthorized' });
    }

    await Reason.deleteOne({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Reason deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getReasons,
  createReason,
  updateReason,
  deleteReason
};
