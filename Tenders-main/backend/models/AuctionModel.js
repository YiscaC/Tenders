// ----- auctionModel.js -----
const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema({
    user_name: { type: String, required: true },
    user_email: { type: String, required: true },
    category: { type: String, required: true },
    product_name: { type: String, required: true },
    description: { type: String, required: true },
    starting_price: { type: Number, required: true },
    duration_days: { type: Number, required: true },
    image_url: { type: String, required: true },
    material: { type: String },
    weight: { type: Number },
    condition: { type: String },
    year_of_manufacture: { type: Number },
    kilometers: { type: Number },
    dimensions: { type: String },
    breed: { type: String },
    age: { type: Number },
    notified: {
        winner: { type: Boolean, default: false },
        owner: { type: Boolean, default: false }
      }
      

}, { timestamps: true });

const Auction = mongoose.model("Auction", auctionSchema);
module.exports = Auction;
