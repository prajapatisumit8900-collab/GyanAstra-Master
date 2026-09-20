"use strict";

/* =========================================
   GyanAstra Admin - Video Lessons (Firestore Live)
   ========================================= */

let chaptersMap = {};

document.addEventListener("DOMContentLoaded", () => {
    initLessonEvents();
    loadChaptersDropdown();
    loadLessonsTable();
});

function initLessonEvents() {
    const openBtn = document.getElementById("openLessonModalBtn");
    const closeBtn = document.getElementById("closeLessonModalBtn");
    const modal = document.getElementById("lessonModal");
    const form = document.getElementById("lessonForm");

    if (openBtn && modal) {
        openBtn.addEventListener("click", () => modal.style.display = "flex");
    }
    if (closeBtn && modal) {
        closeBtn.addEventListener("click", () => modal.style.display = "none");
    }

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const title = document.getElementById("lessonTitle").value.trim();
            const chapterId = document.getElementById("lessonChapterSelect").value;
            const order = Number(document.getElementById("lessonOrder").value) || 1;
            const videoUrl = document.getElementById("lessonVideoUrl").value.trim();

            const selectedChapter = chaptersMap[chapterId] || {};
            const subjectId = selectedChapter.subjectId || "";

            try {
                await db.collection("lessons").add({
                    title: title,
                    chapterId: chapterId,
                    chapterName: selectedChapter.title || "Chapter",
                    subjectId: subjectId,
                    order: order,
                    videoUrl: videoUrl,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                alert("✅ Video Lesson safalta se jud gaya!");
                form.reset();
                modal.style.display = "none";
                loadLessonsTable();
            } catch (err) {
                console.error("Lesson Save Error:", err);
                alert("Lesson add karne me error aaya.");
            }
        });
    }
}

async function loadChaptersDropdown() {
    const select = document.getElementById("lessonChapterSelect");
    if (!select) return;

    try {
        const snap = await db.collection("chapters").get();
        select.innerHTML = '<option value="">-- Choose Chapter --</option>';
        chaptersMap = {};

        snap.forEach((doc) => {
            const ch = doc.data();
            chaptersMap[doc.id] = ch;
            const opt = document.createElement("option");
            opt.value = doc.id;
            opt.textContent = `${ch.title || "Untitled Chapter"}`;
            select.appendChild(opt);
        });
    } catch (err) {
        console.error("Dropdown load error:", err);
    }
}

async function loadLessonsTable() {
    const tbody = document.getElementById("lessonsTableBody");
    if (!tbody) return;

    try {
        const snap = await db.collection("lessons").orderBy("order", "asc").get().catch(async () => {
            return await db.collection("lessons").get();
        });

        if (snap.empty) {
            tbody.innerHTML = `<tr><td colspan="5" style="padding: 20px; text-align: center; color: #94a3b8;">Koi Video Lesson add nahi hai. Naya lesson add karein.</td></tr>`;
            return;
        }

        tbody.innerHTML = "";
        snap.forEach((doc) => {
            const data = doc.data();
            const tr = document.createElement("tr");
            tr.style = "border-bottom: 1px solid #334155;";
            tr.innerHTML = `
                <td style="padding: 12px; color: #38bdf8; font-weight: bold;">#${data.order || 1}</td>
                <td style="padding: 12px; font-weight: 500;">🎥 ${data.title || "Untitled"}</td>
                <td style="padding: 12px; color: #94a3b8;">${data.chapterName || data.chapterId || "N/A"}</td>
                <td style="padding: 12px;">
                    <a href="${data.videoUrl}" target="_blank" style="background:#2563eb; color:#fff; padding:4px 10px; border-radius:4px; text-decoration:none; font-size:12px;">Watch Link ▶</a>
                </td>
                <td style="padding: 12px;">
                    <button onclick="deleteLesson('${doc.id}')" style="background: #ef4444; border: none; padding: 4px 10px; border-radius: 4px; color: #fff; cursor: pointer;">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Load Lessons Error:", err);
        tbody.innerHTML = `<tr><td colspan="5" style="padding: 20px; text-align: center; color: #ef4444;">Lessons load nahi ho paye.</td></tr>`;
    }
}

async function deleteLesson(id) {
    if (confirm("Kya aap is video lesson ko hatana chahte hain?")) {
        try {
            await db.collection("lessons").doc(id).delete();
            loadLessonsTable();
        } catch (err) {
            console.error("Delete Error:", err);
            alert("Delete nahi ho paya.");
        }
    }
}