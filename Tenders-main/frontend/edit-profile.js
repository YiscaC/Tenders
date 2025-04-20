document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.email) {
      alert("לא נמצאה התחברות");
      window.location.href = "login.html";
      return;
    }
  
    // מילוי ערכים נוכחיים
    document.getElementById('name').value = user.name;
    document.getElementById('email').value = user.email;
  
    document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
  
      // בדיקה שהאימייל לא ריק (כי הוא המזהה)
      if (!email) {
        document.getElementById('message').textContent = "האימייל הוא שדה חובה";
        return;
      }
  
      // בניית האובייקט רק עם שדות לא ריקים
      const updatedUser = {};
      if (name) updatedUser.name = name;
      if (email) updatedUser.email = email;
      if (password) updatedUser.password = password; // רק אם מולא בפועל
  
      try {
        const res = await fetch(`http://localhost:3001/api/update/${encodeURIComponent(user.email)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedUser)
        });
  
        const result = await res.json();
        if (result.success) {
          document.getElementById('message').textContent = "הפרטים עודכנו בהצלחה!";
          // עדכון בלוקאל סטורג' רק של שם ואימייל
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
  });
  