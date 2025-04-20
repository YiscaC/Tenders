// ----- auctionRoutes.js -----
const express = require("express");
const router = express.Router();
const auctionController = require("../controllers/auctionController");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.post("/auctions", upload.single("image"), auctionController.createAuction);
router.get("/auctions", auctionController.getAllAuctions);
router.get('/auctions/user/email/:email', auctionController.getAuctionsByEmail);
router.get("/auctions/:id", auctionController.getAuctionById);
router.put("/auctions/:id", upload.single("image"), auctionController.updateAuction);
router.delete("/auctions/:id", auctionController.deleteAuction);
//router.get('/auctions/user/:name', auctionController.getAuctionsByUser);
//router.get('/user/email/:email', auctionController.getAuctionsByUser);


module.exports = router;
