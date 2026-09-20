"use strict";

let chaptersMap = {};

document.addEventListener("DOMContentLoaded", () => {
    checkAdminAuth();
    loadChaptersDropdown();
    loadLessonsTable();

    const openBtn = document.getElementById("openLessonModalBtn");
    const closeBtn = document.getElementById("closeLessonModalBtn");
    const modal = document.getElementById("lessonModal");
    const form = document.getElementById("lessonForm");
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            if (confirm("Logout karna chahte hain?")) logoutAdmin();
        });
    }

    if (openBtn && modal) {
        openBtn.addEventListener("click", () => modal.style.display = "flex");
    }
    if (closeBtn && modal) {
        closeBtn.addEventListener("click", () => modal.style.display = "none");
    }

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const chapterId = document.getElementById("lessonChapterSelect").value;
            const title = document.getElementById("lessonTitle").value.trim();
            const order = Number(document.getElementById("lessonOrder").value) || 1;
            const rawVideoUrl = document.getElementById("lessonVideoUrl").value.trim();

            const chapterInfo = chaptersMap[chapterId] || {};
            const chapterName = chapterInfo.title || "Chapter";
            const subjectId = chapterInfo.subjectId || "";
            const courseId = chapterInfo.courseId || "";

            // Auto-convert YouTube or Drive Link
            const embedVideoUrl = formatMediaUrl(rawVideoUrl, "video");

            try {
                await db.collection("lessons").add({
                    title: title,
                    chapterId: chapterId,
                    chapterName: chapterName,
                    subjectId: subjectId,
                    courseId: courseId,
                    order: order,
                    videoUrl: embedVideoUrl,
                    rawVideoUrl: rawVideoUrl,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                alert("✅ Video Lesson safalta se jud gaya!");
                form.reset();
                modal.style.display = "none";
                loadLessonsTable();
            } catch (err) {
                console.error("Lesson Save Error:", err);
                alert("Video lesson add karne me dikkat aayi.");
            }
        });
    }
});

async function loadChaptersDropdown() {
    const select = document.getElementById("lessonChapterSelect");
    if (!select) return;

    try {
        const snap = await db.collection("chapters").get();
        select.innerHTML = '<option value="">-- Choose Chapter --</option>';
        chaptersMap = {};

        snap.forEach(doc => {
            chaptersMap[doc.id] = doc.data();
            const opt = document.createElement("option");
            opt.value = doc.id;
            opt.textContent = `${doc.data().title || "Untitled Chapter"}`;
            select.appendChild(opt);
        });
    } catch (err) {
        console.error("Chapters Dropdown Error:", err);
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
            tbody.innerHTML = `<tr><td colspan="5" style="padding: 24px; text-align: center; color: var(--text-secondary);">Koi video lesson nahi mila. Naya lesson jodein.</td></tr>`;
            return;
        }

        tbody.innerHTML = "";
        snap.forEach(doc => {
            const data = doc.data();
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td style="color: var(--accent-cyan); font-weight: 700;">#${data.order || 1}</td>
                <td style="font-weight: 600;">🎥 ${data.title || "Untitled Lesson"}</td>
                <td style="color: var(--text-secondary);">${data.chapterName || "Attached Chapter"}</td>
                <td>
                    <a href="${data.videoUrl}" target="_blank" style="background: var(--gradient); color: #fff; padding: 4px 10px; border-radius: 4px; text-decoration: none; font-size: 12px; font-weight: 600; display: inline-block;">Watch ▶</a>
                </td>
                <td>
                    <button onclick="deleteLesson('${doc.id}')" style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: var(--danger); padding: 5px 12px; border-radius: 6px; cursor: pointer;">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error("Load Lessons Error:", err);
        tbody.innerHTML = `<tr><td colspan="5" style="padding: 24px; text-align: center; color: var(--danger);">Lessons load nahi ho paye.</td></tr>`;
    }
}

async function deleteLesson(id) {
    if (confirm("Kya aap sach me is lesson ko delete karna chahte hain?")) {
        try {
            await db.collection("lessons").doc(id).delete();
            loadLessonsTable();
        } catch (err) {
            console.error("Delete Error:", err);
            alert("Delete nahi ho paya.");
        }
    }
}