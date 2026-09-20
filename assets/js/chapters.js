// ==========================================
// GyanAstra Master - Chapters Management Script
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAuth();

  const openModalBtn = document.getElementById("openModalBtn");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const cancelModalBtn = document.getElementById("cancelModalBtn");
  const chapterForm = document.getElementById("chapterForm");
  const chapterModal = document.getElementById("chapterModal");
  const filterSubject = document.getElementById("filterSubject");

  // Load subject options for dropdowns
  loadSubjectsDropdown();

  // Modal Open
  openModalBtn.addEventListener("click", () => {
    chapterForm.reset();
    document.getElementById("chapterId").value = "";
    document.getElementById("modalTitle").textContent = "Add New Chapter";
    chapterModal.classList.add("show");
  });

  // Modal Close
  const closeModal = () => chapterModal.classList.remove("show");
  closeModalBtn.addEventListener("click", closeModal);
  cancelModalBtn.addEventListener("click", closeModal);

  // Form Submit (Create / Update)
  chapterForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const chapterId = document.getElementById("chapterId").value;
    const subjectId = document.getElementById("subjectSelect").value;
    const order = parseInt(document.getElementById("chapterNumber").value, 10) || 1;
    const title = document.getElementById("chapterTitle").value.trim();
    const description = document.getElementById("chapterDescription").value.trim();

    const subjectSelectEl = document.getElementById("subjectSelect");
    const subjectName = subjectSelectEl.options[subjectSelectEl.selectedIndex].text;

    const chapterData = {
      subjectId,
      subjectName,
      order,
      title,
      description,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      if (chapterId) {
        await db.collection("chapters").doc(chapterId).update(chapterData);
      } else {
        chapterData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection("chapters").add(chapterData);
      }
      closeModal();
      loadChapters(filterSubject.value);
    } catch (error) {
      console.error("Chapter save error:", error);
      alert("Error saving chapter: " + error.message);
    }
  });

  // Filter change listener
  filterSubject.addEventListener("change", () => {
    loadChapters(filterSubject.value);
  });

  // Initial load
  loadChapters("all");
});

// Load Subject dropdowns
async function loadSubjectsDropdown() {
  const filterSubject = document.getElementById("filterSubject");
  const subjectSelect = document.getElementById("subjectSelect");

  try {
    const snap = await db.collection("subjects").orderBy("title", "asc").get();
    snap.forEach((doc) => {
      const data = doc.data();

      // For filter toolbar
      const opt1 = document.createElement("option");
      opt1.value = doc.id;
      opt1.textContent = data.title;
      filterSubject.appendChild(opt1);

      // For modal form
      const opt2 = document.createElement("option");
      opt2.value = doc.id;
      opt2.textContent = data.title;
      subjectSelect.appendChild(opt2);
    });
  } catch (err) {
    console.error("Error loading subjects dropdown:", err);
  }
}

// Load and Render Chapters
async function loadChapters(subjectFilter = "all") {
  const container = document.getElementById("chaptersContainer");
  container.innerHTML = '<div class="empty-state">Loading chapters...</div>';

  try {
    let query = db.collection("chapters");
    if (subjectFilter !== "all") {
      query = query.where("subjectId", "==", subjectFilter);
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      container.innerHTML = '<div class="empty-state">No chapters found for this selection.</div>';
      return;
    }

    // Sort chapters by order ascending
    const docs = [];
    snapshot.forEach((doc) => docs.push({ id: doc.id, ...doc.data() }));
    docs.sort((a, b) => (a.order || 0) - (b.order || 0));

    container.innerHTML = "";
    docs.forEach((data) => {
      const card = document.createElement("div");
      card.className = "chapter-item-card";
      card.innerHTML = `
        <div class="chapter-left">
          <div class="chapter-badge">#${data.order || 1}</div>
          <div class="chapter-meta">
            <h4>${data.title}</h4>
            <p>Subject: ${data.subjectName || "N/A"} ${data.description ? "• " + data.description : ""}</p>
          </div>
        </div>
        <div class="chapter-actions">
          <button class="action-btn edit-btn" onclick="editChapter('${data.id}', '${escapeHtml(data.subjectId)}', ${data.order || 1}, '${escapeHtml(data.title)}', '${escapeHtml(data.description || "")}')">✏️ Edit</button>
          <button class="action-btn delete-btn" onclick="deleteChapter('${data.id}')">🗑️ Delete</button>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Chapters load error:", error);
    container.innerHTML = '<div class="empty-state">Failed to load chapters. Check Firestore rules.</div>';
  }
}

// Edit Chapter Trigger
window.editChapter = (id, subjectId, order, title, description) => {
  document.getElementById("chapterId").value = id;
  document.getElementById("subjectSelect").value = subjectId;
  document.getElementById("chapterNumber").value = order;
  document.getElementById("chapterTitle").value = unescapeHtml(title);
  document.getElementById("chapterDescription").value = unescapeHtml(description);
  document.getElementById("modalTitle").textContent = "Edit Chapter";
  document.getElementById("chapterModal").classList.add("show");
};

// Delete Chapter Trigger
window.deleteChapter = async (id) => {
  if (confirm("Are you sure you want to delete this chapter?")) {
    try {
      await db.collection("chapters").doc(id).delete();
      const filterSubject = document.getElementById("filterSubject");
      loadChapters(filterSubject.value);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete chapter: " + error.message);
    }
  }
};

function escapeHtml(str) {
  return (str || "").replace(/'/g, "\\'").replace(/"/g, "&quot;");
}
function unescapeHtml(str) {
  return (str || "").replace(/\\'/g, "'").replace(/&quot;/g, '"');
}