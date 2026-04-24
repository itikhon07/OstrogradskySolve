import { getUsersFromDB, saveUserToDB } from './storage.js';
import { login, register, logout, loadUserDataFromCloud, saveUserToCloud } from './firebase-sync.js';

export async function registerUser(email, password) {
    // Пробуем зарегистрировать через Firebase
    const result = await register(email, password);
    if (!result.success) {
        console.error("Firebase registration error:", result.error);
        return false;
    }
    
    // Создаем локальную запись
    const newUser = {
        email,
        password, // Храним локально для совместимости, но вход через Firebase
        score: 0,
        solved: 0,
        totalAnswered: 0,
        rank: 'Новичок',
        solvedTasks: [],
        solvedTaskIds: [] // Массив ID решенных задач
    };
    await saveUserToDB(newUser);
    return true;
}

export async function loginUser(email, password) {
    // Пробуем войти через Firebase
    const result = await login(email, password);
    if (!result.success) {
        console.error("Firebase login error:", result.error);
        return false;
    }
    
    // Данные загрузятся автоматически через onAuthStateChanged в firebase-sync.js
    return true;
}

export async function logoutUser() {
    await logout();
    localStorage.removeItem('qmath_current_user');
    window.location.href = 'auth.html';
}

export function initAuthPage() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const authEmail = document.getElementById('authEmail');
    const authPassword = document.getElementById('authPassword');
    const authMessage = document.getElementById('authMessage');

    if (!loginBtn || !registerBtn || !authEmail || !authPassword || !authMessage) return;

    const showAuthMessage = (text, isError = false) => {
        authMessage.textContent = text;
        authMessage.classList.remove('hidden');
        if (isError) authMessage.classList.add('error');
        else authMessage.classList.remove('error');
        setTimeout(() => authMessage.classList.add('hidden'), 3000);
    };

    loginBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = authEmail.value.trim();
        const password = authPassword.value.trim();
        if (!email || !password) {
            showAuthMessage('Заполните все поля', true);
            return;
        }
        
        showAuthMessage('Вход...');
        if (await loginUser(email, password)) {
            localStorage.setItem('qmath_current_user', email);
            // Небольшая задержка для загрузки данных из облака
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 500);
        } else {
            showAuthMessage('Неверный email или пароль', true);
        }
    });

    registerBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = authEmail.value.trim();
        const password = authPassword.value.trim();
        if (!email || !password) {
            showAuthMessage('Заполните все поля', true);
            return;
        }
        
        showAuthMessage('Регистрация...');
        if (await registerUser(email, password)) {
            showAuthMessage('Регистрация успешна! Теперь войдите.');
            authEmail.value = '';
            authPassword.value = '';
        } else {
            showAuthMessage('Ошибка регистрации или пользователь уже существует', true);
        }
    });
}