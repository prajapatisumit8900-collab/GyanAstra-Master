// ==========================================
// GyanAstra Master - Study Materials Script
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAuth();

  const openModalBtn = document.getElementById("openModalBtn");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const cancelModalBtn = document.getElementById("cancelModalBtn");
  const materialForm = document.getElementById("materialForm");
  const materialModal = document.getElementById("materialModal");
  const filterSubject = document.getElementById("filterSubject");

  // Load Subject dropdowns
  loadSubjectsDropdown();

  // Modal Open
  openModalBtn.addEventListener("click", () => {
    materialForm.reset();
    document.getElementById("materialId").value = "";
    document.getElementById("modalTitle").textContent = "Add PDF / Study Notes";
    materialModal.classList.add("show");
  });

  // Modal Close
  const closeModal = () => materialModal.classList.remove("show");
  closeModalBtn.addEventListener("click", closeModal);
  cancelModalBtn.addEventListener("click", closeModal);

  // Form Submit (Create / Update)
  materialForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const materialId = document.getElementById("materialId").value;
    const subjectId = document.getElementById("subjectSelect").value;
    const title = document.getElementById("materialTitle").value.trim();
    const fileUrl = document.getElementById("fileUrl").value.trim();
    const fileType = document.getElementById("fileType").value;

    const subjectSelectEl = document.getElementById("subjectSelect");
    const subjectName = subjectSelectEl.options[subjectSelectEl.selectedIndex].text;

    const materialData = {
      subjectId,
      subjectName,
      title,
      fileUrl,
      fileType,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      if (materialId) {
        await db.collection("materials").doc(materialId).update(materialData);
      } else {
        materialData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection("materials").add(materialData);
      }
      closeModal();
      loadMaterials(filterSubject.value);
    } catch (error) {
      console.error("Material save error:", error);
      alert("Error saving resource: " + error.message);
    }
  });

  // Filter change listener
  filterSubject.addEventListener("change", () => {
    loadMaterials(filterSubject.value);
  });

  // Initial load
  loadMaterials("all");
});

// Load Subject options
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

// Load and Render Study Materials Table
async function loadMaterials(subjectFilter = "all") {
  const tbody = document.getElementById("materialsTableBody");
  tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Loading study materials...</td></tr>';

  try {
    let query = db.collection("materials");
    if (subjectFilter !== "all") {
      query = query.where("subjectId", "==", subjectFilter);
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No materials found for this selection.</td></tr>';
      return;
    }

    tbody.innerHTML = "";
    let index = 1;
    snapshot.forEach((doc) => {
      const data = doc.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${index++}</td>
        <td><strong>${data.title}</strong></td>
        <td>${data.subjectName || "N/A"}</td>
        <td><span class="badge-pdf">${data.fileType || "PDF"}</span></td>
        <td>
          <a href="${data.fileUrl}" target="_blank" rel="noopener noreferrer" class="pdf-link">
            📄 Open Resource
          </a>
        </td>
        <td style="text-align: center;">
          <button class="action-btn edit-btn" onclick="editMaterial('${doc.id}', '${escapeHtml(data.subjectId)}', '${escapeHtml(data.title)}', '${escapeHtml(data.fileUrl)}', '${escapeHtml(data.fileType)}')">✏️</button>
          <button class="action-btn delete-btn" onclick="deleteMaterial('${doc.id}')">🗑️</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Materials load error:", error);
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Failed to load materials. Check Firestore rules.</td></tr>';
  }
}

// Edit Material Trigger
window.editMaterial = (id, subjectId, title, fileUrl, fileType) => {
  document.getElementById("materialId").value = id;
  document.getElementById("subjectSelect").value = subjectId;
  document.getElementById("materialTitle").value = unescapeHtml(title);
  document.getElementById("fileUrl").value = unescapeHtml(fileUrl);
  document.getElementById("fileType").value = unescapeHtml(fileType);
  document.getElementById("modalTitle").textContent = "Edit PDF / Study Resource";
  document.getElementById("materialModal").classList.add("show");
};

// Delete Material Trigger
window.deleteMaterial = async (id) => {
  if (confirm("Are you sure you want to delete this resource link?")) {
    try {
      await db.collection("materials").doc(id).delete();
      const filterSubject = document.getElementById("filterSubject");
      loadMaterials(filterSubject.value);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete resource: " + error.message);
    }
  }
};

function escapeHtml(str) {
  return (str || "").replace(/'/g, "\\'").replace(/"/g, "&quot;");
}
function unescapeHtml(str) {
  return (str || "").replace(/\\'/g, "'").replace(/&quot;/g, '"');
}