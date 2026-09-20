// ==========================================
// GyanAstra Master - Settings Script
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAuth();

  // Firestore connection check
  verifyDatabaseConnection();
});

async function verifyDatabaseConnection() {
  const badge = document.getElementById("dbStatusBadge");
  if (!badge) return;

  try {
    // Attempt a light read to check connectivity
    await db.collection("courses").limit(1).get();
    badge.textContent = "Connected & Active";
    badge.className = "badge success";
  } catch (error) {
    console.error("Database connection check failed:", error);
    badge.textContent = "Disconnected / Permission Error";
    badge.className = "badge";
    badge.style.background = "#fee2e2";
    badge.style.color = "#dc2626";
  }
}