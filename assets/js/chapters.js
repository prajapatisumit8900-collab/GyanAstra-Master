"use strict";

let subjectsMap = {};

document.addEventListener("DOMContentLoaded", () => {
    checkAdminAuth();
    loadSubjectsDropdown();
    loadChaptersTable();

    const openBtn = document.getElementById("openChapterModalBtn");
    const closeBtn = document.getElementById("closeChapterModalBtn");
    const modal = document.getElementById("chapterModal");
    const form = document.getElementById("chapterForm");
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

            const subjectId = document.getElementById("chapterSubjectSelect").value;
            const title = document.getElementById("chapterTitle").value.trim();
            const order = Number(document.getElementById("chapterOrder").value) || 1;
            const description = document.getElementById("chapterDescription").value.trim();

            const subjectInfo = subjectsMap[subjectId] || {};
            const subjectName = subjectInfo.title || subjectInfo.name || "Subject";
            const courseId = subjectInfo.courseId || "";

            try {
                await db.collection("chapters").add({
                    title: title,
                    subjectId: subjectId,
                    subjectName: subjectName,
                    courseId: courseId,
                    order: order,
                    description: description,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                alert("✅ Chapter safalta se add ho gaya!");
                form.reset();
                modal.style.display = "none";
                loadChaptersTable();
            } catch (err) {
                console.error("Chapter Save Error:", err);
                alert("Chapter add karne me error aaya.");
            }
        });
    }
});

async function loadSubjectsDropdown() {
    const select = document.getElementById("chapterSubjectSelect");
    if (!select) return;

    try {
        const snap = await db.collection("subjects").get();
        select.innerHTML = '<option value="">-- Choose Subject --</option>';
        subjectsMap = {};

        snap.forEach(doc => {
            subjectsMap[doc.id] = doc.data();
            const opt = document.createElement("option");
            opt.value = doc.id;
            opt.textContent = `${doc.data().name || doc.data().title || "Untitled Subject"}`;
            select.appendChild(opt);
        });
    } catch (err) {
        console.error("Subjects Dropdown Error:", err);
    }
}

async function loadChaptersTable() {
    const tbody = document.getElementById("chapterTableBody");
    if (!tbody) return;

    try {
        const snap = await db.collection("chapters").orderBy("order", "asc").get().catch(async () => {
            return await db.collection("chapters").get();
        });

        if (snap.empty) {
            tbody.innerHTML = `<tr><td colspan="5" style="padding: 24px; text-align: center; color: var(--text-secondary);">Koi chapter nahi mila. Naya chapter jodein.</td></tr>`;
            return;
        }

        tbody.innerHTML = "";
        snap.forEach(doc => {
            const data = doc.data();
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td style="color: var(--accent-cyan); font-weight: 700;">#${data.order || 1}</td>
                <td style="font-weight: 600;">📖 ${data.title || "Untitled Chapter"}</td>
                <td style="color: var(--text-secondary);">${data.subjectName || "Attached Subject"}</td>
                <td style="color: var(--text-secondary); font-size: 13px;">${data.description || "N/A"}</td>
                <td>
                    <button onclick="deleteChapter('${doc.id}')" style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: var(--danger); padding: 5px 12px; border-radius: 6px; cursor: pointer;">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error("Load Chapters Error:", err);
        tbody.innerHTML = `<tr><td colspan="5" style="padding: 24px; text-align: center; color: var(--danger);">Chapters load nahi ho paye.</td></tr>`;
    }
}

async function deleteChapter(id) {
    if (confirm("Kya aap sach me is chapter ko delete karna chahte hain?")) {
        try {
            await db.collection("chapters").doc(id).delete();
            loadChaptersTable();
        } catch (err) {
            console.error("Delete Error:", err);
            alert("Delete nahi ho paya.");
        }
    }
}