


// קריאה לפונקציה בעת טעינת העמוד
window.onload = function() {
    updateCartCount();
};


// קריאה לפונקציה בעת טעינת העמוד
window.onload = function() {
    updateCartCount();
};

// פונקציה לחישוב סך הכל
function calculateTotal(cartItems) {
    return cartItems.reduce((total, item) => {
        return total + (item.productPrice * item.quantity);
    }, 0);
}

// פונקציה לשמירת העגלה ב-LocalStorage
function saveCartToLocalStorage(cartItems) {
    localStorage.setItem('cart', JSON.stringify(cartItems));
}

// פונקציה לטעינת עגלה מ-LocalStorage
function loadCartFromLocalStorage() {
    const storedCart = localStorage.getItem('cart');
    return storedCart ? JSON.parse(storedCart) : [];
}

// פונקציה לשליפת העגלה מהשרת
async function fetchCart(userName) {
    if (!userName) {
        return [];
    }

    const encodedUserName = encodeURIComponent(userName); // קידוד השם
    const url = `http://localhost:3001/api/cart/${encodedUserName}`;

    console.log("Fetching cart from:", url); // דיבוג
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch cart');
        }

        const data = await response.json();
        const cartItems = data.cart.items;

        // שמירת העגלה ב-LocalStorage
        saveCartToLocalStorage(cartItems);

        return cartItems;
    } catch (error) {
        console.error('Error fetching cart:', error);
        return [];
    }
}


function changeQuantity(index, newQuantity) {
    let cartItems = loadCartFromLocalStorage();  // טוען את עגלת הקניות מה-LocalStorage
    const item = cartItems[index];
    const user = JSON.parse(localStorage.getItem('user'));  // קבלת פרטי המשתמש מה-LocalStorage
    const userName = user ? user.name : null;  // קבלת שם המשתמש

    if (!userName) {
        // console.error('User name is not defined!');
        return;
    }

    // עדכון הכמות בשרת
    fetch('http://localhost:3001/api/updateCartQuantity', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userName: userName,  // שם המשתמש
            productId: item.productId,  // מזהה המוצר
            quantity: newQuantity  // הכמות החדשה
        }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.message === 'העגלה עודכנה בהצלחה') {
                // עדכון ב-LocalStorage לאחר שהשרת אישר את העדכון
                cartItems[index].quantity = newQuantity;
                saveCartToLocalStorage(cartItems);
                renderCart();  // רענון התצוגה של העגלה
            } else {
                console.error('Error updating cart:', data.message);
            }
        })
        .catch(error => console.error('Error:', error));
}
async function renderCart() {
    const user = JSON.parse(localStorage.getItem('user'));
    const userName = user ? user.name : null;  // קבלת שם המשתמש מהלוקל סטורג'

    console.log("User Name:", userName);  // הדפסה של שם המשתמש

    // ננסה קודם כל לטעון את העגלה מה-LocalStorage
    let cartItems = loadCartFromLocalStorage();

    // אם אין פריטים ב-LocalStorage, נשלוף מהשרת
    if (cartItems.length === 0) {
        cartItems = await fetchCart(userName);
    }

    // ניהול ההצגה של העגלה
    //document.getElementById("rend").style.display = "none";
    // document.getElementById("topay").style.display = "inline";
    var cartDiv = document.getElementById('cart');
    var totalDiv = document.getElementById('total');
    cartDiv.innerHTML = '';
    totalDiv.textContent = '';

    if (cartItems.length === 0) {
        cartDiv.innerHTML = 'אין מוצרים להצגה';
    } else {
        document.getElementById("topay").style.display = "inline";
        cartItems.forEach(function (item, index) {
            var itemDiv = document.createElement('div');
            itemDiv.classList.add('item');
            var itemImg = document.createElement('img');
            itemImg.src = item.productImage;
            itemDiv.appendChild(itemImg);

            var itemName = document.createElement('span');
            itemName.textContent = item.productName;
            itemDiv.appendChild(itemName);

            var itemPrice = document.createElement('span');
            itemPrice.textContent = 'price: ' + item.productPrice + '$';
            itemDiv.appendChild(itemPrice);

            var quantityDiv = document.createElement('div');
            quantityDiv.classList.add('quantity');

            var quantityInput = document.createElement('input');
            quantityInput.type = 'number';
            quantityInput.value = item.quantity;
            quantityInput.min = '1';
            quantityInput.addEventListener('input', function () {
                changeQuantity(index, parseInt(this.value));
            });
            quantityDiv.appendChild(quantityInput);

            var removeButton = document.createElement('button');
            removeButton.innerHTML = '<i class="bi bi-trash"></i>';
            removeButton.addEventListener('click', function () {
                removeFromCart(index);
            });
            quantityDiv.appendChild(removeButton);
            itemDiv.appendChild(quantityDiv);

            cartDiv.appendChild(itemDiv);
        });

        // חישוב הסכום הכולל
        var totalAmount = calculateTotal(cartItems);
        totalDiv.textContent = 'sum: ' + totalAmount + '$';
    }
}
// פונקציה לשליחת בקשת POST לשרת להוספת פריט לעגלה
function addToCart(productId, productName, productPrice, productImage, quantity) {
    const user = JSON.parse(localStorage.getItem('user'));
    const userName = user ? user.name : null;  // קבלת שם המשתמש מהלוקל סטורג'

    console.log("User Name:", userName);  // הדפסה של שם המשתמש

    fetch('http://localhost:3001/api/addToCart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userName,        // הוספנו את שם המשתמש
            productId,      // מוודאים שה-id נשלח בפורמט הנכון
            productName,    // הוספנו את שם המוצר
            productPrice,   // הוספנו את מחיר המוצר
            productImage,   // הוספנו את תמונת המוצר
            quantity,       // הכמות
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                Swal.fire({
                    icon: 'error',
                    title: 'שגיאה',
                    text: 'יש להתחבר לאתר עם שם משתמש בכדי לרכוש מוצרים',
                    confirmButtonText: 'אישור'
                });
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'המוצר נוסף בהצלחה לעגלה',
                    confirmButtonText: 'אישור'
                }).then(() => {
                    window.location.href = "home.html";
                });
                console.log('Added to cart:', data);
                // עדכון עגלת הקניות ב-localStorage
                let cart = JSON.parse(localStorage.getItem('cart')) || [];  // טוען את העגלה הקיימת או יוצר עגלה ריקה
                const newItem = {
                    productId,
                    productName,
                    productPrice,
                    productImage,
                    quantity
                };
                // בדיקה אם המוצר כבר קיים בעגלה והוספת הכמות
                const existingItem = cart.find(item => item.productId === productId);
                if (existingItem) {
                    existingItem.quantity += quantity;  // עדכון הכמות אם המוצר כבר קיים
                } else {
                    cart.push(newItem);  // הוספת המוצר החדש לעגלה
                }

                localStorage.setItem('cart', JSON.stringify(cart));  // עדכון ה-localStorage עם העגלה המעודכנת
            }
        })
        .catch(error => {
            // console.error('Error adding to cart:', error);
            Swal.fire({
                icon: 'error',
                title: 'שגיאה',
                text: 'שגיאה בהוספת המוצר לעגלה',
                confirmButtonText: 'אישור'
            });
        });
}

async function removeFromCart(index) {
    let cartItems = loadCartFromLocalStorage();  // טוען את עגלת הקניות מה-LocalStorage
    const item = cartItems[index];
    const user = JSON.parse(localStorage.getItem('user'));  // קבלת פרטי המשתמש מה-LocalStorage
    const userName = user ? user.name : null;  // קבלת שם המשתמש

    if (!userName) {
        // console.error('User name is not defined!');
        return;
    }
    // עדכון מחיקת הפריט בשרת
    fetch('http://localhost:3001/api/removeFromCart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({
            userName: userName,  // שם המשתמש
            productId: item.productId  // מזהה המוצר
        }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                console.error('Unexpected message from server:', data.message);
                Swal.fire({
                    icon: 'error',
                    title: 'שגיאה',
                    text: 'שגיאה במחיקת המוצר',
                    confirmButtonText: 'אישור'
                });
            } else {
                let cart = JSON.parse(localStorage.getItem('cart')) || [];

                let cartItems = loadCartFromLocalStorage();  // טוען את עגלת הקניות מה-LocalStorage
                const item1 = cartItems[index];
                // סינון המוצר שצריך להימחק מהעגלה
                cart = cart.filter(item => item.productId !== item1.productId);
                console.log('index', index);
                // עדכון ה-localStorage עם המידע החדש
                localStorage.setItem('cart', JSON.stringify(cart));
                renderCart();  // רענון התצוגה של העגלה
                Swal.fire({
                    icon: 'success',
                    title: 'המוצר נמחק בהצלחה מהעגלה',
                    confirmButtonText: 'אישור'
                });
            }
        })
        .catch(error => console.error('Error:', error));
}

function openModal() {
    document.getElementById("myModal").style.display = "block";
}

function closeModal() {
    document.getElementById("myModal").style.display = "none";
}
function validateName() {
    var name = document.getElementById("name").value;
    var nameError = document.getElementById("nameError");
    if (!isNaN(parseInt(name))) {
        nameError.innerText = "שדה זה מקבל רק אותיות ";
    } else {
        nameError.innerText = "";
    }
}
function validatecreditCard() {
    var creditCard = document.getElementById("creditCard").value;
    var creditCardError = document.getElementById("creditCardError");
    if (isNaN(parseInt(creditCard))) {
        creditCardError.innerText = "שדה זה מקבל רק מספרים ";
    } else {
        creditCardError.innerText = "";
    }
}
function validatetokef() {
    var tokef = document.getElementById("tokef").value;
    var tokefError = document.getElementById("tokefError");
    if (isNaN(parseInt(tokef))) {
        tokefError.innerText = "שדה זה מקבל רק מספרים ";
    } else {
        tokefError.innerText = "";
    }
}
function validatetokef2() {
    var tokef2 = document.getElementById("tokef2").value;
    var tokef2Error = document.getElementById("tokef2Error");
    if (isNaN(parseInt(tokef2))) {
        tokef2Error.innerText = "שדה זה מקבל רק מספרים ";
    } else {
        tokef2Error.innerText = "";
    }
}
function validateidown() {
    var idown = document.getElementById("idown").value;
    var idownError = document.getElementById("idownError");
    if (isNaN(parseInt(idown))) {
        idownError.innerText = "שדה זה מקבל רק מספרים ";
    } else {
        idownError.innerText = "";
    }
}
function submitDetails() {
    var name = document.getElementById("name").value;
    var creditCard = document.getElementById("creditCard").value;
    var tokef = document.getElementById("tokef").value;
    var tokef2 = document.getElementById("tokef2").value;
    var idown = document.getElementById("idown").value;

    if (name !== "" && creditCard !== "" && tokef !== "" && tokef2 !== "" && idown !== "") {
        Swal.fire({
            icon: 'success',
            title: 'התשלום בוצע בהצלחה',
            confirmButtonText: 'אישור'
        });
        closeModal();
        document.getElementById("name").value = "";
        document.getElementById("creditCard").value = "";
        document.getElementById("tokef").value = "";
        document.getElementById("tokef2").value = "";
        document.getElementById("idown").value = "";

    } else {
        Swal.fire({
            icon: 'error',
            title: 'שגיאה',
            text: 'בבקשה תמלא את כל השדות',
            confirmButtonText: 'אישור'
        });
    }
}

async function clearCart() {
    const user = JSON.parse(localStorage.getItem('user'));  // קבלת פרטי המשתמש מה-LocalStorage
    const userName = user ? user.name : null;  // קבלת שם המשתמש

    if (!userName) {
        console.error('User name is not defined!');
        return;
    }

    // שליחת בקשת מחיקה לשרת
    fetch('http://localhost:3001/api/clearCart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName }),  // שם המשתמש
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.message === 'העגלה נמחקה בהצלחה') {
            // מחיקת העגלה מ-localStorage
            localStorage.removeItem('cart');
            renderCart();  // רענון התצוגה של העגלה
            Swal.fire({
                icon: 'success',
                title: 'התשלום בוצע בהצלחה!!!',
                confirmButtonText: 'אישור'
            }).then(() => {
                window.location.href = "home.html";
            });
        } else {
            console.error('Error clearing cart:', data.message);
            Swal.fire({
                icon: 'error',
                title: 'שגיאה',
                text: 'שגיאה במחיקת העגלה',
                confirmButtonText: 'אישור'
            });
        }
    })
    .catch(error => console.error('Error:', error));
}
