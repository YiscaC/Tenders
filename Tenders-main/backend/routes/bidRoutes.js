const express = require("express");
const router = express.Router();
const bidController = require("../controllers/bidController");

// שליפת ההצעה הגבוהה ביותר
router.get("/highest/:auctionId", bidController.getHighestBid);

// שמירת הצעת מחיר
router.post("/submit", bidController.submitBid);
router.get('/by-user/:email', bidController.getBidsByUser);
router.get('/wins/:email', bidController.getWonAuctionsByUser);
// routes/notificationRoutes.js
// routes/bidRoutes.js
router.get('/by-auction/:auctionId', bidController.getBidsByAuction);



module.exports = router;
