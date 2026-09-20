// ==========================================
// GyanAstra Master - Admin Login Handler
// ==========================================

// Yahan apna naya Gmail aur naya Password daalein
const ADMIN_EMAIL = "prajapatisumit4567@gmail.com";
const ADMIN_PASSWORD = "123456";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("adminEmail");
  const passwordInput = document.getElementById("adminPassword");
  const togglePwdBtn = document.getElementById("togglePwd");
  const errorMsg = document.getElementById("errorMsg");

  // Agar admin pehle se logged in hai toh seedha dashboard bhejein
  if (localStorage.getItem("adminLoggedIn") === "true") {
    window.location.href = "dashboard.html";
  }

  // Password hide/show toggle
  if (togglePwdBtn) {
    togglePwdBtn.addEventListener("click", () => {
      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        togglePwdBtn.textContent = "🙈";
      } else {
        passwordInput.type = "password";
        togglePwdBtn.textContent = "👁️";
      }
    });
  }

  // Login form submit check
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const enteredEmail = emailInput.value.trim();
    const enteredPass = passwordInput.value.trim();

    if (enteredEmail === ADMIN_EMAIL && enteredPass === ADMIN_PASSWORD) {
      // Login successful flag save karein
      localStorage.setItem("adminLoggedIn", "true");
      localStorage.setItem("adminEmail", ADMIN_EMAIL);
      
      // Dashboard par redirect karein
      window.location.href = "dashboard.html";
    } else {
      errorMsg.style.display = "block";
      errorMsg.textContent = "Galat Email ya Password! Kripya dobara check karein.";
      passwordInput.value = "";
    }
  });
});