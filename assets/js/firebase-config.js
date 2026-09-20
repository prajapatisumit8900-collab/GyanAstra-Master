// ==========================================
// GyanAstra Master - Firebase Configuration
// ==========================================

const firebaseConfig = {
  apiKey: "AIzaSyDqcL86o1UwOGn9wcLQqVhDF0lzJQD1NG8",
  authDomain: "gyanastra-30557.firebaseapp.com",
  projectId: "gyanastra-30557",
  storageBucket: "gyanastra-30557.firebasestorage.app",
  messagingSenderId: "691234854780",
  appId: "1:691234854780:web:c1213c6b4e99ee4815f6f9",
  measurementId: "G-96793NR52M"
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