// מחכים שה-DOM יתממש (יתממש) לפני שמבצעים פעולות עם האלמנטים בדף
let tempUserData = null;

document.addEventListener('DOMContentLoaded', () => {
    function updateCartCount() {
        let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        const cartCountElement = document.getElementById('cart-count');
        cartCountElement.textContent = cartItems.length;
        cartCountElement.style.display = cartItems.length === 0 ? 'none' : 'inline';
    }

    window.onload = function () {
        updateCartCount();
    };

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const loginData = {
                email: document.getElementById('login-email').value,
                password: document.getElementById('login-password').value
            };

            try {
                const response = await fetch('http://localhost:3001/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(loginData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    Swal.fire({ icon: 'error', title: 'הכניסה נכשלה', text: errorData.message });
                    return;
                }

                const result = await response.json();
                localStorage.setItem('user', JSON.stringify({ name: result.name, email: result.email }));
                localStorage.setItem('userEmail', result.email);
                Swal.fire({ text: '!ברוך הבא', title: `${result.name}`, confirmButtonText: 'אישור' })
                    .then(() => window.location.href = "home.html");
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'שגיאה', text: 'שגיאה במהלך הכניסה.' });
            }
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            if (!tempUserData) {
                const userData = {
                    name: document.getElementById('register-username').value,
                    email: document.getElementById('register-email').value,
                    password: document.getElementById('register-password').value
                };
                try {
                    const response = await fetch('http://localhost:3001/api/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(userData)
                    });
                    const result = await response.json();
                    if (!response.ok) {
                        Swal.fire({ icon: 'error', title: 'שגיאה', text: result.message });
                        return;
                    }
                    tempUserData = userData;
                    document.getElementById('verification-code-group').style.display = 'block';
                    Swal.fire({ icon: 'info', title: 'נשלח קוד למייל', text: 'בדוק את הדוא"ל והזן את הקוד' });
                } catch (error) {
                    Swal.fire({ icon: 'error', title: 'שגיאה', text: 'שגיאה בשליחת קוד' });
                }
            } else {
                const code = document.getElementById('verification-code').value;
                try {
                    const response = await fetch('http://localhost:3001/api/register-with-code', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: tempUserData.name,
                            email: tempUserData.email,
                            password: tempUserData.password,
                            code
                        })
                    });
                    const result = await response.json();
                    if (!response.ok) {
                        Swal.fire({ icon: 'error', title: 'שגיאה', text: result.message });
                        return;
                    }
                    Swal.fire({ icon: 'success', title: 'נרשמת בהצלחה!', confirmButtonText: 'התחברות' })
                        .then(() => {
                            const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
                            if (registerModal) registerModal.hide();
                            tempUserData = null;
                            document.getElementById('verification-code-group').style.display = 'none';
                        });
                } catch (error) {
                    Swal.fire({ icon: 'error', title: 'שגיאה', text: 'שגיאה באימות הקוד' });
                }
            }
        });
    }

    const registerModalElement = document.getElementById('registerModal');
    if (registerModalElement) {
        registerModalElement.addEventListener('hidden.bs.modal', () => {
            const registerForm = document.getElementById('registerForm');
            if (registerForm) registerForm.reset();
            tempUserData = null;
            document.getElementById('verification-code-group').style.display = 'none';
        });
    }

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
        if (logoutButton) logoutButton.style.display = 'block';
        if (deleteUserButton) deleteUserButton.style.display = 'block';
        if (loginButton) loginButton.style.display = 'none';
    } else {
        if (userNavItem) userNavItem.style.display = 'none';
        if (loginButton) loginButton.style.display = 'block';
        if (logoutButton) logoutButton.style.display = 'none';
        if (deleteUserButton) deleteUserButton.style.display = 'none';
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'home.html';
        });
    }

    if (deleteUserButton) {
        deleteUserButton.addEventListener('click', async () => {
            const confirmation = await Swal.fire({
                text: 'האם אתה בטוח שברצונך למחוק את המשתמש?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'כן,מחק',
                cancelButtonText: 'לא, ביטול'
            });

            if (!confirmation.isConfirmed) return;

            const storedUser = localStorage.getItem('user');
            if (!storedUser) {
                Swal.fire({ icon: 'info', title: 'אין משתמש מחובר', text: 'לא נמצא משתמש מחובר למחיקה.' });
                return;
            }

            const user = JSON.parse(storedUser);
            const userName = user.name;

            try {
                const response = await fetch('http://localhost:3001/api/delete', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: userName })
                });

                const result = await response.json();
                if (!response.ok) {
                    Swal.fire({ icon: 'error', title: 'שגיאה במחיקת המשתמש', text: result.message });
                    return;
                }

                Swal.fire({ icon: 'success', title: 'המשתמש נמחק בהצלחה', text: 'המשתמש נמחק מהמערכת.' })
                    .then(() => {
                        localStorage.clear();
                        window.location.href = "home.html";
                    });
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'שגיאה', text: 'שגיאה במהלך מחיקת המשתמש.' });
            }
        });
    }
});

(function () {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://bringthemhomenow.net/1.1.0/hostages-ticker.js";
    script.setAttribute("integrity", "sha384-DHuakkmS4DXvIW79Ttuqjvl95NepBRwfVGx6bmqBJVVwqsosq8hROrydHItKdsne");
    script.setAttribute("crossorigin", "anonymous");
    document.getElementsByTagName("head")[0].appendChild(script);
})();

document.addEventListener('DOMContentLoaded', function () {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});
