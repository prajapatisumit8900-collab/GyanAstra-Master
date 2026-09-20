"use strict";

document.addEventListener("DOMContentLoaded", () => {
    checkAdminAuth();
    loadPlatformSettings();

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            if (confirm("Logout karna chahte hain?")) logoutAdmin();
        });
    }

    const platformForm = document.getElementById("platformSettingsForm");
    if (platformForm) {
        platformForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const title = document.getElementById("portalTitle").value.trim();
            const email = document.getElementById("supportEmail").value.trim();
            const notice = document.getElementById("portalNotice").value.trim();

            try {
                await db.collection("settings").doc("platform").set({
                    portalTitle: title,
                    supportEmail: email,
                    notice: notice,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });

                alert("✅ Platform Settings update ho gayi!");
            } catch (err) {
                console.error("Platform Settings Error:", err);
                alert("Settings save karne me error aaya.");
            }
        });
    }

    const securityForm = document.getElementById("adminSecurityForm");
    if (securityForm) {
        securityForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const newPasscode = document.getElementById("newPasscode").value;
            const confirmPasscode = document.getElementById("confirmPasscode").value;

            if (newPasscode !== confirmPasscode) {
                alert("Naya passcode confirm passcode se match nahi kar raha!");
                return;
            }

            if (newPasscode.length < 6) {
                alert("Passcode kam se kam 6 aksharo ka hona chahiye.");
                return;
            }

            try {
                await db.collection("settings").doc("security").set({
                    adminPasscode: newPasscode,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });

                alert("✅ Passcode safalta se badal diya gaya!");
                securityForm.reset();
            } catch (err) {
                console.error("Security Save Error:", err);
                alert("Passcode update nahi ho paya.");
            }
        });
    }
});

async function loadPlatformSettings() {
    try {
        const doc = await db.collection("settings").doc("platform").get();
        if (doc.exists) {
            const data = doc.data();
            const portalTitle = document.getElementById("portalTitle");
            const supportEmail = document.getElementById("supportEmail");
            const portalNotice = document.getElementById("portalNotice");

            if (portalTitle) portalTitle.value = data.portalTitle || "GyanAstra";
            if (supportEmail) supportEmail.value = data.supportEmail || "";
            if (portalNotice) portalNotice.value = data.notice || "";
        }
    } catch (err) {
        console.error("Load Settings Error:", err);
    }
}