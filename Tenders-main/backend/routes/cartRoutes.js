const express = require('express');
const router = express.Router();
//const Cart = require('../models/cartModel'); // או השם הנכון לקובץ של סכימת העגלה
const cartController = require('../controllers/cartController');


router.post('/addToCart', cartController.addToCart);
router.get('/cart/:userName', cartController.getCart);
router.post('/updateCartQuantity', cartController.updateCartQuantity);
router.delete('/removeFromCart', cartController.removeFromCart);
router.delete('/clearCart', cartController.clearCart);


module.exports = router;

