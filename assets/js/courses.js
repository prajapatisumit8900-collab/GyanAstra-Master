"use strict";

document.addEventListener("DOMContentLoaded", () => {
    checkAdminAuth();
    loadCourses();

    const openBtn = document.getElementById("openCourseModalBtn");
    const closeBtn = document.getElementById("closeCourseModalBtn");
    const modal = document.getElementById("courseModal");
    const form = document.getElementById("courseForm");
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

            const title = document.getElementById("courseTitle").value.trim();
            const category = document.getElementById("courseCategory").value;
            const rawThumbnail = document.getElementById("courseThumbnail").value.trim();
            const level = document.getElementById("courseLevel").value;
            const description = document.getElementById("courseDescription").value.trim();

            // Google Drive Auto-Conversion Helper
            const formattedThumbnail = formatMediaUrl(rawThumbnail, "image");

            try {
                await db.collection("courses").add({
                    title: title,
                    category: category,
                    thumbnail: formattedThumbnail,
                    rawThumbnail: rawThumbnail,
                    level: level,
                    description: description,
                    type: "free",
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                alert("✅ Course safalta se add ho gaya!");
                form.reset();
                modal.style.display = "none";
                loadCourses();
            } catch (err) {
                console.error("Course Save Error:", err);
                alert("Course save nahi ho paya.");
            }
        });
    }
});

async function loadCourses() {
    const tbody = document.getElementById("courseTableBody");
    if (!tbody) return;

    try {
        const snap = await db.collection("courses").get();

        if (snap.empty) {
            tbody.innerHTML = `<tr><td colspan="6" style="padding: 24px; text-align: center; color: var(--text-secondary);">Koi course nahi mila. Naya course jodein.</td></tr>`;
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
                <td style="font-weight: 600;">${data.title || "Untitled"}</td>
                <td style="color: var(--accent-cyan); font-weight: 500;">${data.category || "General"}</td>
                <td><span style="background: rgba(59,130,246,0.15); color:#60a5fa; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${data.level || "Beginner"}</span></td>
                <td><span style="color: var(--success); font-weight: 600;">Active</span></td>
                <td>
                    <button onclick="deleteCourse('${doc.id}')" style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: var(--danger); padding: 5px 12px; border-radius: 6px; cursor: pointer;">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error("Load Courses Error:", err);
        tbody.innerHTML = `<tr><td colspan="6" style="padding: 24px; text-align: center; color: var(--danger);">Data load nahi ho paya.</td></tr>`;
    }
}

async function deleteCourse(id) {
    if (confirm("Kya aap is course ko delete karna chahte hain?")) {
        try {
            await db.collection("courses").doc(id).delete();
            loadCourses();
        } catch (err) {
            console.error("Delete Error:", err);
            alert("Delete nahi ho paya.");
        }
    }
}