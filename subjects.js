// ==========================================
// GyanAstra Master - Subjects Management Script
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAuth();

  const openModalBtn = document.getElementById("openModalBtn");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const cancelModalBtn = document.getElementById("cancelModalBtn");
  const subjectForm = document.getElementById("subjectForm");
  const subjectModal = document.getElementById("subjectModal");
  const filterCourse = document.getElementById("filterCourse");

  // Load course dropdowns first
  loadCoursesDropdown();

  // Modal Open
  openModalBtn.addEventListener("click", () => {
    subjectForm.reset();
    document.getElementById("subjectId").value = "";
    document.getElementById("modalTitle").textContent = "Add New Subject";
    document.getElementById("subjectIcon").value = "📖";
    subjectModal.classList.add("show");
  });

  // Modal Close
  const closeModal = () => subjectModal.classList.remove("show");
  closeModalBtn.addEventListener("click", closeModal);
  cancelModalBtn.addEventListener("click", closeModal);

  // Form Submit (Create / Update)
  subjectForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const subjectId = document.getElementById("subjectId").value;
    const courseId = document.getElementById("courseSelect").value;
    const title = document.getElementById("subjectTitle").value.trim();
    const icon = document.getElementById("subjectIcon").value.trim() || "📖";

    const courseSelectEl = document.getElementById("courseSelect");
    const courseName = courseSelectEl.options[courseSelectEl.selectedIndex].text;

    const subjectData = {
      courseId,
      courseName,
      title,
      icon,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      if (subjectId) {
        await db.collection("subjects").doc(subjectId).update(subjectData);
      } else {
        subjectData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection("subjects").add(subjectData);
      }
      closeModal();
      loadSubjects(filterCourse.value);
    } catch (error) {
      console.error("Subject save error:", error);
      alert("Error saving subject: " + error.message);
    }
  });

  // Filter change listener
  filterCourse.addEventListener("change", () => {
    loadSubjects(filterCourse.value);
  });

  // Initial load
  loadSubjects("all");
});

// Load Course options into Dropdowns
async function loadCoursesDropdown() {
  const filterCourse = document.getElementById("filterCourse");
  const courseSelect = document.getElementById("courseSelect");

  try {
    const snap = await db.collection("courses").orderBy("title", "asc").get();
    snap.forEach((doc) => {
      const data = doc.data();

      // For filter
      const opt1 = document.createElement("option");
      opt1.value = doc.id;
      opt1.textContent = data.title;
      filterCourse.appendChild(opt1);

      // For modal form
      const opt2 = document.createElement("option");
      opt2.value = doc.id;
      opt2.textContent = data.title;
      courseSelect.appendChild(opt2);
    });
  } catch (err) {
    console.error("Error loading courses dropdown:", err);
  }
}

// Load and Render Subjects
async function loadSubjects(courseFilter = "all") {
  const grid = document.getElementById("subjectsGrid");
  grid.innerHTML = '<div class="empty-state">Loading subjects...</div>';

  try {
    let query = db.collection("subjects");
    if (courseFilter !== "all") {
      query = query.where("courseId", "==", courseFilter);
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      grid.innerHTML = '<div class="empty-state">No subjects found for this selection.</div>';
      return;
    }

    grid.innerHTML = "";
    snapshot.forEach((doc) => {
      const data = doc.data();
      const card = document.createElement("div");
      card.className = "subject-card";
      card.innerHTML = `
        <div class="subject-top">
          <div class="subject-icon-box">${data.icon || "📖"}</div>
          <div class="subject-info">
            <h3>${data.title}</h3>
            <span>Course: ${data.courseName || "General"}</span>
          </div>
        </div>
        <div class="subject-actions">
          <button class="action-btn edit-btn" onclick="editSubject('${doc.id}', '${escapeHtml(data.courseId)}', '${escapeHtml(data.title)}', '${escapeHtml(data.icon || "📖")}')">✏️ Edit</button>
          <button class="action-btn delete-btn" onclick="deleteSubject('${doc.id}')">🗑️ Delete</button>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (error) {
    console.error("Subjects load error:", error);
    grid.innerHTML = '<div class="empty-state">Failed to load subjects. Check permissions or console.</div>';
  }
}

// Edit Trigger
window.editSubject = (id, courseId, title, icon) => {
  document.getElementById("subjectId").value = id;
  document.getElementById("courseSelect").value = courseId;
  document.getElementById("subjectTitle").value = unescapeHtml(title);
  document.getElementById("subjectIcon").value = unescapeHtml(icon);
  document.getElementById("modalTitle").textContent = "Edit Subject";
  document.getElementById("subjectModal").classList.add("show");
};

// Delete Trigger
window.deleteSubject = async (id) => {
  if (confirm("Are you sure you want to delete this subject?")) {
    try {
      await db.collection("subjects").doc(id).delete();
      const filterCourse = document.getElementById("filterCourse");
      loadSubjects(filterCourse.value);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete subject: " + error.message);
    }
  }
};

function escapeHtml(str) {
  return (str || "").replace(/'/g, "\\'").replace(/"/g, "&quot;");
}
function unescapeHtml(str) {
  return (str || "").replace(/\\'/g, "'").replace(/&quot;/g, '"');
}