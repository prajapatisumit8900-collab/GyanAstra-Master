// ==========================================
// GyanAstra Master - Courses Management Script
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAuth();

  const openModalBtn = document.getElementById("openModalBtn");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const cancelModalBtn = document.getElementById("cancelModalBtn");
  const courseForm = document.getElementById("courseForm");
  const courseModal = document.getElementById("courseModal");

  // Modal Open
  openModalBtn.addEventListener("click", () => {
    courseForm.reset();
    document.getElementById("courseId").value = "";
    document.getElementById("modalTitle").textContent = "Add New Course";
    courseModal.classList.add("show");
  });

  // Modal Close
  const closeModal = () => courseModal.classList.remove("show");
  closeModalBtn.addEventListener("click", closeModal);
  cancelModalBtn.addEventListener("click", closeModal);

  // Form Submit (Create / Update)
  courseForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const courseId = document.getElementById("courseId").value;
    const title = document.getElementById("courseTitle").value.trim();
    const category = document.getElementById("courseCategory").value.trim();
    const description = document.getElementById("courseDescription").value.trim();
    const thumbnail = document.getElementById("courseThumbnail").value.trim();

    const courseData = {
      title,
      category,
      description,
      thumbnail: thumbnail || "https://placehold.co/600x400?text=Course+Thumbnail",
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      if (courseId) {
        await db.collection("courses").doc(courseId).update(courseData);
      } else {
        courseData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection("courses").add(courseData);
      }
      closeModal();
      loadCourses();
    } catch (error) {
      console.error("Course save karne me error:", error);
      alert("Error saving course: " + error.message);
    }
  });

  loadCourses();
});

// Load and Render Courses
async function loadCourses() {
  const grid = document.getElementById("coursesGrid");
  grid.innerHTML = '<div class="empty-state">Loading courses...</div>';

  try {
    const snapshot = await db.collection("courses").orderBy("createdAt", "desc").get();

    if (snapshot.empty) {
      grid.innerHTML = '<div class="empty-state">No courses found. Click "+ Add New Course" to get started!</div>';
      return;
    }

    grid.innerHTML = "";
    snapshot.forEach((doc) => {
      const data = doc.data();
      const card = document.createElement("div");
      card.className = "course-card";
      card.innerHTML = `
        <div class="course-thumb" style="background-image: url('${data.thumbnail || "https://placehold.co/600x400?text=Course"}');">
          <span class="course-category-tag">${data.category || "General"}</span>
        </div>
        <div class="course-body">
          <div>
            <h3>${data.title}</h3>
            <p>${data.description || "No description provided."}</p>
          </div>
          <div class="course-actions">
            <button class="action-btn edit-btn" onclick="editCourse('${doc.id}', '${escapeHtml(data.title)}', '${escapeHtml(data.category)}', '${escapeHtml(data.description || "")}', '${escapeHtml(data.thumbnail || "")}')">✏️ Edit</button>
            <button class="action-btn delete-btn" onclick="deleteCourse('${doc.id}')">🗑️ Delete</button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (error) {
    console.error("Courses load error:", error);
    grid.innerHTML = '<div class="empty-state">Failed to load courses. Please check Firestore permissions.</div>';
  }
}

// Edit Trigger
window.editCourse = (id, title, category, description, thumbnail) => {
  document.getElementById("courseId").value = id;
  document.getElementById("courseTitle").value = unescapeHtml(title);
  document.getElementById("courseCategory").value = unescapeHtml(category);
  document.getElementById("courseDescription").value = unescapeHtml(description);
  document.getElementById("courseThumbnail").value = unescapeHtml(thumbnail);
  document.getElementById("modalTitle").textContent = "Edit Course";
  document.getElementById("courseModal").classList.add("show");
};

// Delete Trigger
window.deleteCourse = async (id) => {
  if (confirm("Are you sure you want to delete this course? All associated data should be managed carefully.")) {
    try {
      await db.collection("courses").doc(id).delete();
      loadCourses();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete course: " + error.message);
    }
  }
};

// Helpers for escaping strings
function escapeHtml(str) {
  return (str || "").replace(/'/g, "\\'").replace(/"/g, "&quot;");
}
function unescapeHtml(str) {
  return (str || "").replace(/\\'/g, "'").replace(/&quot;/g, '"');
}