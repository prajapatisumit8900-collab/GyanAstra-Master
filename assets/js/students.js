"use strict";

let allStudents = [];

document.addEventListener("DOMContentLoaded", () => {
    checkAdminAuth();
    loadStudents();

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            if (confirm("Logout karna chahte hain?")) logoutAdmin();
        });
    }

    const refreshBtn = document.getElementById("refreshStudentsBtn");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => loadStudents());
    }

    const searchInput = document.getElementById("searchStudentInput");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = allStudents.filter(s => 
                (s.name && s.name.toLowerCase().includes(query)) ||
                (s.fullName && s.fullName.toLowerCase().includes(query)) ||
                (s.email && s.email.toLowerCase().includes(query)) ||
                (s.targetExam && s.targetExam.toLowerCase().includes(query)) ||
                (s.exam && s.exam.toLowerCase().includes(query))
            );
            renderStudentsTable(filtered);
        });
    }
});

async function loadStudents() {
    const tbody = document.getElementById("studentsTableBody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="5" style="padding: 24px; text-align: center; color: var(--text-secondary);">Students load ho rahe hain...</td></tr>`;

    try {
        const snap = await db.collection("students").get();

        if (snap.empty) {
            tbody.innerHTML = `<tr><td colspan="5" style="padding: 24px; text-align: center; color: var(--text-secondary);">Koi student register nahi hua hai abhi tak.</td></tr>`;
            return;
        }

        allStudents = [];
        snap.forEach(doc => {
            allStudents.push({ id: doc.id, ...doc.data() });
        });

        renderStudentsTable(allStudents);

    } catch (err) {
        console.error("Students Load Error:", err);
        tbody.innerHTML = `<tr><td colspan="5" style="padding: 24px; text-align: center; color: var(--danger);">Students list load nahi ho payi.</td></tr>`;
    }
}

function renderStudentsTable(studentsList) {
    const tbody = document.getElementById("studentsTableBody");
    if (!tbody) return;

    if (!studentsList.length) {
        tbody.innerHTML = `<tr><td colspan="5" style="padding: 24px; text-align: center; color: var(--text-secondary);">Koi student match nahi mila.</td></tr>`;
        return;
    }

    tbody.innerHTML = "";
    studentsList.forEach(data => {
        let dateStr = "Recent";
        if (data.createdAt && data.createdAt.toDate) {
            dateStr = data.createdAt.toDate().toLocaleDateString();
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="font-weight: 600;">👤 ${data.name || data.fullName || "Learner"}</td>
            <td style="color: var(--accent-cyan); font-weight: 500;">${data.email || "No Email"}</td>
            <td><span style="background: rgba(59,130,246,0.15); color: #60a5fa; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${data.targetExam || data.exam || "UPSC / General"}</span></td>
            <td style="color: var(--text-secondary); font-size: 13px;">${dateStr}</td>
            <td>
                <button onclick="deleteStudentRecord('${data.id}')" style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: var(--danger); padding: 5px 12px; border-radius: 6px; cursor: pointer;">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function deleteStudentRecord(id) {
    if (confirm("Kya aap is student record ko delete karna chahte hain?")) {
        try {
            await db.collection("students").doc(id).delete();
            loadStudents();
        } catch (err) {
            console.error("Delete Error:", err);
            alert("Delete nahi ho paya.");
        }
    }
}