"use strict";

let coursesMap = {};

document.addEventListener("DOMContentLoaded", () => {
    checkAdminAuth();
    loadCoursesDropdown();
    loadSubjectsTable();

    const openBtn = document.getElementById("openSubjectModalBtn");
    const closeBtn = document.getElementById("closeSubjectModalBtn");
    const modal = document.getElementById("subjectModal");
    const form = document.getElementById("subjectForm");
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

            const courseId = document.getElementById("subjectCourseSelect").value;
            const name = document.getElementById("subjectName").value.trim();
            const rawThumbnail = document.getElementById("subjectThumbnail").value.trim();
            const description = document.getElementById("subjectDescription").value.trim();

            const courseName = coursesMap[courseId]?.title || "General Course";
            const formattedThumbnail = formatMediaUrl(rawThumbnail, "image");

            try {
                await db.collection("subjects").add({
                    name: name,
                    title: name,
                    courseId: courseId,
                    courseName: courseName,
                    thumbnail: formattedThumbnail,
                    rawThumbnail: rawThumbnail,
                    description: description,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                alert("✅ Subject safalta se jud gaya!");
                form.reset();
                modal.style.display = "none";
                loadSubjectsTable();
            } catch (err) {
                console.error("Subject Save Error:", err);
                alert("Subject add karne me dikkat aayi.");
            }
        });
    }
});

async function loadCoursesDropdown() {
    const select = document.getElementById("subjectCourseSelect");
    if (!select) return;

    try {
        const snap = await db.collection("courses").get();
        select.innerHTML = '<option value="">-- Choose Course --</option>';
        coursesMap = {};

        snap.forEach(doc => {
            coursesMap[doc.id] = doc.data();
            const opt = document.createElement("option");
            opt.value = doc.id;
            opt.textContent = `${doc.data().title || "Untitled Course"}`;
            select.appendChild(opt);
        });
    } catch (err) {
        console.error("Dropdown load error:", err);
    }
}

async function loadSubjectsTable() {
    const tbody = document.getElementById("subjectTableBody");
    if (!tbody) return;

    try {
        const snap = await db.collection("subjects").get();

        if (snap.empty) {
            tbody.innerHTML = `<tr><td colspan="5" style="padding: 24px; text-align: center; color: var(--text-secondary);">Koi subject nahi mila. Upar se naya subject banayein.</td></tr>`;
            return;
        }

        tbody.innerHTML = "";
        snap.forEach(doc => {
            const data = doc.data();
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>
                    <img src="${data.thumbnail || 'https://placehold.co/100x60?text=No+Image'}" 
                         alt="Thumbnail"
                         style="width: 70px; height: 44px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border);" 
                         onerror="this.src='https://placehold.co/100x60?text=Invalid+Link';">
                </td>
                <td style="font-weight: 600;">${data.name || data.title || "Untitled"}</td>
                <td style="color: var(--accent-cyan); font-weight: 500;">${data.courseName || "Attached Course"}</td>
                <td style="color: var(--text-secondary); font-size: 13px;">${data.description || "N/A"}</td>
                <td>
                    <button onclick="deleteSubject('${doc.id}')" style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: var(--danger); padding: 5px 12px; border-radius: 6px; cursor: pointer;">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error("Load Subjects Error:", err);
        tbody.innerHTML = `<tr><td colspan="5" style="padding: 24px; text-align: center; color: var(--danger);">Subjects load nahi ho paye.</td></tr>`;
    }
}

async function deleteSubject(id) {
    if (confirm("Kya aap sach me is subject ko delete karna chahte hain?")) {
        try {
            await db.collection("subjects").doc(id).delete();
            loadSubjectsTable();
        } catch (err) {
            console.error("Delete Error:", err);
            alert("Delete nahi ho paya.");
        }
    }
}