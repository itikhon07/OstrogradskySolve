import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from './firebase-sync.js';
import { loadUserDataFromCloud } from './firebase-sync.js';

const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const emailInput = document.getElementById('authEmail');
const passwordInput = document.getElementById('authPassword');
const messageDiv = document.getElementById('authMessage');

function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove('hidden');
}

function hideMessage() {
    messageDiv.classList.add('hidden');
}

// Обработка входа
loginBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        showMessage("Введите email и пароль", "error");
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged обработает перенаправление
    } catch (error) {
        console.error("Ошибка входа:", error);
        let msg = "Ошибка входа";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            msg = "Неверный email или пароль";
        } else if (error.code === 'auth/too-many-requests') {
            msg = "Слишком много попыток. Попробуйте позже.";
        }
        showMessage(msg, "error");
    }
});

// Обработка регистрации
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
        // После регистрации создаем пустой профиль в базе
        // Это произойдет автоматически при первом сохранении в game.js, 
        // но можно инициировать сразу, если нужно.
        showMessage("Регистрация успешна! Вход...", "success");
        
        // Данные загрузятся автоматически благодаря onAuthStateChanged
    } catch (error) {
        console.error("Ошибка регистрации:", error);
        let msg = "Ошибка регистрации";
        if (error.code === 'auth/email-already-in-use') {
            msg = "Этот email уже зарегистрирован";
        } else if (error.code === 'auth/weak-password') {
            msg = "Пароль слишком слабый";
        }
        showMessage(msg, "error");
    }
});

// Отслеживание состояния авторизации
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Пользователь вошел
        console.log("Пользователь вошел:", user.email);
        // Загружаем данные из облака в локальное хранилище
        loadUserDataFromCloud(user.uid).then(() => {
            window.location.href = 'index.html'; // Перенаправление на главную
        });
    } else {
        // Пользователь вышел (если мы на странице входа, ничего делать не надо)
        console.log("Пользователь не авторизован");
    }
});

// Функция выхода (может вызываться из других файлов)
window.logoutUser = async () => {
    try {
        await signOut(auth);
        window.location.href = 'auth.html';
    } catch (error) {
        console.error("Ошибка выхода:", error);
    }
};
