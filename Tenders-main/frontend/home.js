document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("clearLogin") === "true") {
      console.log("📢 מתבצע ניקוי התחברות...");
      localStorage.removeItem("user");
      sessionStorage.removeItem("authenticated");
    }
  });
  
document.addEventListener('DOMContentLoaded', function () {
    const listProductHTML = document.querySelector('.listProduct');

    fetch('http://localhost:3001/api/auctions')
        .then(response => response.json())
        .then(data => {
            listProductHTML.classList.add("row", "g-3", "justify-content-start"); // ✅ סידור לימין

            data.forEach(auction => {
                const createdAt = new Date(auction.createdAt);
                const endDate = new Date(createdAt);
                endDate.setDate(endDate.getDate() + auction.duration_days);
                const now = new Date();
                if (now >= endDate) return;

                const newAuction = document.createElement('div');
                const classes = ['product', 'col-sm-6', 'col-md-4', 'col-lg-3', 'mb-4'];
                classes.push(auction.category.trim());
                newAuction.classList.add(...classes);

                newAuction.innerHTML = `
                    <div class="card h-100 text-end">
                        <a href="product.html?id=${auction._id}&name=${encodeURIComponent(auction.product_name)}&price=${auction.starting_price}&image=${auction.image_url}&description=${encodeURIComponent(auction.description)}" class="text-dark my-button">
                            <img src="${auction.image_url}" class="card-img-top fixed-product-image" alt="${auction.product_name}">
                        </a>
                        <div class="card-footer bg-light">
                            <div class="card-body text-end">
                                <h6 class="card-title">
                                    <a href="product.html?id=${auction._id}&name=${encodeURIComponent(auction.product_name)}&price=${auction.starting_price}&image=${auction.image_url}&description=${encodeURIComponent(auction.description)}" class="text-dark my-button">
                                        ${auction.product_name}
                                    </a>
                                </h6>
                                <p class="card-text text-secondary" id="highest-bid-${auction._id}">טוען הצעה גבוהה...</p>
                            </div>
                        </div>
                    </div>
                `;

                listProductHTML.appendChild(newAuction);

                fetch(`http://localhost:3001/api/bids/highest/${auction._id}`)
                    .then(res => res.json())
                    .then(bidData => {
                        const highestText = (bidData.highestBid !== null && bidData.highestBid !== undefined)
                            ? `₪${bidData.highestBid}`
                            : "עדיין לא הוגשה";
                        const highestBidElement = document.getElementById(`highest-bid-${auction._id}`);
                        if (highestBidElement) {
                            highestBidElement.textContent = `ההצעה הגבוהה ביותר: ${highestText}`;
                        }
                    })
                    .catch(err => {
                        const highestBidElement = document.getElementById(`highest-bid-${auction._id}`);
                        if (highestBidElement) {
                            highestBidElement.textContent = "לא הוגשו הצעות מחיר למכרז זה";
                        }
                    });
            });
        })
        .catch(error => {
            console.error('Error fetching auctions:', error);
        });

    // ✅ חיפוש
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            const query = this.value.toLowerCase();
            const cards = document.querySelectorAll(".product");
            cards.forEach(card => {
                const title = card.querySelector(".card-title").textContent.toLowerCase();
                card.style.display = title.includes(query) ? "block" : "none";
            });
        });
    }
});


// סינון מכרזים לפי קטגוריה בתפריט הניווט
$(document).ready(function () {
    $('.nav-link').click(function () {
        var filter = $(this).data('filter');
        if (filter == 'all') {
            $('.product').show();
        } else {
            $('.product').hide();
            $('.product.' + filter).show();
        }
        $('#navbarOffcanvasLg').removeClass('show');
    });
});

document.addEventListener("DOMContentLoaded", async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.email) return;8777

    try {
        const res = await fetch(`http://localhost:3001/api/notifications/check/${user.email}`);
        const notifications = await res.json();

        for (const note of notifications) {
            const result = await Swal.fire({
                icon: note.type === "win" ? 'success' : 'info',
                title: note.type === "win" ? '🎉 זכית במכרז!' : 'המכרז שלך הסתיים',
                html: note.type === "win"
                    ? `   <p>מוצר: <strong>${note.product}</strong></p>
                          <p>הצעתך: ₪${note.price}</p>
                          <a href="profile.html#my-wins" class="btn btn-success mt-2">לצפייה</a>
`
                    : `<p>מוצר: <strong>${note.product}</strong></p>
                       <p>הזוכה: ${note.winnerEmail}</p>
                       <p>סכום הזכייה: ₪${note.price}</p>
                       <a href="profile.html" class="btn btn-secondary mt-2">לצפייה</a>`
            });

            // שליחה לשרת – רק אחרי סגירת ההתראה
            if (result.isConfirmed || result.isDismissed) {
                await fetch("http://localhost:3001/api/notifications/mark-seen", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        auctionId: note.auctionId,
                        type: note.type
                    })
                });
            }
        }
    } catch (err) {
        console.error("שגיאה בהתראות:", err);
    }
});
//מניעת מעבר לאזור האישי ולפרסום מכרז כאשר המשתמש לא מחובר
document.addEventListener("DOMContentLoaded", function () {
    const user = JSON.parse(localStorage.getItem("user"));

    const publishButton = document.getElementById("publishTenderButton");
    if (publishButton) {
        publishButton.addEventListener("click", function (e) {
            e.preventDefault();
            if (!user || !user.email) {
                Swal.fire({
                    icon: "warning",
                    title: "עליך להתחבר",
                    html: `
                        <p>אינך יכול לפרסם מכרז ללא התחברות.</p>
                        <div class="d-flex justify-content-center mt-3 gap-3">
                            <a href="login.html" class="btn btn-primary">התחברות</a>
                            <button class="btn btn-secondary" onclick="Swal.close()">אישור</button>
                        </div>
                    `,
                    showConfirmButton: false,
                    allowOutsideClick: true
                });
            } else {
                window.location.href = "categories.html";
            }
        });
    }

    const profileButton = document.querySelector('a[href="profile.html"]');
    if (profileButton) {
        profileButton.addEventListener("click", function (e) {
            if (!user || !user.email) {
                e.preventDefault();
                Swal.fire({
                    icon: "warning",
                    title: "עליך להתחבר",
                    html: `
                        <p>אינך יכול לצפות באזור האישי ללא התחברות.</p>
                        <div class="d-flex justify-content-center mt-3 gap-3">
                            <a href="login.html" class="btn btn-primary">התחברות</a>
                            <button class="btn btn-secondary" onclick="Swal.close()">אישור</button>
                        </div>
                    `,
                    showConfirmButton: false,
                    allowOutsideClick: true
                });
            }
        });
    }
});
