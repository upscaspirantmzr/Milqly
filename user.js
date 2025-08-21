import { auth, db } from "./app-init.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const emailSpan = document.getElementById("user-email");
const logoutBtn = document.getElementById("btn-logout");
const pfMsg = document.getElementById("pf-msg");
const subMsg = document.getElementById("sub-msg");

let currentUser;

logoutBtn?.addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, async (user) => {
  if (!user) return location.href = "signup.html";
  currentUser = user;
  emailSpan.textContent = user.email;

  // Load profile
  const snap = await getDoc(doc(db, "users", user.uid));
  const d = snap.data() || {};
  document.getElementById("pf-name").value = d.name || "";
  document.getElementById("pf-phone").value = d.phone || "";
  document.getElementById("pf-address").value = d.address || "";

  // Load subscription (first by userId)
  const subQ = query(collection(db, "subscriptions"), where("userId", "==", user.uid));
  const subSnap = await getDocs(subQ);
  if (!subSnap.empty) {
    const s = subSnap.docs[0].data();
    document.getElementById("sub-plan").value = s.planType || "daily";
    document.getElementById("sub-liters").value = s.litersPerDay || 0;
    document.getElementById("sub-status").value = s.status || "active";
  }

  // Load orders (demo: last 5 by date desc)
  const ordersQ = query(collection(db, "orders"), where("userId", "==", user.uid), orderBy("date", "desc"), limit(5));
  const od = await getDocs(ordersQ);
  const container = document.getElementById("orders-list");
  if (od.empty) container.textContent = "No orders yet.";
  else {
    container.innerHTML = od.docs.map(d => {
      const o = d.data();
      return `<div class="flex justify-between border-b py-2">
        <span>${o.date || ""}</span>
        <span>${o.quantity || 0} L</span>
        <span>${o.status || "pending"}</span>
      </div>`;
    }).join("");
  }
});

document.getElementById("btn-save-profile")?.addEventListener("click", async () => {
  pfMsg.textContent = "Saving…";
  const data = {
    name: document.getElementById("pf-name").value.trim(),
    phone: document.getElementById("pf-phone").value.trim(),
    address: document.getElementById("pf-address").value.trim()
  };
  await setDoc(doc(db, "users", currentUser.uid), data, { merge: true });
  pfMsg.textContent = "Saved!";
});

document.getElementById("btn-save-sub")?.addEventListener("click", async () => {
  subMsg.textContent = "Saving…";
  const subData = {
    userId: currentUser.uid,
    planType: document.getElementById("sub-plan").value,
    litersPerDay: Number(document.getElementById("sub-liters").value || 0),
    status: document.getElementById("sub-status").value,
    updatedAt: Date.now()
  };
  // Use deterministic doc id (userId) so single sub per user
  await setDoc(doc(db, "subscriptions", currentUser.uid), subData, { merge: true });
  subMsg.textContent = "Subscription saved!";
});
