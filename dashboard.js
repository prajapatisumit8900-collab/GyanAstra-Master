// ==========================================
// GyanAstra Master - Dashboard Script
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  // Login check
  checkAdminAuth();

  // Load Real-time Counts
  loadDashboardStats();
});

async function loadDashboardStats() {
  const coursesCountEl = document.getElementById("totalCoursesCount");
  const subjectsCountEl = document.getElementById("totalSubjectsCount");
  const lessonsCountEl = document.getElementById("totalLessonsCount");
  const studentsCountEl = document.getElementById("totalStudentsCount");

  try {
    // 1. Total Courses
    const coursesSnap = await db.collection("courses").get();
    if (coursesCountEl) coursesCountEl.textContent = coursesSnap.size;

    // 2. Total Subjects
    const subjectsSnap = await db.collection("subjects").get();
    if (subjectsCountEl) subjectsCountEl.textContent = subjectsSnap.size;

    // 3. Total Lessons
    const lessonsSnap = await db.collection("lessons").get();
    if (lessonsCountEl) lessonsCountEl.textContent = lessonsSnap.size;

    // 4. Total Students
    const studentsSnap = await db.collection("users").get();
    if (studentsCountEl) studentsCountEl.textContent = studentsSnap.size;
  } catch (error) {
    console.error("Dashboard stats load karne me error:", error);
  }
}