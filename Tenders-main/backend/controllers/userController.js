const User = require('../models/userModel');
const Auction = require('../models/auctionModel');
const Bid = require('../models/bidModel');
const { OAuth2Client } = require('google-auth-library');
const transporter = require('../mailer');

const googleClient = new OAuth2Client("119189325747-a84euov4bs6253ns12uuc1ii5fa8svcn.apps.googleusercontent.com");

// שמירת קודי אימות בזיכרון זמני
const verificationCodes = {};

// שלב 1: שליחת קוד אימות למייל
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'כתובת האימייל כבר קיימת במערכת' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    verificationCodes[email] = {
      code,
      name,
      password,
      expires: Date.now() + 10 * 60 * 1000
    };

    await transporter.sendMail({
      from: '"Tenders Notification" <y0548493586@gmail.com>',
      to: email,
      subject: 'קוד אימות לאתר Tenders',
      html: `<p>שלום ${name},</p><p>קוד האימות שלך הוא: <b>${code}</b></p>`
    });

    res.status(200).json({ message: 'נשלח קוד אימות למייל' });
  } catch (error) {
    console.error('שגיאה בשליחת מייל:', error);
    res.status(500).json({ message: 'שגיאה בשליחת אימייל אימות' });
  }
};

// שלב 2: השלמת הרשמה עם הקוד
exports.registerWithCode = async (req, res) => {
  const { email, code, name, password } = req.body;
  const record = verificationCodes[email];
  
  if (!record || record.code !== code || record.expires < Date.now()) {
    return res.status(400).json({ message: 'קוד לא תקף או שפג תוקפו' });
  }

  try {
    const newUser = new User({
      name,
      email,
      password,
      authProvider: 'local'
    });
    
   
    await newUser.save();
    delete verificationCodes[email];

    res.status(201).json({ message: 'ההרשמה הושלמה', name: newUser.name, email });
  } catch (error) {
    console.error('שגיאה בהרשמה עם קוד:', error);
    res.status(500).json({ message: 'שגיאה בהרשמה' });
  }
};

// התחברות רגילה
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'אימייל לא קיים במערכת' });
    }

    if (user.authProvider === 'google') {
      return res.status(403).json({ message: 'המשתמש נרשם עם Google – התחבר דרך כפתור Google בלבד' });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: 'סיסמה שגויה' });
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

// התחברות עם גוגל
exports.googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: "119189325747-a84euov4bs6253ns12uuc1ii5fa8svcn.apps.googleusercontent.com"
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        password: 'google-auth',
        authProvider: 'google'
      });
      await user.save();
    }

    res.status(200).json({ name: user.name, email: user.email });
  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(401).json({ message: "אימות Google נכשל" });
  }
};

// מחיקת משתמש לפי מייל
exports.delete = async (req, res) => {
  const { email } = req.body;

  try {
    const result = await User.deleteOne({ email });

    if (result.deletedCount === 0) {
      return res.status(400).json({ message: 'המשתמש לא נמצא' });
    }

    await Auction.deleteMany({ user_email: email });
    await Bid.deleteMany({ userEmail: email });

    res.status(200).json({ message: 'המשתמש וכל הנתונים הקשורים אליו נמחקו בהצלחה' });
  } catch (error) {
    console.error('שגיאה במחיקת המשתמש:', error);
    res.status(500).json({ message: 'שגיאה במחיקה' });
  }
};

// עדכון פרטי משתמש
exports.updateUser = async (req, res) => {
  const { email } = req.params;
  const { name, email: newEmail, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "המשתמש לא נמצא" });
    }

    if (newEmail && newEmail !== user.email) {
      const existingWithEmail = await User.findOne({ email: newEmail });
      if (existingWithEmail && existingWithEmail._id.toString() !== user._id.toString()) {
        return res.status(400).json({ error: "אימייל זה כבר קיים במערכת" });
      }
      user.email = newEmail;
    }

    if (name) {
      user.name = name;
    }

    if (password) {
      user.password = password;

      if (user.authProvider === 'google') {
        user.authProvider = 'local';
      }
    }

    await user.save();

    res.json({ success: true, message: "המשתמש עודכן בהצלחה" });
  } catch (err) {
    console.error("❌ שגיאה בעדכון המשתמש:", err);
    res.status(500).json({ error: "שגיאה בעדכון המשתמש" });
  }
};


