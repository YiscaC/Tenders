process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs'); 
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const bidRoutes = require('./routes/bidRoutes');
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();
const port = 3001;

// 📌 **בדיקה אם תיקיית uploads קיימת - ואם לא, יוצרים אותה**
const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("📁 תיקיית 'uploads' נוצרה!");
}


// Middleware for static files and JSON parsing
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(cors());
app.use(bodyParser.json());
// ✅ **הפיכת תיקיית uploads לציבורית - לאחר שווידאנו שהיא קיימת**
//app.use("/uploads", express.static("uploads"));
// 📌 הפיכת תקיית uploads לסטטית כדי לאפשר גישה לתמונות
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// חיבור למסד הנתונים
async function connectToMongoDB() {
    try {
        await mongoose.connect('mongodb+srv://lilachshekter:5rX3jJ3e@cluster0.6ctfz.mongodb.net/shop');
        console.log("Connected to MongoDB with mongoose");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

// Middleware to log requests
app.use((req, res, next) => {
    console.log(`📢 התקבלה בקשה: ${req.method} ${req.url}`);
    next();
});

// Routes

app.use('/api', userRoutes);
app.use('/api', productRoutes);
app.use('/api', cartRoutes);
app.use('/api', auctionRoutes);
app.use('/api/bids', bidRoutes); 
//app.use("/api/notifications", notificationRoutes);
app.use("/api/notifications", require("./routes/notificationRoutes"));

// Define the home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/home.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

// התחברות ל-MongoDB
connectToMongoDB();
