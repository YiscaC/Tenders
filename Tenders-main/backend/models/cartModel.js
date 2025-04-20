const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, required: true },
        productName: { type: String, required: true },
        productPrice: { type: Number, required: true },
        productImage: { type: String, required: true },
        quantity: { type: Number, required: true },
    }],
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
