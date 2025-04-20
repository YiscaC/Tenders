
const User = require('../models/userModel');
//const Cart = require('../models/cartModel');
const Auction = require('../models/auctionModel');
const Bid = require('../models/bidModel');

// User Registration
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'כתובת האימייל כבר קיים במערכת ' });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({ message: 'ההרשמה בוצעה בהצלחה' });
  } 
 catch (error) {
  console.error('Registration error:', error);

  if (error.code === 11000) {
    const key = Object.keys(error.keyValue)[0];
    const value = error.keyValue[key];
    return res.status(400).json({ message: `ה-${key} "${value}" כבר קיים במערכת` });
  }

  res.status(500).json({ message: 'שגיאה בהרשמה' });
}

};

// User Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(400).json({ message: 'אימייל או סיסמה לא חוקיים' });
    }

    res.status(200).json({
      message: 'הכניסה בוצעה בהצלחה !!!',
      name: user.name,
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ message: 'Login error' });
  }
};


// Delete User (by email)
exports.delete = async (req, res) => {
  const { email } = req.body;

  try {
    // 1. מחיקת המשתמש
    const result = await User.deleteOne({ email });

    if (result.deletedCount === 0) {
      return res.status(400).json({ message: 'המשתמש לא נמצא' });
    }

    //  מחיקת כל המכרזים שפרסם
    await Auction.deleteMany({ user_email: email });

    //  מחיקת כל ההצעות שהגיש
    await Bid.deleteMany({ userEmail: email });

    res.status(200).json({ message: 'המשתמש וכל הנתונים הקשורים אליו נמחקו בהצלחה' });
  } catch (error) {
    console.error('שגיאה במחיקת המשתמש וכל נתוניו:', error);
    res.status(500).json({ message: 'שגיאה במחיקה' });
  }
};


// Update User Details
exports.updateUser = async (req, res) => {
  const { email } = req.params; // האימייל הנוכחי של המשתמש
  const { name, email: newEmail, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "המשתמש לא נמצא" });
    }

    // ✨ אימייל – חייב להיות ייחודי
    if (newEmail && newEmail !== user.email) {
      const existingWithEmail = await User.findOne({ email: newEmail });
      if (existingWithEmail && existingWithEmail._id.toString() !== user._id.toString()) {
        return res.status(400).json({ error: "אימייל זה כבר קיים במערכת" });
      }
      user.email = newEmail;
    }

    // ✨ שם – לא בודקים אם הוא תפוס
    if (name) {
      user.name = name;
    }

    // ✨ סיסמה – אם נשלחה
    if (password) {
      user.password = password;
    }

    await user.save();

    console.log("✅ המשתמש עודכן בהצלחה:", user);
    res.json({ success: true, message: "המשתמש עודכן בהצלחה" });
  } catch (err) {
    console.error("❌ שגיאה בעדכון המשתמש:", err);
    res.status(500).json({ error: "שגיאה בעדכון המשתמש" });
  }
};
