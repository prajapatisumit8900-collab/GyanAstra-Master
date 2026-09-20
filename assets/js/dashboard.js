"use strict";

document.addEventListener("DOMContentLoaded", () => {
    checkAdminAuth();
    loadDashboardStats();

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            if (confirm("Kya aap Admin panel se logout karna chahte hain?")) {
                logoutAdmin();
            }
        });
    }
});

async function loadDashboardStats() {
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

        const totalCourses = document.getElementById("totalCourses");
        const totalSubjects = document.getElementById("totalSubjects");
        const totalChapters = document.getElementById("totalChapters");
        const totalLessons = document.getElementById("totalLessons");
        const totalPDFs = document.getElementById("totalPDFs");
        const totalStudents = document.getElementById("totalStudents");

        if (totalCourses) totalCourses.textContent = coursesSnap.size || 0;
        if (totalSubjects) totalSubjects.textContent = subjectsSnap.size || 0;
        if (totalChapters) totalChapters.textContent = chaptersSnap.size || 0;
        if (totalLessons) totalLessons.textContent = lessonsSnap.size || 0;
        if (totalPDFs) totalPDFs.textContent = pdfsSnap.size || 0;
        if (totalStudents) totalStudents.textContent = studentsSnap.size || 0;

    } catch (err) {
        console.error("Dashboard Stats Error:", err);
    }
}