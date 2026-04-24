// firebase-db.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD54Xet_pBEMu7RTdQwI6TA8SXOw4Fde9o",
  authDomain: "ostrogradskysolve.firebaseapp.com",
  projectId: "ostrogradskysolve",
  storageBucket: "ostrogradskysolve.firebasestorage.app",
  messagingSenderId: "1005252183490",
  appId: "1:1005252183490:web:b46c393dea53897d7e825b",
  measurementId: "G-91HCBB54Z7"
};

// Инициализация
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Функции экспорта
export { auth, db, provider, signInWithPopup, signOut, onAuthStateChanged, doc, setDoc, getDoc };
