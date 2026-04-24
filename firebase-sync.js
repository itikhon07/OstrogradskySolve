// Firebase конфигурация и синхронизация с IndexedDB
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// TODO: Замените на вашу конфигурацию из Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyD54Xet_pBEMu7RTdQwI6TA8SXOw4Fde9o",
    authDomain: "ostrogradskysolve.firebaseapp.com",
    projectId: "ostrogradskysolve",
    storageBucket: "ostrogradskysolve.firebasestorage.app",
    messagingSenderId: "1005252183490",
    appId: "1:1005252183490:web:b46c393dea53897d7e825b",
    measurementId: "G-91HCBB54Z7"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUserEmail = null;

// Отслеживание текущего пользователя
let authResolve = null;
let authPromise = new Promise(resolve => { authResolve = resolve; });

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserEmail = user.email;
        console.log("Пользователь вошел:", currentUserEmail);
        // Автоматически загружаем данные из облака при входе
        loadUserDataFromCloud(user.email).then(() => {
            if (authResolve) authResolve(user.email);
        });
    } else {
        currentUserEmail = null;
        console.log("Пользователь вышел");
        if (authResolve) authResolve(null);
        authPromise = new Promise(resolve => { authResolve = resolve; });
    }
});

/**
 * Возвращает промис, который разрешается когда пользователь авторизован
 */
export function waitForAuth() {
    return currentUserEmail ? Promise.resolve(currentUserEmail) : authPromise;
}

/**
 * Сохраняет данные пользователя в облако Firebase
 * @param {Object} userData - данные пользователя (email, progress, solvedTasks и т.д.)
 */
export async function saveUserToCloud(userData) {
    if (!currentUserEmail || currentUserEmail !== userData.email) {
        console.warn("Нет авторизованного пользователя или email не совпадает");
        return;
    }

    try {
        const userRef = doc(db, "users", userData.email);
        await setDoc(userRef, {
            ...userData,
            lastUpdated: serverTimestamp()
        }, { merge: true });
        console.log("Данные успешно сохранены в облако для", userData.email);
    } catch (error) {
        console.error("Ошибка сохранения в облако:", error);
    }
}

/**
 * Загружает данные пользователя из облака Firebase
 * @param {string} email - email пользователя
 * @returns {Object|null} данные пользователя или null, если не найдено
 */
export async function loadUserDataFromCloud(email) {
    try {
        const userRef = doc(db, "users", email);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            const cloudData = docSnap.data();
            console.log("Данные загружены из облака:", cloudData);
            
            // Сохраняем в локальную IndexedDB
            const { saveUserToDB } = await import('./storage.js');
            await saveUserToDB({ email, ...cloudData });
            
            return cloudData;
        } else {
            console.log("Данные в облаке не найдены для", email);
            return null;
        }
    } catch (error) {
        console.error("Ошибка загрузки из облака:", error);
        return null;
    }
}

/**
 * Вход через email/пароль
 */
export async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error("Ошибка входа:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Регистрация через email/пароль
 */
export async function register(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Создаем пустой документ пользователя в облаке
        await setDoc(doc(db, "users", email), {
            email: email,
            createdAt: serverTimestamp(),
            progress: { level: 1, score: 0 },
            solvedTaskIds: []
        });
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error("Ошибка регистрации:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Выход из системы
 */
export async function logout() {
    try {
        await signOut(auth);
        currentUserEmail = null;
        return { success: true };
    } catch (error) {
        console.error("Ошибка выхода:", error);
        return { success: false, error: error.message };
    }
}

// Экспортируем текущий email для использования в других модулях
export function getCurrentUserEmail() {
    return currentUserEmail;
}
