// ==========================================
// GyanAstra Master - Students Directory Script
// ==========================================

let allStudents = [];

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAuth();

  const searchInput = document.getElementById("studentSearch");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase().trim();
      filterStudents(term);
    });
  }

  loadStudents();
});

// Fetch Students from Firestore (users collection)
async function loadStudents() {
  const tbody = document.getElementById("studentsTableBody");
  const totalEnrolledCount = document.getElementById("totalEnrolledCount");
  const activeStudentsCount = document.getElementById("activeStudentsCount");

  tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Loading registered students...</td></tr>';

  try {
    const snapshot = await db.collection("users").get();

    if (snapshot.empty) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No students found in the database.</td></tr>';
      if (totalEnrolledCount) totalEnrolledCount.textContent = "0";
      if (activeStudentsCount) activeStudentsCount.textContent = "0";
      return;
    }

    allStudents = [];
    snapshot.forEach((doc) => {
      allStudents.push({ id: doc.id, ...doc.data() });
    });

    if (totalEnrolledCount) totalEnrolledCount.textContent = allStudents.length;
    if (activeStudentsCount) {
      const activeCount = allStudents.filter(s => s.status !== "inactive").length;
      activeStudentsCount.textContent = activeCount;
    }

    renderStudentsTable(allStudents);
  } catch (error) {
    console.error("Students loading error:", error);
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Failed to fetch students. Verify Firestore rules.</td></tr>';
  }
}

// Render Table Rows
function renderStudentsTable(students) {
  const tbody = document.getElementById("studentsTableBody");

  if (!students.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No matching students found.</td></tr>';
    return;
  }

  tbody.innerHTML = "";
  let idx = 1;

  students.forEach((student) => {
    const tr = document.createElement("tr");

    let regDate = "N/A";
    if (student.createdAt && typeof student.createdAt.toDate === "function") {
      regDate = student.createdAt.toDate().toLocaleDateString();
    } else if (student.createdAt) {
      regDate = new Date(student.createdAt).toLocaleDateString();
    }

    const enrolledList = Array.isArray(student.enrolledCourses)
      ? student.enrolledCourses.join(", ")
      : (student.enrolledCourses || "None");

    const status = student.status === "inactive" ? "pending" : "active";
    const statusText = student.status === "inactive" ? "Inactive" : "Active";

    tr.innerHTML = `
      <td>${idx++}</td>
      <td><strong>${student.name || student.displayName || "Unknown"}</strong></td>
      <td>${student.email || "No Email"}</td>
      <td>${regDate}</td>
      <td>${enrolledList}</td>
      <td style="text-align: center;">
        <span class="status-badge ${status}">${statusText}</span>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Search Filter
function filterStudents(searchTerm) {
  if (!searchTerm) {
    renderStudentsTable(allStudents);
    return;
  }

  const filtered = allStudents.filter((student) => {
    const name = (student.name || student.displayName || "").toLowerCase();
    const email = (student.email || "").toLowerCase();
    return name.includes(searchTerm) || email.includes(searchTerm);
  });

  renderStudentsTable(filtered);
}