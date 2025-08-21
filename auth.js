import { auth, db } from "./app-init.js";
import { 
  createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  doc, setDoc, getDoc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const suBtn = document.getElementById("btn-signup");
const liBtn = document.getElementById("btn-login");

async function createProfile(uid, data) {
  await setDoc(doc(db, "users", uid), data, { merge: true });
}

function goToRole(role) {
  if (role === "customer") location.href = "user-dashboard.html";
  else if (role === "farmer") location.href = "farmer-dashboard.html";
  else if (role === "admin") location.href = "admin-panel.html";
  else location.href = "user-dashboard.html";
}

suBtn?.addEventListener("click", async () => {
  const name = document.getElementById("su-name").value.trim();
  const phone = document.getElementById("su-phone").value.trim();
  const email = document.getElementById("su-email").value.trim();
  const password = document.getElementById("su-password").value;
  const address = document.getElementById("su-address").value.trim();
  const role = document.getElementById("su-role").value;

  const msg = document.getElementById("su-msg");
  msg.textContent = "Creating your account…";

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await createProfile(cred.user.uid, { name, phone, email, address, role, createdAt: Date.now() });
    msg.textContent = "Account created! Redirecting…";
    goToRole(role);
  } catch (e) {
    msg.textContent = e.message;
  }
});

liBtn?.addEventListener("click", async () => {
  const email = document.getElementById("li-email").value.trim();
  const password = document.getElementById("li-password").value;
  const msg = document.getElementById("li-msg");
  msg.textContent = "Signing you in…";
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    const role = snap.exists() ? snap.data().role : "customer";
    msg.textContent = "Success! Redirecting…";
    goToRole(role);
  } catch (e) {
    msg.textContent = e.message;
  }
});

// If already logged in, send to their dashboard
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const snap = await getDoc(doc(db, "users", user.uid));
    const role = snap.exists() ? snap.data().role : "customer";
    goToRole(role);
  }
});
