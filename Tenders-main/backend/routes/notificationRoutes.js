const express = require("express");
const router = express.Router();
const { checkUserNotifications, markNotificationAsSeen } = require("../controllers/notificationController");
const notificationController = require("../controllers/notificationController");

router.get("/check/:email", checkUserNotifications);
router.post("/mark-seen", markNotificationAsSeen);
router.get("/check-expired", notificationController.handleAuctionClosures);


module.exports = router;
