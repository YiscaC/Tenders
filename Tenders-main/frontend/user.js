// מחכים שה-DOM יתממש (יתממש) לפני שמבצעים פעולות עם האלמנטים בדף
document.addEventListener('DOMContentLoaded', () => {
    function updateCartCount() {
        // קבלת המוצרים מ-localStorage באמצעות המפתח הנכון "cart"
        let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        
        // עדכון ה-span עם מספר המוצרים
        const cartCountElement = document.getElementById('cart-count');
        cartCountElement.textContent = cartItems.length;
    
        // אם אין מוצרים בעגלה, אפשר להסתיר את ה-span (לבחירתך)
        if (cartItems.length === 0) {
            cartCountElement.style.display = 'none';
        } else {
            cartCountElement.style.display = 'inline'; // הצגה אם יש מוצרים בעגלה
        }
    }
    
    // קריאה לפונקציה בעת טעינת העמוד
    window.onload = function() {
        updateCartCount();
    };
    
    // מטפל בהגשת טופס  הכניסה 
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault(); // מונע מהטופס להגיש מחדש את הדף

            // אוספים את נתוני המשתמש מהשדות
            const loginData = {
                email: document.getElementById('login-email').value,
                password: document.getElementById('login-password').value
            };

            try {
                // שולחים בקשת התחברות לשרת
                const response = await fetch('http://localhost:3001/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(loginData)
                });

                // אם התגובה לא בסדר, מראים הודעת שגיאה
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Server responded with an error:', errorData);
                    Swal.fire({
                        icon: 'error',
                        title: 'הכניסה נכשלה',
                        text: errorData.message,
                        confirmButtonText: 'אישור'
                    });
                    return;
                }

                // אם התחברות הצליחה, שומרים את נתוני המשתמש ב-localStorage
                const result = await response.json();
                console.log('Server response:', result);
                //localStorage.setItem('user', JSON.stringify({ name: result.name }));
                localStorage.setItem('user', JSON.stringify({ name: result.name, email: result.email }));
                localStorage.setItem('userEmail', result.email); // 👈 הוספה חשובה!
                // מראים הודעת הצלחה ומעבירים לדף הבית
                Swal.fire({
                    text: '!ברוך הבא',
                    title: `${result.name}`,
                    confirmButtonText: 'אישור'
                }).then(() => {
                    window.location.href = "home.html";
                });
            } catch (error) {
                // אם יש שגיאה במהלך הבקשה, מראים הודעת שגיאה
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'שגיאה',
                    text: 'שגיאה במהלך הכניסה.',
                    confirmButtonText: 'אישור'
                });
            }
        });
    }

    // מטפל בהגשת טופס ההרשמה
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function (event) {
            event.preventDefault(); // מונע מהטופס להגיש מחדש את הדף

            // אוספים את נתוני המשתמש מהשדות
            const userData = {
                name: document.getElementById('register-username').value,
                email: document.getElementById('register-email').value,
                password: document.getElementById('register-password').value
            };

            try {
                // שולחים בקשת הרשמה לשרת
                const response = await fetch('http://localhost:3001/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                // אם התגובה לא בסדר, מראים הודעת שגיאה
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Server responded with an error:', errorData);
                    Swal.fire({
                        icon: 'error',
                        title: 'ההרשמה נכשלה',
                        text: errorData.message,
                        confirmButtonText: 'אישור'
                    });
                    return;
                }

                // אם הרשמה הצליחה, שומרים את נתוני המשתמש ב-localStorage
                const result = await response.json();
                console.log('Server response:', result);
                localStorage.setItem('user', JSON.stringify({ name: result.name }));

                // מראים הודעת הצלחה ומסגירים את מודל ההרשמה אם קיים
                Swal.fire({
                    icon: 'success',
                    title: 'ההרשמה בוצעה בהצלחה',
                    confirmButtonText: 'אישור'
                }).then(() => {
                    const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
                    if (registerModal) registerModal.hide();
                });
            } catch (error) {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'שגיאה',
                    text: 'שגיאה במהלך ההרשמה.',
                    confirmButtonText: 'אישור'
                });
            }
        });
    }

    // איפוס שדות טופס ההרשמה כאשר סוגרים את המודל
const registerModalElement = document.getElementById('registerModal');
if (registerModalElement) {
    registerModalElement.addEventListener('hidden.bs.modal', () => {
        const registerForm = document.getElementById('registerForm');
        if (registerForm) registerForm.reset();
    });
}

    // מטפל בהצגת פרטי המשתמש והכפתורים בהתאם למצב ההתחברות
    const storedUser = localStorage.getItem('user');
    const userNavItem = document.getElementById('user-nav-item');
    const logoutButton = document.getElementById('logoutButton');
    const deleteUserButton = document.getElementById('deleteUserButton');
    const loginButton = document.getElementById('loginButton');

    if (storedUser) {
        const user = JSON.parse(storedUser);

        if (userNavItem) {
            userNavItem.textContent = `שלום, ${user.name}`;
            userNavItem.style.display = 'block';
        }

        if (logoutButton) {
            logoutButton.style.display = 'block';
        }

        if (deleteUserButton) {
            deleteUserButton.style.display = 'block';
        }
        if (loginButton) {
            loginButton.style.display = 'none';
        }
    } else {
        if (userNavItem) {
            userNavItem.style.display = 'none';
        }
        if (loginButton) {
            loginButton.style.display = 'block';
        }

        if (logoutButton) {
            logoutButton.style.display = 'none';
        }

        if (deleteUserButton) {
            deleteUserButton.style.display = 'none';
        }
    }

    // מטפל בלחיצה על כפתור היציאה מהחשבון
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.clear(); // מנקה את ה-localStorage
            window.location.href = 'home.html'; // מעביר לדף הבית
        });
    }

    // מטפל בלחיצה על כפתור מחיקת המשתמש
    if (deleteUserButton) {
        deleteUserButton.addEventListener('click', async () => {
            const confirmation = await Swal.fire({
                text: 'האם אתה בטוח שברצונך למחוק את המשתמש?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'כן,מחק',
                cancelButtonText: 'לא, ביטול'
            });

            if (!confirmation.isConfirmed) {
                return; // אם המשתמש ביטל, לא עושים כלום
            }

            const storedUser = localStorage.getItem('user');
            if (!storedUser) {
                Swal.fire({
                    icon: 'info',
                    title: 'אין משתמש מחובר',
                    text: 'לא נמצא משתמש מחובר למחיקה.',
                    confirmButtonText: 'אישור'
                });
                return;
            }

            const user = JSON.parse(storedUser);
            const userName = user.name;

            try {
                // שולחים בקשת מחיקה לשרת
                const response = await fetch('http://localhost:3001/api/delete', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name: userName })
                });

                // אם התגובה לא בסדר, מראים הודעת שגיאה
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Server responded with an error:', errorData);
                    Swal.fire({
                        icon: 'error',
                        title: 'שגיאה במחיקת המשתמש',
                        text: errorData.message,
                        confirmButtonText: 'אישור'
                    });
                    return;
                }

                // אם מחיקת המשתמש הצליחה, מנקים את ה-localStorage ומעבירים לדף הבית
                const result = await response.json();
                console.log('Server response:', result);
                Swal.fire({
                    icon: 'success',
                    title: 'המשתמש נמחק בהצלחה',
                    text: 'המשתמש נמחק מהמערכת.',
                    confirmButtonText: 'אישור'
                }).then(() => {
                    localStorage.clear();
                    window.location.href = "home.html";
                });
            } catch (error) {
                // אם יש שגיאה במהלך הבקשה, מראים הודעת שגיאה
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'שגיאה',
                    text: 'שגיאה במהלך מחיקת המשתמש.',
                    confirmButtonText: 'אישור'
                });
            }
        });
    }
});


// ההודעה של החטופים
(function () {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://bringthemhomenow.net/1.1.0/hostages-ticker.js";
    script.setAttribute(
        "integrity",
        "sha384-DHuakkmS4DXvIW79Ttuqjvl95NepBRwfVGx6bmqBJVVwqsosq8hROrydHItKdsne"
    );
    script.setAttribute("crossorigin", "anonymous");
    document.getElementsByTagName("head")[0].appendChild(script);
})();

// הפעלת כל ה-tooltip בדף
document.addEventListener('DOMContentLoaded', function () {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});
