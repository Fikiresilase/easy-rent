const express = require('express');
const router = express.Router();
const {
  createDeal,
  signDeal,
  getUserDeals,
  getDeal,
  updateDealStatus,
  addPayment,
  addReview
} = require('../controllers/dealController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');


router.use(auth);
router.get('/', getUserDeals);
router.get('/:id', getDeal);
router.post('/', createDeal);
router.put('/:id/sign', signDeal);
router.put('/:id/status', updateDealStatus);
router.post('/:id/payments', checkRole('user'), addPayment);
router.post('/:id/reviews', addReview);

module.exports = router;