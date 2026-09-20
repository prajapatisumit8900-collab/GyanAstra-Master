// ==========================================
// GyanAstra Master - Firebase Configuration
// ==========================================

const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyReplaceIfYouHaveRealOne",
  authDomain: "gyanastra-30557.firebaseapp.com",
  projectId: "gyanastra-30557",
  storageBucket: "gyanastra-30557.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize Firestore
const db = firebase.firestore();

// Global Admin Auth Check
function checkAdminAuth() {
  const isLoggedIn = localStorage.getItem("adminLoggedIn");
  if (isLoggedIn !== "true") {
    window.location.href = "index.html";
  }
}

// Logout Function
function logoutAdmin() {
  localStorage.removeItem("adminLoggedIn");
  localStorage.removeItem("adminEmail");
  window.location.href = "index.html";
}