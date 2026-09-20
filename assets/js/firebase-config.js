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

// ==========================================
// Media URL Transformer (Google Drive & YouTube)
// ==========================================
function formatMediaUrl(url, type = "image") {
  if (!url || typeof url !== "string") return "";
  url = url.trim();

  // 1. Google Drive Image/Thumbnail Link to Direct Embed
  if (type === "image" && url.includes("drive.google.com")) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
  }

  // 2. YouTube Video Link to Embed Player
  if (type === "video" && (url.includes("youtube.com") || url.includes("youtu.be"))) {
    let videoId = "";
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("watch?v=")) {
      videoId = url.split("watch?v=")[1]?.split("&")[0];
    } else if (url.includes("/embed/")) {
      return url;
    }
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }

  // 3. Google Drive Video Link to Streamable Preview Player
  if (type === "video" && url.includes("drive.google.com")) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
  }

  return url;
}