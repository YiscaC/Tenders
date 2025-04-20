const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema({
  auctionId: { type: mongoose.Schema.Types.ObjectId, ref: "Auction", required: true },
  userEmail: { type: String, required: true },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Bid = mongoose.model("Bid", bidSchema);
module.exports = Bid;
