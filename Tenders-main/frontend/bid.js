document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const productName = params.get('name');
  const productImage = params.get('image');
  const startingPrice = parseFloat(params.get('price'));

  document.getElementById('productName').textContent = productName;
  document.getElementById('productImage').src = productImage;
  document.getElementById('startingPrice').textContent = startingPrice;

  const form = document.getElementById('bidForm');
  const errorMsg = document.getElementById('errorMsg');

  // 🟢 יצירת אלמנט להצגת ההצעה הגבוהה ביותר
  const highestBidEl = document.createElement("p");
  highestBidEl.className = "fw-bold";
  document.querySelector(".bid-container").insertBefore(highestBidEl, form);

  // 🟡 שליפת ההצעה הגבוהה ביותר
  let currentMax = startingPrice;
  try {
    const res = await fetch(`http://localhost:3001/api/bids/highest/${params.get('id')}`);
    const data = await res.json();
    if (data.highestBid !== null && data.highestBid !== undefined) {
      currentMax = data.highestBid;
      highestBidEl.textContent = `ההצעה הגבוהה ביותר: ₪${currentMax}`;
    } else {
      highestBidEl.textContent = `עדיין לא הוגשה הצעת מחיר למוצר זה.`;
    }
  } catch (err) {
    console.error("שגיאה בשליפת ההצעה הגבוהה ביותר:", err);
    highestBidEl.textContent = "שגיאה בטעינת ההצעה הגבוהה ביותר.";
  }

  // 🧾 שליחת טופס
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errorMsg.textContent = '';

    const bidAmount = parseFloat(document.getElementById('bidAmount').value);
    const cardNumber = form.querySelector('input[placeholder="מספר כרטיס"]').value.trim();
    const expiry = form.querySelector('input[placeholder="תוקף (MM/YY)"]').value.trim();
    const cvv = form.querySelector('input[placeholder="CVV"]').value.trim();

    // 🔴 בדיקת סכום הצעה
    if (isNaN(bidAmount) || bidAmount <= currentMax) {
      errorMsg.textContent = `ההצעה שלך חייבת להיות גבוהה מ־₪${currentMax}`;
      return;
    }

    // בדיקת כרטיס אשראי
    const cardRegex = /^\d{16}$/;
    if (!cardRegex.test(cardNumber)) {
      errorMsg.textContent = 'מספר הכרטיס חייב להכיל בדיוק 16 ספרות.';
      return;
    }

    // בדיקת תוקף
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test(expiry)) {
      errorMsg.textContent = 'תוקף הכרטיס חייב להיות בפורמט MM/YY.';
      return;
    }

    const [expMonth, expYear] = expiry.split('/').map(Number);
    const now = new Date();
    const expiryDate = new Date(2000 + expYear, expMonth);
    if (expiryDate < now) {
      errorMsg.textContent = 'תוקף הכרטיס פג.';
      return;
    }

    // בדיקת CVV
    if (!/^\d{3}$/.test(cvv)) {
      errorMsg.textContent = 'CVV חייב להיות מורכב מ-3 ספרות.';
      return;
    }

    // ✅ שליחת הצעה
    const email = localStorage.getItem("userEmail");
    fetch('http://localhost:3001/api/bids/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auctionId: params.get('id'),
        userEmail: email,
        amount: bidAmount
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        errorMsg.textContent = data.error;
      } else {
        alert('ההצעה נשמרה בהצלחה!');
        form.reset();
        window.location.href = "home.html";
      }
    })
    .catch(err => {
      console.error("שגיאה בשליחת ההצעה:", err);
      errorMsg.textContent = "שגיאה בשליחת ההצעה לשרת";
    });
  });
});
