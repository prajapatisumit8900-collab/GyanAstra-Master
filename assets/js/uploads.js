"use strict";

document.addEventListener("DOMContentLoaded", () => {
    loadPdfs();

    const openBtn = document.getElementById("openPdfModalBtn");
    const closeBtn = document.getElementById("closePdfModalBtn");
    const modal = document.getElementById("pdfModal");
    const form = document.getElementById("pdfForm");

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
            const url = document.getElementById("pdfUrl").value.trim();

            try {
                await db.collection("pdfs").add({
                    title: title,
                    category: category,
                    author: author,
                    fileUrl: url,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                alert("✅ PDF Safalta-purvak add ho gaya!");
                form.reset();
                modal.style.display = "none";
                loadPdfs();
            } catch (err) {
                console.error("PDF Save Error:", err);
                alert("PDF add karne me dikkat aayi.");
            }
        });
    }
});

async function loadPdfs() {
    const tableBody = document.getElementById("pdfTableBody");
    if (!tableBody) return;

    try {
        const snap = await db.collection("pdfs").orderBy("createdAt", "desc").get().catch(async () => {
            return await db.collection("pdfs").get();
        });

        if (snap.empty) {
            tableBody.innerHTML = `<tr><td colspan="5" style="padding: 20px; text-align: center; color: #94a3b8;">Koi PDF upload nahi kiya gaya hai. Upar se naya PDF add karein.</td></tr>`;
            return;
        }

        tableBody.innerHTML = "";
        snap.forEach((doc) => {
            const data = doc.data();
            const tr = document.createElement("tr");
            tr.style = "border-bottom: 1px solid #334155;";
            tr.innerHTML = `
                <td style="padding: 12px; font-weight: 500;">📖 ${data.title || "Untitled"}</td>
                <td style="padding: 12px; color: #38bdf8;">${data.category || "General"}</td>
                <td style="padding: 12px; color: #94a3b8;">${data.author || "N/A"}</td>
                <td style="padding: 12px;">
                    <a href="${data.fileUrl}" target="_blank" style="color: #60a5fa; text-decoration: underline;">View File ↗</a>
                </td>
                <td style="padding: 12px;">
                    <button onclick="deletePdf('${doc.id}')" style="background: #ef4444; border: none; padding: 4px 10px; border-radius: 4px; color: #fff; cursor: pointer;">Delete</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    } catch (err) {
        console.error("Load PDFs Error:", err);
        tableBody.innerHTML = `<tr><td colspan="5" style="padding: 20px; text-align: center; color: #ef4444;">PDFs load nahi ho paye.</td></tr>`;
    }
}

async function deletePdf(id) {
    if (confirm("Kya aap sach me is PDF ko delete karna chahte hain?")) {
        try {
            await db.collection("pdfs").doc(id).delete();
            loadPdfs();
        } catch (err) {
            console.error("Delete Error:", err);
            alert("Delete nahi ho paya.");
        }
    }
}