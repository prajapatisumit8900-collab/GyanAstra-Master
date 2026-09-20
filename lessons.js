// ==========================================
// GyanAstra Master - Lessons & Videos Script
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAuth();

  const openModalBtn = document.getElementById("openModalBtn");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const cancelModalBtn = document.getElementById("cancelModalBtn");
  const lessonForm = document.getElementById("lessonForm");
  const lessonModal = document.getElementById("lessonModal");
  const filterChapter = document.getElementById("filterChapter");

  // Load Chapter options into dropdowns
  loadChaptersDropdown();

  // Modal Open
  openModalBtn.addEventListener("click", () => {
    lessonForm.reset();
    document.getElementById("lessonId").value = "";
    document.getElementById("modalTitle").textContent = "Add Video Lesson";
    lessonModal.classList.add("show");
  });

  // Modal Close
  const closeModal = () => lessonModal.classList.remove("show");
  closeModalBtn.addEventListener("click", closeModal);
  cancelModalBtn.addEventListener("click", closeModal);

  // Form Submit (Create / Update)
  lessonForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const lessonId = document.getElementById("lessonId").value;
    const chapterId = document.getElementById("chapterSelect").value;
    const order = parseInt(document.getElementById("lessonOrder").value, 10) || 1;
    const title = document.getElementById("lessonTitle").value.trim();
    const videoUrl = document.getElementById("videoUrl").value.trim();
    const duration = document.getElementById("videoDuration").value.trim();

    const chapterSelectEl = document.getElementById("chapterSelect");
    const chapterName = chapterSelectEl.options[chapterSelectEl.selectedIndex].text;

    const lessonData = {
      chapterId,
      chapterName,
      order,
      title,
      videoUrl,
      duration: duration || "N/A",
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      if (lessonId) {
        await db.collection("lessons").doc(lessonId).update(lessonData);
      } else {
        lessonData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection("lessons").add(lessonData);
      }
      closeModal();
      loadLessons(filterChapter.value);
    } catch (error) {
      console.error("Lesson save error:", error);
      alert("Error saving lesson: " + error.message);
    }
  });

  // Filter change listener
  filterChapter.addEventListener("change", () => {
    loadLessons(filterChapter.value);
  });

  // Initial load
  loadLessons("all");
});

// Load Chapter dropdowns
async function loadChaptersDropdown() {
  const filterChapter = document.getElementById("filterChapter");
  const chapterSelect = document.getElementById("chapterSelect");

  try {
    const snap = await db.collection("chapters").orderBy("order", "asc").get();
    snap.forEach((doc) => {
      const data = doc.data();

      // For filter toolbar
      const opt1 = document.createElement("option");
      opt1.value = doc.id;
      opt1.textContent = `#${data.order || 1} ${data.title}`;
      filterChapter.appendChild(opt1);

      // For modal form
      const opt2 = document.createElement("option");
      opt2.value = doc.id;
      opt2.textContent = `#${data.order || 1} ${data.title}`;
      chapterSelect.appendChild(opt2);
    });
  } catch (err) {
    console.error("Error loading chapters dropdown:", err);
  }
}

// Load and Render Lessons Table
async function loadLessons(chapterFilter = "all") {
  const tbody = document.getElementById("lessonsTableBody");
  tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Loading video lessons...</td></tr>';

  try {
    let query = db.collection("lessons");
    if (chapterFilter !== "all") {
      query = query.where("chapterId", "==", chapterFilter);
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No lessons found for this selection.</td></tr>';
      return;
    }

    const docs = [];
    snapshot.forEach((doc) => docs.push({ id: doc.id, ...doc.data() }));
    docs.sort((a, b) => (a.order || 0) - (b.order || 0));

    tbody.innerHTML = "";
    docs.forEach((data) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>#${data.order || 1}</strong></td>
        <td><strong>${data.title}</strong></td>
        <td>${data.chapterName || "N/A"}</td>
        <td>
          <a href="${data.videoUrl}" target="_blank" rel="noopener noreferrer" class="video-link-badge">
            ▶️ Watch Link
          </a>
        </td>
        <td>${data.duration || "N/A"}</td>
        <td style="text-align: center;">
          <button class="action-btn edit-btn" onclick="editLesson('${data.id}', '${escapeHtml(data.chapterId)}', ${data.order || 1}, '${escapeHtml(data.title)}', '${escapeHtml(data.videoUrl)}', '${escapeHtml(data.duration || "")}')">✏️</button>
          <button class="action-btn delete-btn" onclick="deleteLesson('${data.id}')">🗑️</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Lessons load error:", error);
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Failed to load lessons. Check Firestore rules.</td></tr>';
  }
}

// Edit Lesson Trigger
window.editLesson = (id, chapterId, order, title, videoUrl, duration) => {
  document.getElementById("lessonId").value = id;
  document.getElementById("chapterSelect").value = chapterId;
  document.getElementById("lessonOrder").value = order;
  document.getElementById("lessonTitle").value = unescapeHtml(title);
  document.getElementById("videoUrl").value = unescapeHtml(videoUrl);
  document.getElementById("videoDuration").value = unescapeHtml(duration);
  document.getElementById("modalTitle").textContent = "Edit Video Lesson";
  document.getElementById("lessonModal").classList.add("show");
};

// Delete Lesson Trigger
window.deleteLesson = async (id) => {
  if (confirm("Are you sure you want to delete this video lesson?")) {
    try {
      await db.collection("lessons").doc(id).delete();
      const filterChapter = document.getElementById("filterChapter");
      loadLessons(filterChapter.value);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete lesson: " + error.message);
    }
  }
};

function escapeHtml(str) {
  return (str || "").replace(/'/g, "\\'").replace(/"/g, "&quot;");
}
function unescapeHtml(str) {
  return (str || "").replace(/\\'/g, "'").replace(/&quot;/g, '"');
}