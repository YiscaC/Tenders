const Bid = require("../models/bidModel");
const User = require("../models/userModel");
const transporter = require('../mailer'); // ודאי שהנתיב נכון בהתאם למיקום הקובץ שלך


exports.submitBid = async (req, res) => {
  const { auctionId, userEmail, amount } = req.body;

  if (!auctionId || !userEmail || !amount) {
    return res.status(400).json({ error: "שדות חסרים" });
  }

  try {
    // שלב 1: שמירת ההצעה למסד הנתונים
    const newBid = new Bid({ auctionId, userEmail, amount });
    await newBid.save();

    // שלב 2: שליפת מציעים קודמים (למעט המשתמש הנוכחי)
    const previousBidders = await Bid.find({
      auctionId: auctionId,
      userEmail: { $ne: userEmail }
    }).distinct('userEmail');

    const auction = await Auction.findById(auctionId);

    // שלב 3: שליחת מיילים למציעים הקודמים
    for (let email of previousBidders) {
      console.log("🧾 auctionId:", auctionId);
console.log("📦 שם מוצר למייל:", auction?.product_name);

      await transporter.sendMail({
        from: '"Tenders Notification" <y0548493586@gmail.com>', // ← החליפי לכתובת המייל שלך
        to: email,
        subject: "📢 הוגשה הצעת מחיר חדשה למכרז שהתעניינת בו",
        html: `
          <div dir="rtl" style="font-family:Arial, sans-serif; text-align:right; font-size:16px;">
            משתמש נוסף הגיש הצעה חדשה למכרז <strong>${auction.product_name}</strong> שהשתתפת בו.<br>
            אם את/ה מעוניין לזכות – היכנס עכשיו והגש הצעה גבוהה יותר.<br><br>
            <a href="http://localhost:3001/?clearLogin=true" target="_blank">לחץ כאן כדי להיכנס לאתר</a>
          </div>
        `
      });
    }

    // שלב 4: תגובה ללקוח
    res.status(201).json({ message: "ההצעה נשמרה בהצלחה!" });

  } catch (error) {
    console.error("❌ שגיאה בשמירת ההצעה או בשליחת מייל:", error);
    res.status(500).json({ error: "שגיאה בשרת" });
  }
};


// ✅ פונקציה לשליפת ההצעה הגבוהה ביותר למכרז מסוים
exports.getHighestBid = async (req, res) => {
  const { auctionId } = req.params;
  console.log("🚀 התחלת getHighestBid עבור auctionId:", auctionId);

  try {
    const highestBid = await Bid.find({ auctionId })
      .sort({ amount: -1 })
      .limit(1);
      console.log("🔍 highestBid שהתקבל:", highestBid);
    if (highestBid.length === 0) {
        console.log("📭 אין הצעות עבור המכרז");
      return res.json({ highest: null }); // אין הצעות עדיין
    }
    res.json({ highestBid: highestBid[0].amount });

  } catch (error) {
    console.error("שגיאה בשליפת ההצעה הגבוהה:", error);
    res.status(500).json({ error: "שגיאה בשרת" });
  }
};
const Auction = require("../models/auctionModel");

exports.getBidsByUser = async (req, res) => {
  const email = req.params.email;

  try {
    const bids = await Bid.find({ userEmail: email }).populate("auctionId");

    // קיבוץ לפי מכרז
    const grouped = {};

    bids.forEach(bid => {
      if (!bid.auctionId) return; // הגנה אם המכרז נמחק

      const auctionId = bid.auctionId._id.toString();

      if (!grouped[auctionId]) {
        grouped[auctionId] = {
          auction: bid.auctionId.toObject(),
          bids: []
        };
      }

      grouped[auctionId].bids.push({
        amount: bid.amount,
        createdAt: bid.createdAt
      });
    });

    // הפיכת האובייקט למערך
    const response = Object.values(grouped);

    res.json(response);
  } catch (err) {
    console.error("שגיאה בשליפת הצעות:", err);
    res.status(500).json({ error: "שגיאה בשליפת הצעות" });
  }
};




exports.getWonAuctionsByUser = async (req, res) => {
  const { email } = req.params;

  try {
    const now = new Date();

    const allAuctions = await Auction.find().lean();
    const endedAuctions = allAuctions.filter(a => {
      const end = new Date(a.createdAt);
      end.setDate(end.getDate() + a.duration_days);
      return now > end;
    });

    const auctionIds = endedAuctions.map(a => a._id);
    const bids = await Bid.find({ auctionId: { $in: auctionIds } });

    const won = [];

    for (const auctionId of auctionIds) {
      const bidsForAuction = bids.filter(b => b.auctionId.toString() === auctionId.toString());
      if (bidsForAuction.length === 0) continue;

      const highestBid = bidsForAuction.reduce((max, b) => b.amount > max.amount ? b : max, bidsForAuction[0]);
      if (highestBid.userEmail === email) {
        const auction = endedAuctions.find(a => a._id.toString() === auctionId.toString());
        if (auction) {
          won.push({
            ...auction,
            amount: highestBid.amount, // 💰 סכום הזכייה
            publisherName: auction.user_name,   // 👤 שם המפרסם
            publisherEmail: auction.user_email  // 📧 מייל המפרסם
          });
        }
      }
    }

    res.json(won);
  } catch (error) {
    console.error("❌ שגיאה בשליפת זכיות:", error);
    res.status(500).json({ error: "שגיאה בשליפת מכרזים שזכית בהם" });
  }
};

exports.checkEndedAuctionsNotifications = async (req, res) => {
  const { email } = req.params;
  const now = new Date();

  try {
    const allAuctions = await Auction.find().lean();
    const ended = allAuctions.filter(a => {
      const end = new Date(a.createdAt);
      end.setDate(end.getDate() + a.duration_days);
      return now > end;
    });

    const bids = await Bid.find({ auctionId: { $in: ended.map(a => a._id) } });

    const winnerNotifications = [];
    const publisherNotifications = [];

    for (const auction of ended) {
      const auctionBids = bids.filter(b => b.auctionId.toString() === auction._id.toString());
      if (!auctionBids.length) continue;

      const highest = auctionBids.reduce((max, b) => b.amount > max.amount ? b : max, auctionBids[0]);

      if (highest.userEmail === email && !auction.notifiedToWinner) {
        winnerNotifications.push({ auctionId: auction._id, product_name: auction.product_name, amount: highest.amount });
      }

      if (auction.user_email === email && !auction.notifiedToPublisher) {
        const winnerEmail = highest.userEmail;
        publisherNotifications.push({ auctionId: auction._id, product_name: auction.product_name, winnerEmail });
      }
    }

    res.json({ winnerNotifications, publisherNotifications });
  } catch (err) {
    console.error("❌ שגיאה בבדיקת הודעות:", err);
    res.status(500).json({ error: "שגיאה בבדיקת התראות" });
  }
};

// הצגת רשימת ההצעות למשתמש שהעלה את המכרז
exports.getBidsByAuction = async (req, res) => {
  try {
    const bids = await Bid.find({ auctionId: req.params.auctionId });

    // מצרפים שם משתמש לכל הצעה על פי userEmail
    const enrichedBids = await Promise.all(bids.map(async bid => {
      const user = await User.findOne({ email: bid.userEmail });
      return {
        ...bid.toObject(),
        userName: user ? user.name : "משתמש לא מזוהה"
      };
    }));

    res.json(enrichedBids);
  } catch (err) {
    console.error("❌ שגיאה בשליפת הצעות:", err);
    res.status(500).json({ message: 'שגיאה בשליפת הצעות' });
  }
};

exports.getHighestBidByAuction = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const bid = await Bid.findOne({ auctionId }).sort({ amount: -1 });

    if (!bid) {
      return res.status(404).json({ message: "לא נמצאה הצעה גבוהה." });
    }

    // שליפת שם המשתמש לפי האימייל
    const user = await User.findOne({ email: bid.userEmail });

    return res.json({
      highestBid: bid.amount,
      userName: user ? user.name : "משתמש לא מזוהה",
      winnerEmail: bid.userEmail
    });
  } catch (err) {
    console.error("שגיאה בקבלת ההצעה הגבוהה:", err);
    res.status(500).json({ message: "שגיאה בשרת" });
  }
};




