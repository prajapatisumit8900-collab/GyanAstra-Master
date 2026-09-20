"use strict";

/* =========================================
   GyanAstra Admin - Dashboard Realtime Stats
   ========================================= */

// Check Auth
const isAdminLoggedIn = localStorage.getItem("isGyanAstraAdminLoggedIn");
if (isAdminLoggedIn !== "true") {
    // Agar login session check lagana chahein to yahan uncomment karein:
    // window.location.href = "./index.html";
}

document.addEventListener("DOMContentLoaded", () => {
    loadRealtimeStats();

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            if (confirm("Kya aap Admin panel se logout karna chahte hain?")) {
                localStorage.removeItem("isGyanAstraAdminLoggedIn");
                window.location.href = "./index.html";
            }
        });
    }
});

async function loadRealtimeStats() {
    try {
        const [
            coursesSnap,
            subjectsSnap,
            chaptersSnap,
            lessonsSnap,
            pdfsSnap,
            studentsSnap
        ] = await Promise.all([
            db.collection("courses").get().catch(() => ({ size: 0 })),
            db.collection("subjects").get().catch(() => ({ size: 0 })),
            db.collection("chapters").get().catch(() => ({ size: 0 })),
            db.collection("lessons").get().catch(() => ({ size: 0 })),
            db.collection("pdfs").get().catch(() => ({ size: 0 })),
            db.collection("students").get().catch(() => ({ size: 0 }))
        ]);

        const countCourses = document.getElementById("totalCourses");
        const countSubjects = document.getElementById("totalSubjects");
        const countChapters = document.getElementById("totalChapters");
        const countLessons = document.getElementById("totalLessons");
        const countPDFs = document.getElementById("totalPDFs");
        const countStudents = document.getElementById("totalStudents");

        if (countCourses) countCourses.textContent = coursesSnap.size || 0;
        if (countSubjects) countSubjects.textContent = subjectsSnap.size || 0;
        if (countChapters) countChapters.textContent = chaptersSnap.size || 0;
        if (countLessons) countLessons.textContent = lessonsSnap.size || 0;
        if (countPDFs) countPDFs.textContent = pdfsSnap.size || 0;
        if (countStudents) countStudents.textContent = studentsSnap.size || 0;

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
    }
}