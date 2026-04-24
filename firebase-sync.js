// firebase-sync.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Экспорт функций для использования в других файлах
export { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut };

// Функция сохранения данных пользователя в облако
export async function saveUserToCloud(userId, userData) {
    try {
        await setDoc(doc(db, "users", userId), userData, { merge: true });
        console.log("Прогресс сохранен в облако");
    } catch (error) {
        console.error("Ошибка сохранения в облако:", error);
    }
}

// Функция загрузки данных пользователя из облака
export async function loadUserDataFromCloud(userId) {
    try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            console.log("Данные загружены из облака:", docSnap.data());
            return docSnap.data();
        } else {
            console.log("Пользователь не найден, создаем новый профиль");
            return null;
        }
    } catch (error) {
        console.error("Ошибка загрузки из облака:", error);
        return null;
    }
}
