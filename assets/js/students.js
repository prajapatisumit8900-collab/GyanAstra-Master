"use strict";

/* =========================================
   GyanAstra Admin - Students Management
   ========================================= */

let allStudents = [];

document.addEventListener("DOMContentLoaded", () => {
    loadStudents();

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
                (s.email && s.email.toLowerCase().includes(query)) ||
                (s.exam && s.exam.toLowerCase().includes(query))
            );
            renderStudentsTable(filtered);
        });
    }
});

async function loadStudents() {
    const tbody = document.getElementById("studentsTableBody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="5" style="padding: 20px; text-align: center; color: #94a3b8;">Students load ho rahe hain...</td></tr>`;

    try {
        const snap = await db.collection("students").get();

        if (snap.empty) {
            tbody.innerHTML = `<tr><td colspan="5" style="padding: 20px; text-align: center; color: #94a3b8;">Abhi koi student register nahi hua hai.</td></tr>`;
            return;
        }

        allStudents = [];
        snap.forEach(doc => {
            allStudents.push({ id: doc.id, ...doc.data() });
        });

        renderStudentsTable(allStudents);

    } catch (err) {
        console.error("Students load error:", err);
        tbody.innerHTML = `<tr><td colspan="5" style="padding: 20px; text-align: center; color: #ef4444;">Students load nahi ho paye.</td></tr>`;
    }
}

function renderStudentsTable(students) {
    const tbody = document.getElementById("studentsTableBody");
    if (!tbody) return;

    if (!students.length) {
        tbody.innerHTML = `<tr><td colspan="5" style="padding: 20px; text-align: center; color: #94a3b8;">Koi match nahi mila.</td></tr>`;
        return;
    }

    tbody.innerHTML = "";
    students.forEach((data) => {
        let dateStr = "Recent";
        if (data.createdAt && data.createdAt.toDate) {
            dateStr = data.createdAt.toDate().toLocaleDateString();
        }

        const tr = document.createElement("tr");
        tr.style = "border-bottom: 1px solid #334155;";
        tr.innerHTML = `
            <td style="padding: 12px; font-weight: bold; color: #f8fafc;">👤 ${data.name || data.fullName || "Student"}</td>
            <td style="padding: 12px; color: #38bdf8;">${data.email || "No Email"}</td>
            <td style="padding: 12px; color: #94a3b8;">${data.targetExam || data.exam || "UPSC / General"}</td>
            <td style="padding: 12px; color: #64748b;">${dateStr}</td>
            <td style="padding: 12px;">
                <button onclick="removeStudent('${data.id}')" style="background: #ef4444; border: none; padding: 4px 10px; border-radius: 4px; color: #fff; cursor: pointer;">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function removeStudent(id) {
    if (confirm("Kya aap sach me is student record ko delete karna chahte hain?")) {
        try {
            await db.collection("students").doc(id).delete();
            loadStudents();
        } catch (err) {
            console.error("Delete Error:", err);
            alert("Delete nahi ho paya.");
        }
    }
}