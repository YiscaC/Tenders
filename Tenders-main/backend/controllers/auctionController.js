// ----- auctionController.js -----
const Auction = require("../models/auctionModel");

const createAuction = async (req, res) => {
    try {
        const { user_name, user_email, category, product_name, description, starting_price, duration_days } = req.body;

        if (!user_name || !category || !product_name || !starting_price || !duration_days) {
            return res.status(400).json({ error: "אנא מלא את כל השדות החיוניים" });
        }

        let parsedFields = {};
        if (req.body.dynamicFields) {
            try {
                parsedFields = JSON.parse(req.body.dynamicFields);
            } catch (error) {
                return res.status(400).json({ error: "שגיאה בפענוח השדות הדינמיים" });
            }
        }

        const image_url = req.file ? `http://localhost:3001/uploads/${req.file.filename}` : "";

        const newAuction = new Auction({
            user_name,
            user_email,
            category,
            product_name,
            description,
            starting_price,
            duration_days,
            image_url,
            ...parsedFields
        });

        await newAuction.save();
        res.status(201).json({ message: "המכרז נוסף בהצלחה!", auction: newAuction });

    } catch (error) {
        res.status(500).json({ error: "שגיאה ביצירת מכרז" });
    }
};

const getAllAuctions = async (req, res) => {
    try {
        const auctions = await Auction.find();
        res.json(auctions);
    } catch (error) {
        res.status(500).json({ error: "שגיאה בשליפת מכרזים" });
    }
};

const getAuctionById = async (req, res) => {
    try {
        const auction = await Auction.findById(req.params.id);
        if (!auction) return res.status(404).json({ error: "מכרז לא נמצא" });
        res.json(auction);
    } catch (error) {
        res.status(500).json({ error: "שגיאה בשליפת מכרז" });
    }
};

const deleteAuction = async (req, res) => {
    try {
        const auction = await Auction.findByIdAndDelete(req.params.id);
        if (!auction) return res.status(404).json({ error: "מכרז לא נמצא" });
        res.json({ message: "מכרז נמחק בהצלחה!" });
    } catch (error) {
        res.status(500).json({ error: "שגיאה במחיקת מכרז" });
    }
};
const getAuctionsByUser = async (req, res) => {
    const { email  } = req.params;
    console.log("🔍 מחפש מכרזים עבור:", userName);
    try {
        const auctions = await Auction.find({ user_email: email });
        console.log("🔎 נמצא:", auctions.length, "מכרזים");
        res.json(auctions);
    } catch (error) {
        console.error("❌ שגיאה בשליפת מכרזים של המשתמש", error);
        res.status(500).json({ error: "שגיאה בשליפת מכרזים של המשתמש" });
    }
};
const getAuctionsByEmail = async (req, res) => {
    const { email } = req.params;
    try {
        const auctions = await Auction.find({ user_email: email });
        res.json(auctions);
    } catch (error) {
        console.error("❌ שגיאה בשליפת מכרזים לפי אימייל:", error);
        res.status(500).json({ error: "שגיאה בשליפת מכרזים לפי אימייל" });
    }
};
const updateAuction = async (req, res) => {
    try {
        const auctionId = req.params.id;

        let parsedFields = {};
        if (req.body.dynamicFields) {
            try {
                parsedFields = JSON.parse(req.body.dynamicFields);
            } catch (error) {
                return res.status(400).json({ error: "שגיאה בפענוח שדות דינמיים" });
            }
        }

        const updatedData = {
            user_name: req.body.user_name,
            user_email: req.body.user_email,
            category: req.body.category,
            product_name: req.body.product_name,
            description: req.body.description,
            starting_price: req.body.starting_price,
            duration_days: req.body.duration_days,
            ...parsedFields
        };

        if (req.file) {
            updatedData.image_url = `http://localhost:3001/uploads/${req.file.filename}`;
        }

        const updatedAuction = await Auction.findByIdAndUpdate(auctionId, updatedData, { new: true });

        if (!updatedAuction) {
            return res.status(404).json({ error: "מכרז לא נמצא לעדכון" });
        }

        res.json({ message: "המכרז עודכן בהצלחה", auction: updatedAuction });
    } catch (error) {
        console.error("שגיאה בעדכון מכרז:", error);
        res.status(500).json({ error: "שגיאה בעדכון מכרז" });
    }
};

  
  module.exports = {
      createAuction,
      getAllAuctions,
      getAuctionById,
      deleteAuction,
      getAuctionsByUser, // ✅ עכשיו הפונקציה מוגדרת כמשתנה
      getAuctionsByEmail,
      updateAuction
  };
  