// auth.js
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, loadUserDataFromCloud, saveUserToCloud } from './firebase-sync.js';

const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const emailInput = document.getElementById('authEmail');
const passwordInput = document.getElementById('authPassword');
const messageDiv = document.getElementById('authMessage');

function showMessage(text, type) {
    if (!messageDiv) return;
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove('hidden');
}

// Обработка входа
if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            showMessage("Введите email и пароль", "error");
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Переход произойдет автоматически в onAuthStateChanged
        } catch (error) {
            console.error("Ошибка входа:", error);
            let msg = "Ошибка входа";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                msg = "Неверный email или пароль";
            }
            showMessage(msg, "error");
        }
    });
}

// Обработка регистрации
if (registerBtn) {
    registerBtn.addEventListener('click', async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            showMessage("Введите email и пароль для регистрации", "error");
            return;
        }

        if (password.length < 6) {
            showMessage("Пароль должен быть не менее 6 символов", "error");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Создаем начальный профиль в базе
            const initialData = {
                email: user.email,
                level: 1,
                score: 0,
                solvedTaskIds: [],
                createdAt: new Date().toISOString()
            };
            await saveUserToCloud(user.uid, initialData);
            
            showMessage("Регистрация успешна! Переход в игру...", "success");
            // Переход произойдет автоматически в onAuthStateChanged
        } catch (error) {
            console.error("Ошибка регистрации:", error);
            let msg = "Ошибка регистрации";
            if (error.code === 'auth/email-already-in-use') {
                msg = "Этот email уже зарегистрирован";
            }
            showMessage(msg, "error");
        }
    });
}

// Глобальный слушатель состояния авторизации
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("Пользователь вошел:", user.email);
        // Загружаем данные перед переходом
        const data = await loadUserDataFromCloud(user.uid);
        
        // Сохраняем текущие данные в localStorage для быстрой работы игры
        if (data) {
            localStorage.setItem('currentUser', JSON.stringify({ uid: user.uid, ...data }));
        } else {
            // Если данных нет (новый юзер), сохраняем заглушку
            const newData = { uid: user.uid, email: user.email, level: 1, score: 0, solvedTaskIds: [] };
            localStorage.setItem('currentUser', JSON.stringify(newData));
        }

        // ПЕРЕНАПРАВЛЕНИЕ НА HOME.HTML
        window.location.href = 'home.html';
    } else {
        // Если пользователь не авторизован и находится на защищенной странице, можно редиректить на auth.html
        // Но мы делаем это только если мы НЕ на странице auth.html
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage !== 'auth.html' && currentPage !== '') {
             // window.location.href = 'auth.html'; // Раскомментируйте, если нужен строгий редирект
        }
    }
});

// Функция выхода (доступна глобально для кнопок)
window.logoutUser = async () => {
    try {
        await signOut(auth);
        localStorage.removeItem('currentUser');
        window.location.href = 'auth.html';
    } catch (error) {
        console.error("Ошибка выхода:", error);
    }
};
