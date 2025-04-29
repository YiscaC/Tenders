const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'y0548493586@gmail.com',
        pass: 'xpdl iyth pynd yzei'  // כאן תכניסי את סיסמת האפליקציה שלך, לא הסיסמה הרגילה
    }
});

module.exports = transporter;
