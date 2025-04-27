

console.log("📢 publish-tender.js נטען בהצלחה!");
const urlParams = new URLSearchParams(window.location.search);
const isEditMode = urlParams.get("edit") === "true";
const auctionId = urlParams.get("id");

document.addEventListener("DOMContentLoaded", () => {
    if (isEditMode && auctionId) {
        fetch(`http://localhost:3001/api/auctions/${auctionId}`)
            .then(res => res.json())
            .then(data => {
                document.getElementById("productName").value = data.product_name || "";
                document.getElementById("productDescription").value = data.description || "";
                document.getElementById("startingPrice").value = data.starting_price || "";
                document.getElementById("auctionDuration").value = data.duration_days || "";

                for (let key in data) {
                    const input = document.getElementById(key);
                    if (input) {
                        input.value = data[key];
                    }
                }

                // ✅ הסתרת תשלום והוספת כפתור "שמור"
                document.getElementById("payment-form").style.display = "none";
                document.getElementById("open-payment-form").style.display = "none";

                const saveBtn = document.createElement("button");
                saveBtn.id = "save-changes-button";
                saveBtn.className = "btn btn-success w-100 mt-3";
                saveBtn.textContent = "💾 שמור שינויים";
                saveBtn.addEventListener("click", handleUpdateAuction);

                document.querySelector(".auction-container").appendChild(saveBtn);
            })
            .catch(err => console.error("❌ שגיאה בטעינת מכרז לעריכה", err));
    }
});

document.addEventListener("DOMContentLoaded", function () {
    console.log("📢 הדף נטען בהצלחה!");

    function setupFormListener() {
        const form = document.getElementById("auction-form");
        if (!form) {
            console.error("❌ טופס המכרז לא נמצא! משהו מוחק אותו?");
            return;
        }

        // בדיקה אם כבר נוסף מאזין
        if (form.dataset.listener === "true") {
            console.warn("⚠️ מאזין כבר נוסף לטופס, לא מוסיף שוב.");
            return;
        }

        form.dataset.listener = "true"; // סימון שהמאזין נוסף
        console.log("✅ טופס נמצא והמאזין נוסף!");

        form.addEventListener("submit", async function (event) {
            console.log("🟢 כפתור 'פרסם מכרז' נלחץ!");
            event.preventDefault();

            const user = JSON.parse(localStorage.getItem("user"));
            if (!user) return alert("❌ עליך להתחבר כדי לפרסם מכרז!");

            const form = document.getElementById("auction-form");
            const formData = new FormData(form); // יוצר אובייקט FormData

            formData.append("user_name", user.name);
            formData.append("user_email", user.email); // ❌ חסר!
            formData.append("category", new URLSearchParams(window.location.search).get("category"));
            formData.append("product_name", document.getElementById("productName").value.trim());
            formData.append("description", document.getElementById("productDescription").value.trim());
            formData.append("starting_price", document.getElementById("startingPrice").value.trim());
            formData.append("duration_days", document.getElementById("auctionDuration").value.trim());
            formData.append("image", document.getElementById("productImage").files[0]); // ✅ שולח תמונה

            console.log("📦 נתונים שנשלחים לשרת:");
            for (let pair of formData.entries()) {
                console.log(pair[0], ":", pair[1]); // תבדקי אם "image" מופיע כאן
            }
            let dynamicFields = {}; 

            const inputs = document.querySelectorAll("#dynamic-questions input");
            console.log("🔎 מספר שדות דינמיים שנמצאו:", inputs.length);
            
            inputs.forEach(input => {
                if (input.id.trim() !== "" && input.value.trim() !== "") { // ✅ לוודא שיש `id` ולוודא שהערך לא ריק
                    dynamicFields[input.id] = input.value.trim();
                    console.log("📝 שדה דינמי שנשלח:", input.id, "ערך:", input.value.trim());
                } else {
                    console.warn("⚠️ שדה דינמי עם בעיה - אין לו `id` או שהוא ריק:", input);
                }
            });
            
            // ✅ אם אין שדות דינמיים בכלל, נציג אזהרה
            if (Object.keys(dynamicFields).length === 0) {
                console.warn("❌ אין שדות דינמיים שנשלחו! כנראה שהם לא מוגדרים נכון.");
            }
            
            formData.append("dynamicFields", JSON.stringify(dynamicFields));

           // console.log("📦 נתונים שנשלחים לשרת:");
          //  for (let pair of formData.entries()) {
          //      console.log(pair[0] + ": ", pair[1]);
          //  }
         //   console.log("📷 תמונה שנשלחת:", document.getElementById("productImage").files[0]); 

         try {
            const response = await fetch("http://localhost:3001/api/auctions", {
                method: "POST",
                body: formData // ⬅️ שולח כ-FormData, השרת יזהה אוטומטית שזה `multipart/form-data`
            });
        
            if (response.ok) {
                setTimeout(() => {
                    window.location.href = "home.html";
                }, 3000);
            } else {
                const errorData = await response.json();
                alert("❌ שגיאה בפרסום: " + errorData.error);
            }
        } 
         catch (error) {
                console.error("❌ שגיאה בשליחת הטופס:", error);
                alert("❌ אירעה שגיאה בפרסום.");
            }
        });
    }

    setupFormListener();

    // מעקב אחר שינויים ב-DOM כדי להוסיף מחדש מאזין במקרה שהאלמנט נטען מחדש
    const observer = new MutationObserver(() => {
        setupFormListener();
    });

    observer.observe(document.body, { childList: true, subtree: true });
});



document.addEventListener("DOMContentLoaded", function () {
    console.log("📢 הדף נטען בהצלחה!");

    // קבלת אלמנטים
    const paymentForm = document.getElementById("payment-form");
    const openPaymentButton = document.getElementById("open-payment-form");
    const cardNumber = document.getElementById("card-number");
    const cardExpiry = document.getElementById("card-expiry");
    const cardCVV = document.getElementById("card-cvv");
    const cardHolder = document.getElementById("card-holder");
    const confirmPaymentButton = document.getElementById("confirm-payment-button");
    const publishButton = document.getElementById("publish-button");

    // כאשר לוחצים על "שלם עכשיו" - מציגים את טופס התשלום
    openPaymentButton.addEventListener("click", function () {
        paymentForm.style.display = "block"; // מציג את טופס התשלום
        openPaymentButton.style.display = "none"; // מסתיר את כפתור התשלום
    });

        // בדיקה על תוקף כרטיס
        function isValidExpiry(expiry) {
            const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
            if (!expiryRegex.test(expiry)) return false;
            const [expMonth, expYear] = expiry.split('/').map(Number);
            const now = new Date();
            const expiryDate = new Date(2000 + expYear, expMonth);
            return expiryDate >= now;
        }

    // פונקציה לבדוק אם כל השדות מלאים
    function checkPaymentFields() {
        // קבלת ערכי השדות
    const productName = document.getElementById("productName").value.trim();
    const productDescription = document.getElementById("productDescription").value.trim();
    const startingPrice = document.getElementById("startingPrice").value.trim();
    const auctionDuration = document.getElementById("auctionDuration").value.trim();
    const productImage = document.getElementById("productImage").files.length > 0; // לבדוק אם הועלתה תמונה
    const checkbox1 = document.getElementById("terms-1").checked;
    const checkbox2 = document.getElementById("terms-2").checked;

    const cardValid = /^\d{16}$/.test(cardNumber.value.trim());
    const expiryValid = isValidExpiry(cardExpiry.value.trim());
    const cvvValid = /^\d{3}$/.test(cardCVV.value.trim());
    const holderValid = cardHolder.value.trim() !== "";
    
          // בדיקת האם כל הפרטים מלאים
    if (
        cardValid &&
        expiryValid &&
        cvvValid &&
        holderValid &&
        productName !== "" &&
        productDescription !== "" &&
        startingPrice !== "" &&
        auctionDuration !== "" &&
        productImage &&
        checkbox1 &&
        checkbox2
    ) {
            confirmPaymentButton.disabled = false; // הפעלת כפתור אישור תשלום
        } else {
            confirmPaymentButton.disabled = true; // השארת הכפתור כבוי אם משהו חסר
        }
    }

    // מעקב אחר שינויים בשדות הקלט
    cardNumber.addEventListener("input", checkPaymentFields);
    cardExpiry.addEventListener("input", checkPaymentFields);
    cardCVV.addEventListener("input", checkPaymentFields);
    cardHolder.addEventListener("input", checkPaymentFields);
document.getElementById("terms-1").addEventListener("change", checkPaymentFields);
document.getElementById("terms-2").addEventListener("change", checkPaymentFields);

    // אישור תשלום לאחר לחיצה
    confirmPaymentButton.addEventListener("click", function () {
        Swal.fire({
            title: "✅ תשלום התקבל והמכרז פורסם בהצלה!",
          //  text: "כעת תוכל לפרסם את המכרז.",
            icon: "success"
        }).then(() => {
            sessionStorage.setItem("paymentDone", "true"); // שמירת אישור תשלום
            publishButton.disabled = false; // הפעלת כפתור פרסום המכרז
            paymentForm.style.display = "none"; // הסתרת טופס התשלום
            confirmPaymentButton.style.display = "none"; // 🔹 הסתרת כפתור אישור תשלום
        });
    });

    // בעת טעינת הדף - בדיקת סטטוס תשלום
    if (sessionStorage.getItem("paymentDone") === "true") {
        console.log("🔹 תשלום בוצע - כפתור 'פרסם מכרז' מופעל!");
        publishButton.disabled = false;
    } else {
        console.log("⚠️ תשלום עדיין לא בוצע - כפתור 'פרסם מכרז' נעול.");
    }
});

async function handleUpdateAuction() {
    const form = document.getElementById("auction-form");
    const formData = new FormData(form);

    formData.append("user_name", JSON.parse(localStorage.getItem("user")).name);
    formData.append("user_email", JSON.parse(localStorage.getItem("user")).email);
    formData.append("category", new URLSearchParams(window.location.search).get("category"));

    // שדות נוספים
    formData.append("product_name", document.getElementById("productName").value.trim());
    formData.append("description", document.getElementById("productDescription").value.trim());
    formData.append("starting_price", document.getElementById("startingPrice").value.trim());
    formData.append("duration_days", document.getElementById("auctionDuration").value.trim());

    // שדות דינמיים
    const dynamicFields = {};
    const inputs = document.querySelectorAll("#dynamic-questions input");
    inputs.forEach(input => {
        if (input.id.trim() !== "" && input.value.trim() !== "") {
            dynamicFields[input.id] = input.value.trim();
        }
    });
    formData.append("dynamicFields", JSON.stringify(dynamicFields));

    try {
       
        
        const response = await  fetch(`http://localhost:3001/api/auctions/${auctionId}`, {
            method: "PUT",
            body: formData
        });
        

          if (response.ok) {
            Swal.fire({
                title: "✅ העדכון בוצע בהצלחה!",
                icon: "success"
            }).then(() => {
                window.location.href = "profile.html";
            });
        } else {
            const errorData = await response.json(); // ❌ כאן נוצרת השגיאה אם השרת לא מחזיר JSON
            alert("❌ שגיאה בעדכון: " + errorData.error);
        }
        
    } catch (error) {
        console.error("❌ שגיאה בעדכון מכרז:", error);
        alert("❌ אירעה שגיאה בעדכון.");
    }
}
