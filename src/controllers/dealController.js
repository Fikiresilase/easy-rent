const Deal = require('../models/Deal');
const Property = require('../models/Property');


const createDeal = async (req, res) => {
  try {
    const {
      propertyId,
      renterId,
      ownerId,
      startDate,
      endDate,
      monthlyRent,
      securityDeposit,
      terms,
    } = req.body;

    console.log('Attempting to create deal:', {
      propertyId,
      renterId,
      ownerId,
      userId: req.user?._id,
      timestamp: new Date().toISOString(),
    });

    
    const property = await Property.findById(propertyId);
    if (!property) {
      console.warn('Property not found:', { propertyId, userId: req.user?._id });
      return res.status(404).json({ message: 'Property not found' });
    }
    if (!['available', 'pending'].includes(property.status)) {
      console.warn('Property not available:', { propertyId, status: property.status, userId: req.user?._id });
      return res.status(400).json({ message: `Property is not available for deals (status: ${property.status})` });
    }

    
    const effectiveOwnerId = ownerId || property.ownerId;
    if (req.user._id.toString() !== effectiveOwnerId.toString() &&
        req.user._id.toString() !== renterId.toString()) {
      console.warn('Unauthorized to create deal:', {
        propertyId,
        userId: req.user._id,
        ownerId: effectiveOwnerId,
        renterId,
        timestamp: new Date().toISOString(),
      });
      return res.status(403).json({ message: 'Not authorized to create this deal' });
    }

    
    const existingDeal = await Deal.findOne({
      propertyId,
      renterId: { $ne: renterId },
      status: { $in: ['pending', 'done'] }
    });
    if (existingDeal) {
      console.warn('Existing deal with another renter found:', {
        propertyId,
        dealId: existingDeal._id,
        existingRenterId: existingDeal.renterId,
        requestedRenterId: renterId,
        status: existingDeal.status,
        signatures: existingDeal.signatures,
        userId: req.user?._id,
        timestamp: new Date().toISOString(),
      });
      return res.status(400).json({ message: 'Another renter has an active deal for this property' });
    }

    
    const signatures = {
      owner: { signed: false, signedAt: null },
      renter: { signed: false, signedAt: null }
    };
    const isOwner = req.user._id.toString() === effectiveOwnerId.toString();
    if (isOwner) {
      signatures.owner.signed = true;
      signatures.owner.signedAt = new Date();
    } else {
      signatures.renter.signed = true;
      signatures.renter.signedAt = new Date();
    }

    
    const deal = new Deal({
      propertyId,
      ownerId: effectiveOwnerId,
      renterId,
      startDate,
      endDate,
      monthlyRent,
      securityDeposit,
      terms,
      signatures,
      status: 'pending', 
    });

    await deal.save();

    
    property.status = 'pending';
    await property.save();

    console.log('Deal created:', {
      dealId: deal._id,
      propertyId: deal.propertyId,
      ownerId: deal.ownerId,
      renterId: deal.renterId,
      status: deal.status,
      signatures: deal.signatures,
      propertyStatus: property.status,
      userId: req.user?._id,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json(deal);
  } catch (error) {
    console.error('Error creating deal:', {
      propertyId: req.body.propertyId,
      userId: req.user?._id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({ message: 'Error creating deal', error: error.message });
  }
};


const signDeal = async (req, res) => {
  try {
    const { propertyId, ownerId, renterId } = req.body;
    console.log('Attempting to sign deal:', { propertyId, ownerId, renterId, userId: req.user?._id, timestamp: new Date().toISOString() });

    
    if (!propertyId || !ownerId || !renterId) {
      console.warn('Missing required fields:', { propertyId, ownerId, renterId, userId: req.user?._id });
      return res.status(400).json({ message: 'Property ID, owner ID, and renter ID are required' });
    }

    
    const deal = await Deal.findOne({
      propertyId,
      ownerId,
      renterId,
      status: 'pending'
    });
    if (!deal) {
      console.warn('Deal not found:', { propertyId, ownerId, renterId, userId: req.user?._id });
      return res.status(404).json({ message: 'No pending deal found for this property, owner, and renter' });
    }

    
    const property = await Property.findById(deal.propertyId);
    if (!property) {
      console.warn('Property not found for deal:', { dealId: deal._id, propertyId: deal.propertyId, userId: req.user?._id });
      return res.status(404).json({ message: 'Property not found' });
    }
    if (!['available', 'pending'].includes(property.status)) {
      console.warn('Property not available for signing:', { dealId: deal._id, propertyId: deal.propertyId, status: property.status, userId: req.user?._id });
      return res.status(400).json({ message: `Property is not available for deals (status: ${property.status})` });
    }

    
    if (deal.ownerId.toString() !== req.user._id.toString() &&
        deal.renterId.toString() !== req.user._id.toString()) {
      console.warn('Unauthorized to sign deal:', { dealId: deal._id, userId: req.user._id, ownerId: deal.ownerId, renterId: deal.renterId });
      return res.status(403).json({ message: 'Not authorized to sign this deal' });
    }

    
    const isOwner = req.user._id.toString() === deal.ownerId.toString();
    if (isOwner && deal.signatures.owner.signed) {
      console.warn('Owner already signed:', { dealId: deal._id, userId: req.user._id });
      return res.status(400).json({ message: 'You have already signed this deal' });
    }
    if (!isOwner && deal.signatures.renter.signed) {
      console.warn('Renter already signed:', { dealId: deal._id, userId: req.user._id });
      return res.status(400).json({ message: 'You have already signed this deal' });
    }

    
    if (isOwner) {
      deal.signatures.owner.signed = true;
      deal.signatures.owner.signedAt = new Date();
    } else {
      deal.signatures.renter.signed = true;
      deal.signatures.renter.signedAt = new Date();
    }

    
    if (deal.signatures.owner.signed && deal.signatures.renter.signed) {
      deal.status = 'completed';
      property.status = 'rented';
      await property.save();
    } else {
      deal.status = 'pending'; 
    }

    await deal.save();

    console.log('Deal signed:', {
      dealId: deal._id,
      status: deal.status,
      signatures: deal.signatures,
      propertyStatus: property.status,
      userId: req.user._id,
      timestamp: new Date().toISOString(),
    });

    res.json(deal);
  } catch (error) {
    console.error('Error signing deal:', {
      propertyId: req.body.propertyId,
      userId: req.user?._id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({ message: 'Error signing deal', error: error.message });
  }
};


const getUserDeals = async (req, res) => {
  try {
    const deals = await Deal.find({
      $or: [
        { ownerId: req.user._id },
        { renterId: req.user._id }
      ]
    })
    .populate('propertyId')
    .populate('ownerId', 'name email')
    .populate('renterId', 'name email')
    .sort({ createdAt: -1 });

    console.log('Deals fetched for user:', {
      userId: req.user._id,
      dealCount: deals.length,
      dealIds: deals.map(d => d._id.toString()),
      timestamp: new Date().toISOString(),
    });

    res.json(deals);
  } catch (error) {
    console.error('Error fetching deals:', {
      userId: req.user._id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({ message: 'Error fetching deals', error: error.message });
  }
};


const getDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('propertyId')
      .populate('ownerId', 'name email')
      .populate('renterId', 'name email');

    if (!deal) {
      console.warn('Deal not found:', { dealId: req.params.id, userId: req.user?._id });
      return res.status(404).json({ message: 'Deal not found' });
    }

    
    if (deal.ownerId._id.toString() !== req.user._id.toString() &&
        deal.renterId._id.toString() !== req.user._id.toString()) {
      console.warn('Unauthorized to view deal:', { dealId: req.params.id, userId: req.user?._id });
      return res.status(403).json({ message: 'Not authorized to view this deal' });
    }

    res.json(deal);
  } catch (error) {
    console.error('Error fetching deal:', {
      dealId: req.params.id,
      userId: req.user?._id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({ message: 'Error fetching deal', error: error.message });
  }
};


const updateDealStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const deal = await Deal.findById(req.params.id);

    if (!deal) {
      console.warn('Deal not found:', { dealId: req.params.id, userId: req.user?._id });
      return res.status(404).json({ message: 'Deal not found' });
    }

    
    if (deal.ownerId.toString() !== req.user._id.toString() &&
        deal.renterId.toString() !== req.user._id.toString()) {
      console.warn('Unauthorized to update deal:', { dealId: req.params.id, userId: req.user?._id });
      return res.status(403).json({ message: 'Not authorized to update this deal' });
    }

    deal.status = status;
    await deal.save();

    
    if (status === 'completed' || status === 'cancelled') {
      const property = await Property.findById(deal.propertyId);
      property.status = status === 'completed' ? 'rented' : 'available';
      await property.save();
      console.log('Property status updated:', {
        propertyId: deal.propertyId,
        status: property.status,
        dealId: deal._id,
        userId: req.user?._id,
        timestamp: new Date().toISOString(),
      });
    }

    console.log('Deal status updated:', {
      dealId: deal._id,
      status: deal.status,
      userId: req.user?._id,
      timestamp: new Date().toISOString(),
    });

    res.json(deal);
  } catch (error) {
    console.error('Error updating deal:', {
      dealId: req.params.id,
      userId: req.user?._id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({ message: 'Error updating deal', error: error.message });
  }
};


const addPayment = async (req, res) => {
  try {
    const {
      amount,
      dueDate,
      paymentMethod,
      transactionId
    } = req.body;

    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      console.warn('Deal not found:', { dealId: req.params.id, userId: req.user?._id });
      return res.status(404).json({ message: 'Deal not found' });
    }

    
    if (deal.renterId.toString() !== req.user._id.toString()) {
      console.warn('Unauthorized to add payment:', { dealId: req.params.id, userId: req.user?._id });
      return res.status(403).json({ message: 'Not authorized to add payment' });
    }

    deal.payments.push({
      amount,
      dueDate,
      paymentMethod,
      transactionId,
      status: 'paid',
      paidAt: new Date()
    });

    await deal.save();

    console.log('Payment added:', {
      dealId: deal._id,
      paymentId: deal.payments[deal.payments.length - 1]._id,
      userId: req.user?._id,
      timestamp: new Date().toISOString(),
    });

    res.json(deal);
  } catch (error) {
    console.error('Error adding payment:', {
      dealId: req.params.id,
      userId: req.user?._id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({ message: 'Error adding payment', error: error.message });
  }
};


const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const deal = await Deal.findById(req.params.id);

    if (!deal) {
      console.warn('Deal not found:', { dealId: req.params.id, userId: req.user?._id });
      return res.status(404).json({ message: 'Deal not found' });
    }

    
    if (deal.ownerId.toString() !== req.user._id.toString() &&
        deal.renterId.toString() !== req.user._id.toString()) {
      console.warn('Unauthorized to add review:', { dealId: req.params.id, userId: req.user?._id });
      return res.status(403).json({ message: 'Not authorized to add review' });
    }

    
    if (deal.status !== 'completed') {
      console.warn('Deal not completed for review:', { dealId: req.params.id, status: deal.status, userId: req.user?._id });
      return res.status(400).json({ message: 'Can only review completed deals' });
    }

    
    const existingReview = deal.reviews.find(
      review => review.userId.toString() === req.user._id.toString()
    );
    if (existingReview) {
      console.warn('User already reviewed:', { dealId: req.params.id, userId: req.user?._id });
      return res.status(400).json({ message: 'You have already reviewed this deal' });
    }

    deal.reviews.push({
      userId: req.user._id,
      rating,
      comment
    });

    await deal.save();

    console.log('Review added:', {
      dealId: deal._id,
      reviewId: deal.reviews[deal.reviews.length - 1]._id,
      userId: req.user?._id,
      timestamp: new Date().toISOString(),
    });

    res.json(deal);
  } catch (error) {
    console.error('Error adding review:', {
      dealId: req.params.id,
      userId: req.user?._id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({ message: 'Error adding review', error: error.message });
  }
};

module.exports = {
  createDeal,
  signDeal,
  getUserDeals,
  getDeal,
  updateDealStatus,
  addPayment,
  addReview
};