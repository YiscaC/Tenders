
console.log("📢 publish-tender.js נטען בהצלחה!");
const urlParams = new URLSearchParams(window.location.search);
const isEditMode = urlParams.get("edit") === "true";
const auctionId = urlParams.get("id");

//הצגת טופס העריכה/העלאת המכרז
document.addEventListener("DOMContentLoaded",  () => {
    if (isEditMode && auctionId) {
        fetch(`http://localhost:3001/api/auctions/${auctionId}`)
            .then(res => res.json())
            .then(async data => {
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

                // ✅ הסתרת שדות "מחיר התחלתי" ו"משך המכרז" בעדכון מכרז
                // ✨ כאן נבדוק אם הוגשו הצעות
                let hasBids = false;
                try {
                    const bidsRes = await fetch(`http://localhost:3001/api/bids/by-auction/${auctionId}`);
                    const bidsData = await bidsRes.json();
                    hasBids = bidsData.length > 0;
                } catch (error) {
                    console.error("❌ שגיאה בבדיקת הצעות מחיר", error);
                }

                // אם יש הצעות - להסתיר שדות מחיר ומשך
                if (hasBids) {
                    const startingPriceField = document.getElementById("startingPrice");
                    const startingPriceContainer = startingPriceField?.closest(".mb-3");
                    if (startingPriceContainer) startingPriceContainer.style.display = "none";

                    const auctionDurationField = document.getElementById("auctionDuration");
                    const auctionDurationContainer = auctionDurationField?.closest(".mb-3");
                    if (auctionDurationContainer) auctionDurationContainer.style.display = "none";
                }
                


                // הסרת הצ'קבוקסים לגמרי
                const terms1Container = document.getElementById("terms-1")?.closest(".form-check");
                const terms2Container = document.getElementById("terms-2")?.closest(".form-check");
                if (terms1Container) terms1Container.remove();
                if (terms2Container) terms2Container.remove();


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

    // פונקציה לבדוק אם כל השדות מלאים
    function checkPaymentFields() {
        const productName = document.getElementById("productName").value.trim();
        const productDescription = document.getElementById("productDescription").value.trim();
        const startingPrice = document.getElementById("startingPrice").value.trim();
        const auctionDuration = document.getElementById("auctionDuration").value.trim();
        const productImage = document.getElementById("productImage").files.length > 0;
    
        const checkbox1 = document.getElementById("terms-1").checked;
        const checkbox2 = document.getElementById("terms-2").checked;
    
        const cardNumberFilled = cardNumber.value.trim() !== "";
        const cardExpiryFilled = cardExpiry.value.trim() !== "";
        const cardCVVFilled = cardCVV.value.trim() !== "";
        const cardHolderFilled = cardHolder.value.trim() !== "";

           // 🔥 בדיקה גם של כל השדות הדינמיים:
    const dynamicInputs = document.querySelectorAll("#dynamic-questions input");
    let allDynamicFieldsFilled = true;
    dynamicInputs.forEach(input => {
        if (input.value.trim() === "") {
            allDynamicFieldsFilled = false;
        }
    });
    
        const allFieldsFilled = 
            productName &&
            productDescription &&
            startingPrice &&
            auctionDuration &&
            productImage &&
            cardNumberFilled &&
            cardExpiryFilled &&
            cardCVVFilled &&
            cardHolderFilled &&
            checkbox1 &&
            checkbox2 && 
            allDynamicFieldsFilled;

    
        confirmPaymentButton.disabled = !allFieldsFilled;
    }
    
    
    //בדיקת תקינות הקלט-בלחיצה על אישור ותשלום
    function validatePaymentFields() {
        let isValid = true;
    
        // ניקוי הודעות קודמות
        document.getElementById("error-card").textContent = "";
        document.getElementById("error-expiry").textContent = "";
        document.getElementById("error-cvv").textContent = "";
    
        // מספר כרטיס - חייב 16 ספרות
        const cardNumberValue = cardNumber.value.trim();
        if (!/^\d{16}$/.test(cardNumberValue)) {
            document.getElementById("error-card").textContent = "מספר כרטיס לא תקין - יש להכניס בדיוק 16 ספרות.";
            isValid = false;
        }
    
    // תוקף - פורמט MM/YY + לבדוק שהתוקף לא עבר
    const cardExpiryValue = cardExpiry.value.trim();
    if (!/^\d{2}\/\d{2}$/.test(cardExpiryValue)) {
        document.getElementById("error-expiry").textContent = "תוקף לא תקין - יש להכניס בפורמט MM/YY.";
        isValid = false;
    } else {
        const [month, year] = cardExpiryValue.split("/").map(Number);
        const now = new Date();
        const currentYear = now.getFullYear() % 100; // רק שתי ספרות אחרונות
        const currentMonth = now.getMonth() + 1; // חודשים ב-JS מתחילים מ-0

        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            document.getElementById("error-expiry").textContent = "תוקף הכרטיס פג.";
            isValid = false;
        } else if (month < 1 || month > 12) {
            document.getElementById("error-expiry").textContent = "חודש לא תקין.";
            isValid = false;
        }
    }
    
    // CVV - חייב להיות בדיוק 3 ספרות
    const cardCVVValue = cardCVV.value.trim();
    if (!/^\d{3}$/.test(cardCVVValue)) {
        document.getElementById("error-cvv").textContent = "CVV לא תקין - יש להכניס בדיוק 3 ספרות.";
        isValid = false;
    }

        // בדיקת צ'קבוקסים
        const checkbox1 = document.getElementById("terms-1");
        const checkbox2 = document.getElementById("terms-2");
    
        if (!checkbox1.checked) {
            Swal.fire({
                icon: 'error',
                title: 'יש לאשר את תנאי השימוש הראשון!',
            });
            isValid = false;
        } else if (!checkbox2.checked) {
            Swal.fire({
                icon: 'error',
                title: 'יש לאשר את תנאי השימוש השני!',
            });
            isValid = false;
        }
    
        return isValid;
    }
    

cardNumber.addEventListener("input", function() {
    if (!/^\d{16}$/.test(cardNumber.value.trim())) {
        document.getElementById("error-card").textContent = "מספר כרטיס לא תקין - יש להכניס בדיוק 16 ספרות.";
    } else {
        document.getElementById("error-card").textContent = "";
    }
});

cardExpiry.addEventListener("input", function() {
    const val = cardExpiry.value.trim();
    if (!/^\d{2}\/\d{2}$/.test(val)) {
        document.getElementById("error-expiry").textContent = "תוקף לא תקין - פורמט נכון הוא MM/YY.";
    } else {
        document.getElementById("error-expiry").textContent = "";
    }
});

cardCVV.addEventListener("input", function() {
    if (!/^\d{3}$/.test(cardCVV.value.trim())) {
        document.getElementById("error-cvv").textContent = "CVV לא תקין - יש להכניס בדיוק 3 ספרות.";
    } else {
        document.getElementById("error-cvv").textContent = "";
    }
});

    
    // מעקב אחר שינויים בשדות הקלט
    cardNumber.addEventListener("input", checkPaymentFields);
    cardExpiry.addEventListener("input", checkPaymentFields);
    cardCVV.addEventListener("input", checkPaymentFields);
    cardHolder.addEventListener("input", checkPaymentFields);
    document.getElementById("terms-1").addEventListener("change", checkPaymentFields);
    document.getElementById("terms-2").addEventListener("change", checkPaymentFields);
    document.getElementById("productName").addEventListener("input", checkPaymentFields);
    document.getElementById("productDescription").addEventListener("input", checkPaymentFields);
    document.getElementById("startingPrice").addEventListener("input", checkPaymentFields);
    document.getElementById("auctionDuration").addEventListener("change", checkPaymentFields);
    document.getElementById("productImage").addEventListener("change", checkPaymentFields);

    // אישור תשלום לאחר לחיצה
    confirmPaymentButton.addEventListener("click", async function (e) {
        e.preventDefault(); // כדי למנוע רענון
    
        if (validatePaymentFields()) {
            // הכנת נתוני המכרז
            const user = JSON.parse(localStorage.getItem("user"));
            const form = document.getElementById("auction-form");
            const formData = new FormData(form);
    
            formData.append("user_name", user.name);
            formData.append("user_email", user.email);
            formData.append("category", new URLSearchParams(window.location.search).get("category"));
            formData.append("product_name", document.getElementById("productName").value.trim());
            formData.append("description", document.getElementById("productDescription").value.trim());
            formData.append("starting_price", document.getElementById("startingPrice").value.trim());
            formData.append("duration_days", document.getElementById("auctionDuration").value.trim());
            
            const dynamicFields = {};
            const inputs = document.querySelectorAll("#dynamic-questions input");
            inputs.forEach(input => {
                if (input.id.trim() !== "" && input.value.trim() !== "") {
                    dynamicFields[input.id] = input.value.trim();
                }
            });
            formData.append("dynamicFields", JSON.stringify(dynamicFields));
    
            const imageFile = document.getElementById("productImage").files[0];
            if (imageFile) {
                formData.append("image", imageFile);
            }
    
            // שליחת POST לפרסום מכרז
            try {
                const response = await fetch("http://localhost:3001/api/auctions", {
                    method: "POST",
                    body: formData
                });
    
                if (response.ok) {
                    Swal.fire({
                        title: "✅ תשלום התקבל והמכרז פורסם בהצלחה!",
                        icon: "success"
                    }).then(() => {
                        sessionStorage.setItem("paymentDone", "true");
                        window.location.href = "home.html"; // מעבר לדף הבית אחרי פרסום
                    });
                } else {
                    const errorData = await response.json();
                    alert("❌ שגיאה בפרסום: " + errorData.error);
                }
            } catch (error) {
                console.error("❌ שגיאה בפרסום:", error);
                alert("❌ אירעה שגיאה בשליחת המכרז.");
            }
        }
    });
    
    

    // בעת טעינת הדף - בדיקת סטטוס תשלום
    if (sessionStorage.getItem("paymentDone") === "true") {
        console.log("🔹 תשלום בוצע - כפתור 'פרסם מכרז' מופעל!");
        publishButton.disabled = false;
    } else {
        console.log("⚠️ תשלום עדיין לא בוצע - כפתור 'פרסם מכרז' נעול.");
    }
});

//שמירת השינויים שנעשו במכרז
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

    const imageFile = document.getElementById("productImage").files[0];
    if (imageFile) {
        formData.append("image", imageFile);
    }

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
