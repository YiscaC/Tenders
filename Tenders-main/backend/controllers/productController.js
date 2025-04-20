// controllers/productController.js
const Product = require('../models/productModel');

// שליפת כל המוצרים מהדאטה בייס
exports.getAllProducts = async (req, res) => {
   try {
      const products = await Product.find({});
      res.json(products);
   } catch (error) {
      res.status(500).send('Error fetching products');
   }
};

