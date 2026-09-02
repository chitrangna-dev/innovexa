// Firebase App
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

// Firebase Authentication
import { getAuth } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

// Cloud Firestore
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCJleSYThFf5-xOZyxKAklmSBvAof5-hXg",
    authDomain: "innovexnor.firebaseapp.com",
    projectId: "innovexnor",
    storageBucket: "innovexnor.firebasestorage.app",
    messagingSenderId: "63714717118",
    appId: "1:63714717118:web:5a53536cc31cb77eb8ddef",
    measurementId: "G-1G1SGMLQQW"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Authentication
const auth = getAuth(app);


// Initialize Firestore
const db = getFirestore(app);


// Export
export {
    app,
    auth,
    db
};
