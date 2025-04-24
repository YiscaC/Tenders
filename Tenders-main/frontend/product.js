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
                age: "גיל (בשנים)"
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

// אחרי שהכנסת את התוכן ל-selectItem
const now = new Date();
if (now < endDate) {
    const button = document.createElement("a");
    button.href = `bid.html?id=${product._id}&name=${encodeURIComponent(product.product_name)}&price=${product.starting_price}&image=${encodeURIComponent(product.image_url)}`;
    button.className = "btn bg-golden my-button2 col-6 mt-3";
    button.textContent = "הגש הצעת מחיר";

    // הוספה ל-div המכיל
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
