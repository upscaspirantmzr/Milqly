import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut,
    signInAnonymously,
    signInWithCustomToken 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Ensure firebase-config.js is correctly imported
import { firebaseConfig } from "./firebase-config.js";

// Global variables for Firebase services
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
let app, auth, db;

// Initialize Firebase app and services
const initFirebase = async () => {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);

        // Sign in with the provided custom token if available
        if (typeof __initial_auth_token !== 'undefined') {
            await signInWithCustomToken(auth, __initial_auth_token);
            console.log("Signed in with custom token.");
        } else {
            await signInAnonymously(auth);
            console.log("Signed in anonymously.");
        }

        console.log("Firebase services initialized successfully.");

    } catch (error) {
        console.error("Error initializing Firebase:", error);
    }
};

// Check if Firebase is initialized before proceeding with auth logic
initFirebase().then(() => {
    console.log("Starting authentication event listeners...");

    const statusMessage = document.getElementById('status-message');
    const adminStatusMessage = document.getElementById('admin-status-message');
    const mainAuthForm = document.getElementById('main-auth-form');
    const signupBtn = document.getElementById('signup-btn');
    const adminAuthForm = document.getElementById('admin-auth-form');
    const adminLoginLink = document.getElementById('admin-login-link');
    const adminModal = document.getElementById('admin-modal');
    const modalCloseBtn = document.querySelector('.modal .close-btn');

    // Handle user/farmer login
    if (mainAuthForm) {
        mainAuthForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            statusMessage.textContent = 'Logging in...';

            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                
                // Get user role from Firestore
                const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const userRole = userData.role;

                    // Redirect based on role
                    if (userRole === 'customer') {
                        window.location.href = 'user-dashboard.html';
                    } else if (userRole === 'farmer') {
                        window.location.href = 'farmer-dashboard.html';
                    } else {
                        // If user is not customer or farmer, log them out and show error
                        await signOut(auth);
                        statusMessage.textContent = 'Error: Only customers and farmers can log in here.';
                    }
                } else {
                    // If user document doesn't exist, log them out and show error
                    await signOut(auth);
                    statusMessage.textContent = 'Error: User profile not found.';
                }
            } catch (error) {
                console.error("Login error:", error);
                statusMessage.textContent = 'Login failed. Check your credentials.';
            }
        });
    }

    // Handle user/farmer signup
    if (signupBtn) {
        signupBtn.addEventListener('click', () => {
            window.location.href = 'signup.html';
        });
    }

    // Handle admin login
    if (adminAuthForm) {
        adminAuthForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('admin-email').value;
            const password = document.getElementById('admin-password').value;
            adminStatusMessage.textContent = 'Logging in...';

            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Get user role from Firestore
                const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);

                // Check if user document exists and has the admin role
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const userRole = userData.role;
                    
                    // Only allow login if the role is 'admin'
                    if (userRole === 'admin') {
                        window.location.href = 'admin-dashboard.html';
                    } else {
                        // Not an admin, log them out and show a specific error message
                        await signOut(auth);
                        adminStatusMessage.textContent = 'Error: This email is not an administrator account.';
                    }
                } else {
                    // User document not found, log them out and show a specific error
                    await signOut(auth);
                    adminStatusMessage.textContent = 'Error: User data not found. This account may not have a role assigned.';
                }
            } catch (error) {
                console.error("Admin login error:", error);
                // The Firebase error code will be more generic, so we'll use a general message
                adminStatusMessage.textContent = 'Admin login failed. Check your credentials.';
            }
        });
    }

    // Modal behavior for admin login
    if (adminLoginLink && adminModal && modalCloseBtn) {
        adminLoginLink.addEventListener('click', () => {
            adminModal.style.display = 'block';
        });

        modalCloseBtn.addEventListener('click', () => {
            adminModal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === adminModal) {
                adminModal.style.display = 'none';
            }
        });
    }

});
