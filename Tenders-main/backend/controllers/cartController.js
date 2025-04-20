const mongoose = require('mongoose');
const Cart = require('../models/cartModel');


// פונקציה להוספת מוצר לעגלת הקניות
async function addToCart(req, res) {
    try {
        const { userName, productId, productName, productPrice, productImage, quantity } = req.body;

        // הפיכה ל-ObjectId עבור המוצר
        const productObjectId = new mongoose.Types.ObjectId(productId);

        // חיפוש העגלה של המשתמש
        let cart = await Cart.findOne({ userName });

        if (!cart) {
            // אם העגלה לא קיימת, ניצור עגלה חדשה ונוסיף את המוצר
            cart = new Cart({
                userName,
                items: [{
                    productId: productObjectId,
                    productName,
                    productPrice,
                    productImage,
                    quantity
                }]
            });
        } else {
            // אם העגלה קיימת, נבדוק אם המוצר כבר קיים בעגלה
            const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

            if (itemIndex > -1) {
                // אם המוצר כבר קיים בעגלה, נעלה את הכמות שלו
                cart.items[itemIndex].quantity += quantity;
            } else {
                // אם המוצר לא קיים בעגלה, נוסיף אותו כפריט חדש
                cart.items.push({
                    productId: productObjectId,
                    productName,
                    productPrice,
                    productImage,
                    quantity
                });
            }
        }

        // שמירת העגלה המעודכנת
        await cart.save();

        res.status(200).json({ message: 'המוצר נוסף לעגלה', cart });
    } catch (error) {
        // console.error('Error adding item to cart:', error);
        res.status(500).json({ error: 'Error adding item to cart' });
    }
}
//שליפת ההעגלה
const getCart = async (req, res) => {
    const { userName } = req.params;

    try {
        let cart = await Cart.findOne({ userName }).populate('items.productId');

        if (cart) {
            res.status(200).json({ cart });
        } else {
            res.status(404).json({ message: 'העגלה לא נמצאה' });
        }
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'שגיאה בהצגת העגלה', error });
    }
};

const updateCartQuantity = async (req, res) => {
    // שליפת נתוני המשתמש, המוצר והכמות מגוף הבקשה
    const { userName, productId, quantity } = req.body;

    try {
        // חיפוש עגלת הקניות של המשתמש
        let cart = await Cart.findOne({ userName });

        // אם עגלת הקניות נמצאה
        if (cart) {
            // חיפוש המוצר בעגלה לפי ה-productId
            const itemIndex = cart.items.findIndex(item => item.productId == productId);

            // אם המוצר נמצא בעגלה, נעדכן את הכמות שלו
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity = quantity;

                // שמירת העגלה המעודכנת במסד הנתונים
                await cart.save();

                // שליחת תשובה ללקוח שהעגלה עודכנה בהצלחה
                res.status(200).json({ message: 'העגלה עודכנה בהצלחה', cart });
            } else {
                // אם המוצר לא נמצא בעגלה, החזרת הודעת שגיאה
                res.status(404).json({ message: 'המוצר לא נמצא בעגלה' });
            }
        } else {
            // אם לא נמצאה עגלה, החזרת הודעת שגיאה מתאימה
            res.status(404).json({ message: 'העגלה לא נמצאה' });
        }
    } catch (error) {
        // טיפול בשגיאות והחזרת הודעת שגיאה אם התהליך נכשל
        res.status(500).json({ message: 'שגיאה בעדכון העגלה', error });
    }
};
// פונקציה להסרת פריט מעגלת הקניות
const removeFromCart = async (req, res) => {
    console.log('Received request to remove from cart:', req.body); // הוספת לוג
    // שליפת נתוני המשתמש והמוצר מגוף הבקשה
    const { userName, productId } = req.body;

    try {
        // חיפוש עגלת הקניות של המשתמש
        let cart = await Cart.findOne({ userName });

        // אם עגלת הקניות נמצאה, נמשיך לתהליך ההסרה
        if (cart) {
            // סינון כל הפריטים שלא תואמים ל-productId של המוצר המוסר
            cart.items = cart.items.filter(item => item.productId != productId);

            // שמירת עגלת הקניות המעודכנת לאחר הסרת הפריט
            await cart.save();

            // שליחת תשובה ללקוח שהפריט הוסר בהצלחה
            res.status(200).json({ message: 'הפריט הוסר בהצלחה ', cart });
        } else {
            // אם לא נמצאה עגלה, החזרת הודעת שגיאה מתאימה
            res.status(404).json({ message: 'העגלה לא נמצאה' });
        }
    } catch (error) {
        // טיפול בשגיאות והחזרת הודעת שגיאה אם התהליך נכשל
        res.status(500).json({ message: 'שגיאה בהסרת המוצר מהעגלה', error });
    }
};

const clearCart = async (req, res) => {
    const { userName } = req.body;  // קבלת שם המשתמש מה-body

    try {
        // חיפוש עגלת הקניות של המשתמש
        let cart = await Cart.findOne({ userName });

        if (cart) {
            // איפוס עגלת הקניות (מחיקת כל הפריטים)
            cart.items = [];

            // שמירת העגלה הריקה
            await cart.save();

            // שליחת תשובה ללקוח שהעגלה נמחקה בהצלחה
            res.status(200).json({ message: 'העגלה נמחקה בהצלחה', cart });
        } else {
            // אם לא נמצאה עגלה, החזרת הודעת שגיאה מתאימה
            res.status(404).json({ message: 'העגלה לא נמצאה' });
        }
    } catch (error) {
        // טיפול בשגיאות והחזרת הודעת שגיאה אם התהליך נכשל
        res.status(500).json({ message: 'שגיאה במחיקת העגלה', error });
    }
};
module.exports = {
    addToCart,
    getCart,
    updateCartQuantity,
    removeFromCart,
    clearCart
};