// product.js
const listProductHTML = document.querySelector('.listProduct');
let productSelect = JSON.parse(localStorage.getItem('productSelect')) || [];

document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    fetch(`http://localhost:3001/api/auctions/${productId}`)
        .then(response => response.json())
        .then(product => {
            const selectItem = document.getElementById('product-info');

            const createdAt = new Date(product.createdAt);
            const endDate = new Date(createdAt);
            endDate.setDate(endDate.getDate() + product.duration_days);

            const formattedEndDate = endDate.toLocaleDateString('he-IL');

            const fieldLabels = {
                material: "חומר",
                weight: "משקל (גרם)",
                condition: "מצב",
                year_of_manufacture: "שנת ייצור",
                kilometers: "קילומטראז'",
                dimensions: "מידות",
                breed: "גזע",
                age: "גיל (בשנים)",
                model: "דגם",
                equipment_type: "סוג ציוד",
                brand: "מותג",
                gender: "מין",
                size: "מידה",
                product_type: "סוג מוצר",
                age_range: "גיל יעד",
                instrument_type: "סוג כלי",
                usage: "שימוש",
                technique: "טכניקה",
                year: "שנה",
                author: "מחבר",
                item_type: "סוג פריט",
                players: "מספר שחקנים"
              };
              

            let dynamicFieldsHTML = '';
            for (const key in product) {
                if (!["_id", "product_name", "starting_price", "description", "image_url", "category", "__v", "createdAt", "updatedAt", "user_name", "duration_days","user_email","notified"].includes(key)) {
                    const label = fieldLabels[key] || key;
                    dynamicFieldsHTML += `<p class="card-text">${label}: ${product[key]}</p>`;
                }
            }

            // HTML כולל מקום לריבועי טיימר
            selectItem.innerHTML = `
            
            <div class="container mt-4">
                <div class="row">
                    <div class="col-12 col-md-6 order-md-2 d-flex justify-content-center align-items-center">
                       <img src="${product.image_url}" class="img-fluid fixed-product-image" alt="${product.product_name}">
                    </div>
                    <div class="col-12 col-md-6 order-md-1">
                        <div class="card-body text-end">
                            <h4 class="card-title">${product.product_name}</h4>
                            <p class="card-text mt-3">${product.description}</p>
                            ${dynamicFieldsHTML}
                              <p class="card-text mt-3">מחיר התחלתי: ₪${product.starting_price}</p>
                             <p class="card-text mt-3">תאריך סיום המכרז:  ${formattedEndDate}</p>
                            <div id="countdown-timer" class="d-flex justify-content-center gap-2 mt-3"></div>
                        </div>
                      
                    </div>
                </div>
            </div>`;
            setTimeout(() => {
                const image = document.querySelector(".fixed-product-image");
                if (image && image.src) {
                  image.style.cursor = "zoom-in";
                  image.addEventListener("click", () => {
                    const modalImage = document.getElementById("modalImage");
                    modalImage.src = image.src;
                    const modal = new bootstrap.Modal(document.getElementById("imageModal"));
                    modal.show();
                  });
                }
              }, 100);

// אחרי שהכנסת את התוכן ל-selectItem
const now = new Date();
const user = JSON.parse(localStorage.getItem("user"));

if (now < endDate) {
    const button = document.createElement("a");
    button.className = "btn bg-golden my-button2 col-6 mt-3 mb-3";
    button.textContent = "הגש הצעת מחיר";
    
    button.addEventListener("click", function (e) {
        e.preventDefault(); // תמיד למנוע ברירת מחדל כדי לשלוט בעצמנו
    
        if (!user) {
            // 🔥 המשתמש לא מחובר
            Swal.fire({
                icon: "warning",
                title: "אינך מחובר",
                text: "כדי להגיש הצעת מחיר, יש להתחבר או להירשם.",
                showCancelButton: true,
                confirmButtonText: "התחברות/הרשמה",
                cancelButtonText: "ביטול"
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = "login.html"; // מעבר לעמוד התחברות
                }
            });
        } else if (user.email === product.user_email) {
            // 🔥 המשתמש הוא מפרסם המכרז
            Swal.fire({
                icon: "warning",
                title: "שימו לב!",
                text: "אינך יכול להגיש הצעת מחיר למכרז שפרסמת בעצמך.",
                confirmButtonText: "הבנתי"
            });
        } else {
            // 🔥 המשתמש מחובר ויכול להגיש הצעה
            window.location.href = `bid.html?id=${product._id}&name=${encodeURIComponent(product.product_name)}&price=${product.starting_price}&image=${encodeURIComponent(product.image_url)}`;
        }
    });
    
    
    document.querySelector(".order-md-1").appendChild(button);
    
}


// הבאת ההצעה הגבוהה ביותר
fetch(`http://localhost:3001/api/bids/highest/${productId}`)
    .then(res => res.json())
    .then(bidData => {
        const highestText = (bidData.highestBid !== null && bidData.highestBid !== undefined)
            ? `₪${bidData.highestBid}`
            : "עדיין לא הוגשה";

        // מציאת האלמנט של תאריך סיום המכרז
        const endDateElement = Array.from(document.querySelectorAll(".card-body .card-text.mt-3"))
            .find(el => el.textContent.includes("תאריך סיום המכרז"));

        if (endDateElement) {
            const bidPara = document.createElement("p");
            bidPara.className = "card-text mt-2 text-end fw-bold";
            bidPara.textContent = `ההצעה הגבוהה ביותר: ${highestText}`;
            endDateElement.insertAdjacentElement('afterend', bidPara);
        }
    })
    .catch(err => {
        console.error("שגיאה בהצגת ההצעה הגבוהה ביותר:", err);
    });


            // ⏳ פונקציית טיימר
            function updateTimer() {
                const now = new Date();
                const diff = endDate - now;

                if (diff <= 0) {
                    document.getElementById("countdown-timer").innerHTML = "<p class='text-danger fw-bold'>המכרז הסתיים</p>";
                    return;
                }

                const seconds = Math.floor((diff / 1000) % 60);
                const minutes = Math.floor((diff / 1000 / 60) % 60);
                const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));

                document.getElementById("countdown-timer").innerHTML = `
                    <div class="timer-box"><span>${days}</span><div>ימים</div></div>
                    <div class="timer-box"><span>${hours}</span><div>שעות</div></div>
                    <div class="timer-box"><span>${minutes}</span><div>דקות</div></div>
                    <div class="timer-box"><span>${seconds}</span><div>שניות</div></div>
                `;
            }

            updateTimer();
            setInterval(updateTimer, 1000);
        })
        .catch(error => {
            console.error("שגיאה בשליפת המוצר:", error);
        });
});
