// ==========================================
// BIJLIBANK - FIREBASE CONFIG
// ==========================================

// Firebase App
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

// Firebase Authentication
import { getAuth } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

// Cloud Firestore
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// ==========================================
// FIREBASE CONFIGURATION
// ==========================================

const firebaseConfig = {
    apiKey: "AIzaSyCJleSYThFf5-xOZyxKAklmSBvAof5-hXg",
    authDomain: "innovexnor.firebaseapp.com",
    projectId: "innovexnor",
    storageBucket: "innovexnor.firebasestorage.app",
    messagingSenderId: "63714717118",
    appId: "1:63714717118:web:5a53536cc31cb77eb8ddef",
    measurementId: "G-1G1SGMLQQW"
};


// ==========================================
// INITIALIZE FIREBASE
// ==========================================

const app = initializeApp(firebaseConfig);


// ==========================================
// INITIALIZE AUTHENTICATION
// ==========================================

const auth = getAuth(app);


// ==========================================
// INITIALIZE FIRESTORE
// ==========================================

const db = getFirestore(app);


// ==========================================
// EXPORT
// ==========================================

export { app, auth, db };
