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

  // ✅ שדות דינמיים לפי קטגוריות:
  material: { type: String },             // jewelry, furniture, toHome
  weight: { type: Number },               // jewelry
  condition: { type: String },            // electronics, musical_instruments, CellPhone
  year_of_manufacture: { type: Number },  // electronics, car
  kilometers: { type: Number },           // car
  dimensions: { type: String },           // furniture, Electrical_appliances, garden
  breed: { type: String },                // animals
  age: { type: Number },                  // animals
  model: { type: String },                // CellPhone
  equipment_type: { type: String },       // sports_and_leisure, office
  brand: { type: String },                // sports_and_leisure, cosmetics, office
  gender: { type: String },               // clothing
  size: { type: String },                 // clothing
  product_type: { type: String },         // cosmetics, babies
  age_range: { type: String },            // babies, games
  instrument_type: { type: String },      // musical_instruments
  usage: { type: String },                // garden
  technique: { type: String },            // art
  year: { type: Number },                 // art, books
  author: { type: String },               // books
  item_type: { type: String },            // toHome
  players: { type: Number },              // games

  // ✅ התראות
  notified: {
    winner: { type: Boolean, default: false },
    owner: { type: Boolean, default: false }
  }

}, { timestamps: true });


const Auction = mongoose.model("Auction", auctionSchema);
module.exports = Auction;
