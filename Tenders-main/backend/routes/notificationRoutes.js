const express = require("express");
const router = express.Router();
const { checkUserNotifications, markNotificationAsSeen } = require("../controllers/notificationController");

router.get("/check/:email", checkUserNotifications);
router.post("/mark-seen", markNotificationAsSeen);

module.exports = router;
