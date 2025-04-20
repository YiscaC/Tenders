// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// ניתוב לשליפת כל המוצרים
router.get('/products', productController.getAllProducts);

module.exports = router;

