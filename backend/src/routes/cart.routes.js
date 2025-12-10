const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.get('/:userId', cartController.getCart);
router.post('/add', cartController.addToCart);
router.post('/sync', cartController.syncCart);
router.post("/remove", cartController.removeCartItem);

module.exports = router;
