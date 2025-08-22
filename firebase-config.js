// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCayl1Hkzf7krOjqlxqWEbBpNZC8m41BBk",
  authDomain: "milqly.firebaseapp.com",
  projectId: "milqly",
  storageBucket: "milqly.firebasestorage.app",
  messagingSenderId: "509357207390",
  appId: "1:509357207390:web:47a4c7bc0af3373cd0a9cf",
  measurementId: "G-Z576VSVC5J"
};
// Initialize (compat)
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db   = firebase.firestore();
