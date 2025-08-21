import { auth, db } from "./app-init.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc, setDoc, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const emailSpan = document.getElementById("farmer-email");
const logoutBtn = document.getElementById("btn-logout");
const supplyMsg = document.getElementById("supply-msg");
const demandDiv = document.getElementById("demand-forecast");

let currentUser;

logoutBtn?.addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, async (user) => {
  if (!user) return location.href = "signup.html";
  currentUser = user;
  emailSpan.textContent = user.email;

  // Ensure farmer profile exists
  const farmerRef = doc(db, "farmers", user.uid);
  const farmerSnap = await getDoc(farmerRef);
  if (!farmerSnap.exists()) {
    await setDoc(farmerRef, { userId: user.uid, name: user.email, dailySupply: 0, verified: false });
  }

  await refreshDemand();
});

document.getElementById("btn-save-supply")?.addEventListener("click", async () => {
  supplyMsg.textContent = "Updating…";
  const liters = Number(document.getElementById("supply-liters").value || 0);
  await setDoc(doc(db, "farmers", currentUser.uid), { dailySupply: liters }, { merge: true });
  supplyMsg.textContent = "Saved!";
});

async function refreshDemand() {
  demandDiv.textContent = "Calculating…";
  const subQ = query(collection(db, "subscriptions"), where("status", "==", "active"));
  const ss = await getDocs(subQ);
  let total = 0;
  ss.forEach(docu => { total += Number(docu.data().litersPerDay || 0); });
  demandDiv.textContent = `Active daily demand: ${total} L`;
}
