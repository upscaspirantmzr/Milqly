import { auth, db } from "./app-init.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { collection, getDocs, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const emailSpan = document.getElementById("admin-email");
const logoutBtn = document.getElementById("btn-logout");
logoutBtn?.addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, async (user) => {
  if (!user) return location.href = "signup.html";
  emailSpan.textContent = user.email;

  // Very basic: allow access if role=admin
  const u = await getDoc(doc(db, "users", user.uid));
  if (!u.exists() || u.data().role !== "admin") {
    alert("Admin access only.");
    return location.href = "signup.html";
  }

  await loadUsers();
  await loadFarmers();
});

async function loadUsers() {
  const list = document.getElementById("users-list");
  const snap = await getDocs(collection(db, "users"));
  if (snap.empty) return list.textContent = "No users.";
  list.innerHTML = "";
  snap.forEach(d => {
    const u = d.data();
    const row = document.createElement("div");
    row.className = "flex items-center justify-between border-b py-2 gap-2";
    row.innerHTML = `
      <div class="flex-1">
        <div class="font-medium">${u.name || u.email || d.id}</div>
        <div class="text-xs text-gray-500">${u.email || ""}</div>
      </div>
      <select data-uid="${d.id}" class="role border rounded p-1">
        <option value="customer" ${u.role==="customer"?"selected":""}>customer</option>
        <option value="farmer" ${u.role==="farmer"?"selected":""}>farmer</option>
        <option value="admin" ${u.role==="admin"?"selected":""}>admin</option>
      </select>
      <button data-uid="${d.id}" class="save border px-2 py-1 rounded bg-green-600 text-white">Save</button>
    `;
    list.appendChild(row);
  });

  list.addEventListener("click", async (e) => {
    if (e.target.classList.contains("save")) {
      const uid = e.target.getAttribute("data-uid");
      const sel = list.querySelector(`select[data-uid='${uid}']`);
      await setDoc(doc(db, "users", uid), { role: sel.value }, { merge: true });
      alert("Saved!");
    }
  });
}

async function loadFarmers() {
  const list = document.getElementById("farmers-list");
  const snap = await getDocs(collection(db, "farmers"));
  if (snap.empty) return list.textContent = "No farmers.";
  list.innerHTML = "";
  snap.forEach(d => {
    const f = d.data();
    const row = document.createElement("div");
    row.className = "flex items-center justify-between border-b py-2 gap-2";
    row.innerHTML = `
      <div class="flex-1">
        <div class="font-medium">${f.name || d.id}</div>
        <div class="text-xs text-gray-500">Supply: ${f.dailySupply || 0} L</div>
      </div>
      <button data-uid="${d.id}" class="verify border px-2 py-1 rounded ${f.verified?'bg-gray-400':'bg-green-600'} text-white">
        ${f.verified ? 'Verified' : 'Verify'}
      </button>
    `;
    list.appendChild(row);
  });

  list.addEventListener("click", async (e) => {
    if (e.target.classList.contains("verify")) {
      const uid = e.target.getAttribute("data-uid");
      await setDoc(doc(db, "farmers", uid), { verified: true }, { merge: true });
      alert("Farmer verified!");
      await loadFarmers();
    }
  });
}
