import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { firebaseConfig } from "../firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.getElementById("adminLoginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("adminEmail").value;
  const password = document.getElementById("adminPassword").value;

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists() && userDoc.data().role === "admin") {
      window.location.href = "admin-dashboard.html";
    } else {
      document.getElementById("errorMsg").classList.remove("hidden");
    }
  } catch (err) {
    console.error(err);
    document.getElementById("errorMsg").classList.remove("hidden");
  }
});
