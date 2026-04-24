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
export const auth = getAuth(app);
export const db = getFirestore(app);

// Экспортируем методы, чтобы auth.js мог их использовать
export { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut };

// Функция загрузки данных пользователя
export async function loadUserDataFromCloud(uid) {
    try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            // Сохраняем в localStorage для быстрой работы игры
            localStorage.setItem('userProgress', JSON.stringify(data));
            console.log("Данные загружены из облака");
        } else {
            console.log("Новый пользователь, создаем пустой прогресс");
            const emptyData = {
                solvedTaskIds: [],
                score: 0,
                level: 1,
                statistics: { problemsSolved: 0 }
            };
            localStorage.setItem('userProgress', JSON.stringify(emptyData));
            // Можно сразу сохранить в базу, чтобы документ создался
            await setDoc(docRef, emptyData);
        }
    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
    }
}

// Функция сохранения данных (вызывается из game.js)
export async function saveUserToCloud(uid, data) {
    try {
        await setDoc(doc(db, "users", uid), data, { merge: true });
        console.log("Прогресс сохранен в облако");
    } catch (error) {
        console.error("Ошибка сохранения:", error);
    }
}
