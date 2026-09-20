"use strict";

document.addEventListener("DOMContentLoaded", () => {
    checkAdminAuth();
    loadPdfsTable();

    const openBtn = document.getElementById("openPdfModalBtn");
    const closeBtn = document.getElementById("closePdfModalBtn");
    const modal = document.getElementById("pdfModal");
    const form = document.getElementById("pdfForm");
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

            const title = document.getElementById("pdfTitle").value.trim();
            const category = document.getElementById("pdfCategory").value;
            const author = document.getElementById("pdfAuthor").value.trim() || "GyanAstra Team";
            const rawPdfUrl = document.getElementById("pdfUrl").value.trim();

            try {
                await db.collection("pdfs").add({
                    title: title,
                    category: category,
                    author: author,
                    fileUrl: rawPdfUrl,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                alert("✅ Study Material safalta se save ho gaya!");
                form.reset();
                modal.style.display = "none";
                loadPdfsTable();
            } catch (err) {
                console.error("PDF Save Error:", err);
                alert("PDF add karne me error aaya.");
            }
        });
    }
});

async function loadPdfsTable() {
    const tbody = document.getElementById("pdfTableBody");
    if (!tbody) return;

    try {
        const snap = await db.collection("pdfs").orderBy("createdAt", "desc").get().catch(async () => {
            return await db.collection("pdfs").get();
        });

        if (snap.empty) {
            tbody.innerHTML = `<tr><td colspan="5" style="padding: 24px; text-align: center; color: var(--text-secondary);">Koi PDF upload nahi kiya gaya hai. Naya document jodein.</td></tr>`;
            return;
        }

        tbody.innerHTML = "";
        snap.forEach(doc => {
            const data = doc.data();
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td style="font-weight: 600;">📄 ${data.title || "Untitled Document"}</td>
                <td style="color: var(--accent-cyan); font-weight: 500;">${data.category || "General"}</td>
                <td style="color: var(--text-secondary);">${data.author || "N/A"}</td>
                <td>
                    <a href="${data.fileUrl}" target="_blank" style="background: rgba(59,130,246,0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3); padding: 4px 10px; border-radius: 4px; text-decoration: none; font-size: 12px; font-weight: 600;">View Document ↗</a>
                </td>
                <td>
                    <button onclick="deletePdfDoc('${doc.id}')" style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: var(--danger); padding: 5px 12px; border-radius: 6px; cursor: pointer;">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error("Load PDFs Error:", err);
        tbody.innerHTML = `<tr><td colspan="5" style="padding: 24px; text-align: center; color: var(--danger);">Documents load nahi ho paye.</td></tr>`;
    }
}

async function deletePdfDoc(id) {
    if (confirm("Kya aap sach me is document ko delete karna chahte hain?")) {
        try {
            await db.collection("pdfs").doc(id).delete();
            loadPdfsTable();
        } catch (err) {
            console.error("Delete Error:", err);
            alert("Delete nahi ho paya.");
        }
    }
}