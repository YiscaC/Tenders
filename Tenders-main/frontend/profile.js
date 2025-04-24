document.addEventListener("DOMContentLoaded", async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("👤 משתמש מחובר:", user); // ✅ נראה מה שמור בלוקאל סטורג'
    if (!user || !user.email) {
        alert("עליך להתחבר כדי לצפות באזור האישי");
        window.location.href = "login.html";
        return;
    }

    // ✨ הצגת טאב לפי ה-anchor מה-URL (למשל: profile.html#my-wins)
const sectionFromHash = window.location.hash?.replace("#", "");
if (["my-auctions", "my-bids", "my-wins"].includes(sectionFromHash)) {
    showSection(sectionFromHash);
} else {
    showSection("my-auctions"); // ברירת מחדל
}


    document.getElementById("user-name").textContent = user.name;
    document.getElementById("user-email").textContent = user.email;

    try {
        // 🔎 שליפת מכרזים שפרסם
        console.log("📤 שולח בקשה למכרזים שפרסם המשתמש:", user.name);
        const myAuctionsRes = await fetch(`http://localhost:3001/api/auctions/user/email/${encodeURIComponent(user.email)}`);
        console.log("📥 תגובת שרת - מכרזים שפרסם:", myAuctionsRes);
        const myAuctions = await myAuctionsRes.json();
        renderAuctions(myAuctions, "my-auctions");
        console.log("📄 מכרזים שהתקבלו:", myAuctions);

       

        // 🔎 שליפת מכרזים שהוגשה עבורם הצעת מחיר
        const myBidsRes = await fetch(`http://localhost:3001/api/bids/by-user/${encodeURIComponent(user.email)}`);
        const myBids = await myBidsRes.json();
        renderGroupedBids(myBids);


         // 🏆 הוספה כאן – שליפת מכרזים שזכה בהם
         const winsRes = await fetch(`http://localhost:3001/api/bids/wins/${encodeURIComponent(user.email)}`);
         const wins = await winsRes.json();
         renderAuctions(wins, "my-wins"); 


    } catch (error) {
        console.error("שגיאה בשליפת המידע:", error);
    }
});

function renderAuctions(auctions, containerPrefix) {
    const isWins = containerPrefix === "my-wins";
    const isBids = containerPrefix === "my-bids";

    const container = isWins ? document.getElementById("my-wins") : null;
    const activeContainer = document.getElementById(`${containerPrefix}-active`);
    const endedContainer = document.getElementById(`${containerPrefix}-ended`);
    const activeTitle = document.getElementById(`${containerPrefix}-active-title`);
    const endedTitle = document.getElementById(`${containerPrefix}-ended-title`);

    if (isWins && container) container.innerHTML = "";
    if (activeContainer) activeContainer.innerHTML = "";
    if (endedContainer) endedContainer.innerHTML = "";

    if (!auctions.length) {
        if (isWins && container) {
            container.innerHTML = "<p>לא נמצאו מכרזים.</p>";
            return;
        } else {
            if (activeTitle) activeTitle.style.display = "none";
            if (endedTitle) endedTitle.style.display = "none";
            if (endedContainer) endedContainer.style.display = "none";
            if (activeContainer) activeContainer.innerHTML = "<p>לא נמצאו מכרזים.</p>";
            return;
        }
    }

    auctions.forEach(async a => {
        const endDate = new Date(a.createdAt);
        endDate.setDate(endDate.getDate() + a.duration_days);
        const now = new Date();
        const isActive = now < endDate;

        const div = document.createElement("div");
        div.className = "auction-item d-flex flex-column justify-content-between";
        div.style.height = "100%";

        const topContent = document.createElement("div");
        topContent.innerHTML = `
            <h4>${a.product_name}</h4>
            <p>${a.description || ''}</p>
            <p>${isBids ? `ההצעה האחרונה שלך: ${a.amount} ₪`: isWins? `הצעתך הזוכה: ${a.amount} ₪`: `מחיר התחלתי: ${a.starting_price} ₪`}</p> `;

            div.appendChild(topContent);

        const bottomContent = document.createElement("div");

        if (isBids) {
            const showBidsBtn = document.createElement("button");
            showBidsBtn.className = "btn btn-sm btn-info";
            showBidsBtn.textContent = "הצג הצעות";
            showBidsBtn.onclick = () => toggleBidList(showBidsBtn);
            const bidsList = document.createElement("div");
            bidsList.className = "bid-list";
            bidsList.style.display = "none";
            bidsList.style.marginTop = "10px";

            const bids = a.bids || [];
            if (bids.length > 0) {
                bidsList.innerHTML = bids.map(b => `
                    <div class="bid-item">
                        <div><strong>₪${b.amount}</strong></div>
                        <div>🕒 ${new Date(b.createdAt).toLocaleString()}</div>
                    </div>
                `).join('');
                bottomContent.appendChild(showBidsBtn);
                bottomContent.appendChild(bidsList);
            } else {
                const noBids = document.createElement("p");
                noBids.className = "text-muted mt-2 mb-0";
                noBids.style.fontWeight = "bold";
                noBids.textContent = "לא הוגשו הצעות מחיר";
                bottomContent.appendChild(noBids);
            }
        }

        if (containerPrefix === "my-auctions") {
            const editBtn = document.createElement("button");
            editBtn.textContent = "✏️ ";
            editBtn.className = "btn btn-sm btn-primary";
            editBtn.onclick = () => editAuction(a);

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "🗑️ ";
            deleteBtn.className = "btn btn-sm btn-danger";
            deleteBtn.onclick = () => deleteAuction(a._id);

            const btnGroup = document.createElement("div");
            btnGroup.className = "button-group";
            btnGroup.appendChild(editBtn);
            btnGroup.appendChild(deleteBtn);
            bottomContent.appendChild(btnGroup);

            const bidsRes = await fetch(`http://localhost:3001/api/bids/by-auction/${a._id}`);
            const bids = await bidsRes.json();

            if (bids.length > 0) {
                const bidsList = document.createElement("div");
                bidsList.className = "bid-list";
                bidsList.style.marginTop = "10px";
                bidsList.style.display = "none";

                bids.forEach(b => {
                    const bidItem = document.createElement("div");
                    bidItem.className = "bid-item";
                    bidItem.innerHTML = `
                        <div><strong>₪${b.amount}</strong></div>
                        <div>🕒 ${new Date(b.createdAt).toLocaleString()}</div>
                        <div>👤 ${b.userName}</div>
                    `;
                    bidsList.appendChild(bidItem);
                });

                const showBidsBtn = document.createElement("button");
                showBidsBtn.className = "btn btn-sm btn-dark mt-2";
                showBidsBtn.style.fontWeight = "bold";
                showBidsBtn.textContent = "הצג הצעות";
                showBidsBtn.onclick = () => {
                    const visible = bidsList.style.display !== "none";
                    bidsList.style.display = visible ? "none" : "block";
                    showBidsBtn.textContent = visible ? "הצג הצעות" : "הסתר הצעות";
                };

                bottomContent.appendChild(showBidsBtn);
                bottomContent.appendChild(bidsList);
            } else {
                const noBidsNote = document.createElement("p");
                noBidsNote.className = "text-muted mt-2 mb-0";
                noBidsNote.style.fontWeight = "bold";
                noBidsNote.textContent = "לא הוגשו הצעות מחיר";
                bottomContent.appendChild(noBidsNote);
            }
        }

        if (!isActive && containerPrefix === "my-auctions") {
            try {
                const res = await fetch(`http://localhost:3001/api/bids/highest/${a._id}`);
                const winnerData = await res.json();

                if (winnerData && winnerData.winnerEmail && winnerData.userName) {
                    const showWinnerBtn = document.createElement("button");
                    showWinnerBtn.className = "btn btn-sm btn-dark mt-2";
                    showWinnerBtn.style.fontWeight = "bold";
                    showWinnerBtn.textContent = "הצג פרטי זוכה";

                    const winnerInfo = document.createElement("div");
                    winnerInfo.className = "winner-info mt-1 p-2 bg-light border border-success rounded";
                    winnerInfo.style.display = "none";
                    winnerInfo.innerHTML = `
                        <strong>🧑 פרטי זוכה:</strong><br>
                        👤 ${winnerData.userName}<br>
                        ✉️ מייל ליצירת קשר: ${winnerData.winnerEmail}
                    `;

                    showWinnerBtn.onclick = () => {
                        const isVisible = winnerInfo.style.display !== "none";
                        winnerInfo.style.display = isVisible ? "none" : "block";
                        showWinnerBtn.textContent = isVisible ? "הצג פרטי זוכה" : "הסתר פרטי זוכה";
                    };

                    bottomContent.appendChild(showWinnerBtn);
                    bottomContent.appendChild(winnerInfo);
                }
            } catch (err) {
                console.error("שגיאה בקבלת פרטי הזוכה:", err);
            }
        }

        div.appendChild(bottomContent);

        if (isWins) {
            // הצגת כפתור להצגת פרטי מפרסם
            const showOwnerBtn = document.createElement("button");
            showOwnerBtn.className = "btn btn-sm btn-dark mt-2";
            showOwnerBtn.style.fontWeight = "bold";
            showOwnerBtn.textContent = "הצג פרטי המפרסם";
        
            const ownerInfo = document.createElement("div");
            ownerInfo.className = "owner-info mt-1 p-2 bg-light border border-primary rounded";
            ownerInfo.style.display = "none";
            ownerInfo.innerHTML = `
                <strong>📦 פרטי המפרסם:</strong><br>
                👤 ${a.publisherName || "לא ידוע"}<br>
                ✉️ ${a.publisherEmail || "לא ידוע"}
            `;
        
            showOwnerBtn.onclick = () => {
                const isVisible = ownerInfo.style.display !== "none";
                ownerInfo.style.display = isVisible ? "none" : "block";
                showOwnerBtn.textContent = isVisible ? "הצג פרטי המפרסם" : "הסתר פרטי המפרסם";
            };
        
            bottomContent.appendChild(showOwnerBtn);
            bottomContent.appendChild(ownerInfo);
        
            container.appendChild(div); // רק פעם אחת!
        } else if (isActive) {
            activeContainer.appendChild(div);
        } else {
            endedContainer.appendChild(div);
        }

    });
}







function toggleMenu() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("open");
}

function showSection(section) {    
        document.getElementById("my-auctions-section").style.display = section === 'my-auctions' ? 'block' : 'none';
        document.getElementById("my-bids-section").style.display = section === 'my-bids' ? 'block' : 'none';
        document.getElementById("my-wins-section").style.display = section === 'my-wins' ? 'block' : 'none';
        document.getElementById("edit-profile").style.display = section === 'edit-profile' ? 'block' : 'none';      
  // אם נבחר "ניהול פרטים" – נמלא את השדות עם הנתונים מה-localStorage
  if (section === 'edit-profile') {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      document.getElementById('name').value = user.name || '';
      document.getElementById('email').value = user.email || '';
      document.getElementById('password').value = '';
    }
  }

    }

    async function logout() {
        const user = JSON.parse(localStorage.getItem("user"));
      
        // שלב ראשון – אישור ראשוני
        const firstConfirm = await Swal.fire({
          icon: 'warning',
          title: 'האם את בטוחה שברצונך למחוק את המשתמש לצמיתות?',
          text: 'לא תהיה אפשרות לשחזר את המשתמש או את המידע לאחר המחיקה.',
          showCancelButton: true,
          confirmButtonText: 'כן, מחק',
          cancelButtonText: 'ביטול'
        });
      
        if (!firstConfirm.isConfirmed) return;
      
        // שלב שני – אזהרה סופית
        const secondConfirm = await Swal.fire({
          icon: 'warning',
          title: 'אזהרה סופית',
          html: 'בלחיצתך על <strong>אישור</strong> הנך מאשר/ת כי כל המכרזים שפרסמת וכל ההצעות שהצעת יימחקו לצמיתות.',
          showCancelButton: true,
          confirmButtonText: 'אישור סופי',
          cancelButtonText: 'ביטול'
        });
      
        if (!secondConfirm.isConfirmed) return;
      
        // ביצוע המחיקה בפועל
        try {
          const res = await fetch('http://localhost:3001/api/delete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email })
          });
      
          const result = await res.json();
          if (res.ok) {
            await Swal.fire({
              icon: 'success',
              title: 'המשתמש נמחק בהצלחה',
              confirmButtonText: 'אישור'
            });
      
            localStorage.removeItem("user");
            window.location.href = "login.html";
          } else {
            Swal.fire({
              icon: 'error',
              title: 'שגיאה במחיקה',
              text: result.message || 'אירעה שגיאה במחיקת המשתמש'
            });
          }
        } catch (err) {
          console.error("שגיאה:", err);
          Swal.fire({
            icon: 'error',
            title: 'שגיאה בשרת',
            text: 'לא ניתן היה לבצע את המחיקה'
          });
        }
      }
      
async function deleteAuction(auctionId) {
    const confirmed = confirm("האם את בטוחה שברצונך למחוק את המכרז ?");
    if (!confirmed) return;

    try {
        const res = await fetch(`http://localhost:3001/api/auctions/${auctionId}`, {
            method: "DELETE"
        });
        const result = await res.json();
        alert("✅ " + result.message);

        // ריענון הרשימה
        location.reload();
    } catch (err) {
        console.error("❌ שגיאה במחיקת מכרז:", err);
        alert("אירעה שגיאה בעת מחיקת המכרז.");
    }
}
function editAuction(auction) {
    // שמירת המכרז לעריכה ב-sessionStorage
    sessionStorage.setItem("editAuction", JSON.stringify(auction));
    // ניווט לדף פרסום עם פרמטר edit=true
    window.location.href = `publish-tender.html?edit=true&id=${auction._id}&category=${auction.category}`;
}

function renderGroupedBids(groupedBids) {
    const containerPrefix = "my-bids";
    const activeContainer = document.getElementById(`${containerPrefix}-active`);
    const endedContainer = document.getElementById(`${containerPrefix}-ended`);
    const activeTitle = document.getElementById(`${containerPrefix}-active-title`);
    const endedTitle = document.getElementById(`${containerPrefix}-ended-title`);

    activeContainer.innerHTML = "";
    endedContainer.innerHTML = "";

    if (!groupedBids.length) {
        if (activeTitle) activeTitle.style.display = "none";
        if (endedTitle) endedTitle.style.display = "none";
        if (endedContainer) endedContainer.style.display = "none";
        if (activeContainer) activeContainer.innerHTML = "<p>לא נמצאו מכרזים.</p>";
        return;
    }

    const now = new Date();

    groupedBids.forEach(item => {
        const auction = item.auction;
        const bids = item.bids;

        const endDate = new Date(auction.createdAt);
        endDate.setDate(endDate.getDate() + auction.duration_days);
        const isActive = now < endDate;

        const div = document.createElement("div");
        div.className = "auction-item d-flex flex-column justify-content-between";
        div.style.height = "100%";

        const userBid = bids.sort((a, b) => b.amount - a.amount)[0];

        
        const topContent = document.createElement("div");
        topContent.innerHTML = `
            <h4>${auction.product_name}</h4>
            <p>${auction.description || ''}</p>
            <p>ההצעה האחרונה שלך: ${userBid ? userBid.amount + ' ₪' : 'לא נמצאה'}</p>
        `;
        
        div.appendChild(topContent);


        const bottomContent = document.createElement("div");

        const showBidsBtn = document.createElement("button");
        showBidsBtn.className = "btn btn-sm btn-dark mt-2";
        showBidsBtn.style.fontWeight = "bold";
        showBidsBtn.textContent = "הצג הצעות";
        showBidsBtn.onclick = () => toggleBidList(showBidsBtn);



        const bidsList = document.createElement("div");
        bidsList.className = "bid-list";
        bidsList.style.display = "none";
        bidsList.style.marginTop = "10px";

        if (bids.length > 0) {
            bidsList.innerHTML = bids.map(b => `
                <div class="bid-item">
                    <div><strong>₪${b.amount}</strong></div>
                    <div>🕒 ${new Date(b.createdAt).toLocaleString()}</div>
                </div>
            `).join('');
            bottomContent.appendChild(showBidsBtn);
            bottomContent.appendChild(bidsList);
        } else {
            const noBids = document.createElement("p");
            noBids.className = "text-muted mt-2 mb-0";
            noBids.style.fontWeight = "bold";
            noBids.textContent = "לא הוגשו הצעות מחיר";
            bottomContent.appendChild(noBids);
        }

        div.appendChild(bottomContent);

        if (isActive) {
            activeContainer.appendChild(div);
        } else {
            endedContainer.appendChild(div);
        }
    });
}


function toggleBidList(button) {
    const ul = button.nextElementSibling;
    ul.style.display = ul.style.display === "none" ? "block" : "none";
    button.textContent = ul.style.display === "block" ? "הסתר הצעות" : "הצג הצעות";
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById("editProfileForm");
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
  
        const user = JSON.parse(localStorage.getItem("user"));
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
  
        if (!email) {
          document.getElementById('message').textContent = "האימייל הוא שדה חובה";
          return;
        }
  
        const updatedUser = {};
        if (name) updatedUser.name = name;
        if (email) updatedUser.email = email;
        if (password) updatedUser.password = password;
  
        try {
          const res = await fetch(`http://localhost:3001/api/update/${encodeURIComponent(user.email)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedUser)
          });
  
          const result = await res.json();
          if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'הפרטים עודכנו בהצלחה!',
                confirmButtonText: 'אישור'
              }).then(() => {
                window.location.href = "profile.html";
              });
              
            //document.getElementById('message').textContent = "הפרטים עודכנו בהצלחה!";
            localStorage.setItem("user", JSON.stringify({
              name: updatedUser.name || user.name,
              email: updatedUser.email || user.email
            }));
          } else {
            document.getElementById('message').textContent = result.error || "שגיאה בעדכון";
          }
        } catch (err) {
          console.error("שגיאה:", err);
          document.getElementById('message').textContent = "שגיאה בשרת";
        }
      });
    }
  });
  

