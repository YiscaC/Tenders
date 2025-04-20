const mongoose = require('mongoose');

// סכמה לפרודוקטים
const productSchema = new mongoose.Schema({
   name: { type: String, required: true },
   price: { type: Number, required: true },
   image: String,
   type: String,
   description: String,
     
});

// יצירת מודל
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
