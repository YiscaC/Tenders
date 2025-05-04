// notificationController.js
const Auction = require("../models/auctionModel");
const Bid = require("../models/bidModel");
const transporter = require("../mailer");


exports.checkUserNotifications = async (req, res) => {
    const email = req.params.email;
    const now = new Date();

    try {
        const auctions = await Auction.find();
        const endedAuctions = auctions.filter(a => {
            const end = new Date(a.createdAt);
            end.setDate(end.getDate() + a.duration_days);
            return now > end;
        });

        const bids = await Bid.find({ auctionId: { $in: endedAuctions.map(a => a._id) } });

        const notifications = [];

        for (const auction of endedAuctions) {
            const auctionBids = bids.filter(b => b.auctionId.toString() === auction._id.toString());
            if (auctionBids.length === 0) continue;

            const highest = auctionBids.reduce((max, b) => b.amount > max.amount ? b : max, auctionBids[0]);

           
 // אם המשתמש הזוכה לא קיבל התראה
if (highest.userEmail === email && (!auction.notified?.winner)) {
    notifications.push({
        type: "win",
        product: auction.product_name,
        price: highest.amount,
        auctionId: auction._id
    });
}

// אם מפרסם המכרז לא קיבל התראה
if (auction.user_email === email && (!auction.notified?.owner)) {
    notifications.push({
        type: "owner",
        product: auction.product_name,
        winnerEmail: highest.userEmail,
        price: highest.amount,
        auctionId: auction._id
    });


}
        }
        



        res.json(notifications);
    } catch (error) {
        console.error("שגיאה בבדיקת התראות:", error);
        res.status(500).json({ error: "שגיאה בבדיקת התראות" });
    }
};

// עדכון התראה כ"נראתה"
exports.markNotificationAsSeen = async (req, res) => {
    const { auctionId, type } = req.body;

    try {
        if (type === "win") {
            await Auction.updateOne(
                { _id: auctionId },
                { $set: { "notified.winner": true } }
            );
        } else if (type === "owner") {
            await Auction.updateOne(
                { _id: auctionId },
                { $set: { "notified.owner": true } }
            );
        }

        res.json({ message: "התראה סומנה כנראתה" });
    } catch (error) {
        console.error("שגיאה בעדכון התראה:", error);
        res.status(500).json({ error: "שגיאה בעדכון התראה" });
    }
};
exports.handleAuctionClosures = async (req, res) => {
    const now = new Date();
  
    try {
      const auctions = await Auction.find();
      const endedAuctions = auctions.filter(a => {
        const end = new Date(a.createdAt);
        end.setDate(end.getDate() + a.duration_days);
        return now > end;
      });
  
      const bids = await Bid.find({ auctionId: { $in: endedAuctions.map(a => a._id) } });
  
      for (const auction of endedAuctions) {
        const auctionBids = bids.filter(b => b.auctionId.toString() === auction._id.toString());
        if (auctionBids.length === 0) continue;
  
        const highest = auctionBids.reduce((max, b) => b.amount > max.amount ? b : max, auctionBids[0]);
  
        if (!auction.notified?.owner && auction.user_email) {
                        // ✅ עדכון שהתבצעה שליחה
                        await Auction.updateOne(
                            { _id: auction._id },
                            { $set: { "notified.owner": true } }
                        );
          await transporter.sendMail({
            from: 'Tenders Notification <your.email@gmail.com>',
            to: auction.user_email,
            subject: "📢 המכרז שלך הסתיים!",
            html: `
              <div dir="rtl" style="font-family:Arial; text-align:right;">
                המכרז שלך עבור <strong>${auction.product_name}</strong> הסתיים.<br>
                הזוכה הוא: ${highest.userEmail} עם הצעה של ₪${highest.amount}.<br><br>
                <a href="http://localhost:3001/login.html?clearLogin=true" target="_blank">לצפייה בפרטי המכרז</a>
              </div>`
          });

        }
  
        if (!auction.notified?.winner && highest.userEmail) {
            await Auction.updateOne(
                { _id: auction._id },
                { $set: { "notified.winner": true } }
              );
          await transporter.sendMail({
            from: 'Tenders Notification <your.email@gmail.com>',
            to: highest.userEmail,
            subject: "🎉 זכית במכרז!",
            html: `
              <div dir="rtl" style="font-family:Arial; text-align:right;">
                ברכות! זכית במכרז עבור <strong>${auction.product_name}</strong> בסכום של ₪${highest.amount}.<br>
                <a href="http://localhost:3001/login.html?clearLogin=true" target="_blank">לצפייה בזכיות שלך</a>
              </div>`
          });

          
        }
  
      }
  
      res.json({ message: "סיום מכרזים וטיפול במיילים הושלם" });
    } catch (err) {
      console.error("שגיאה בסיום מכרזים:", err);
      res.status(500).json({ error: "שגיאה בטיפול במכרזים שהסתיימו" });
    }
  };
  
