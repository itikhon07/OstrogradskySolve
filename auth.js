// Модуль аутентификации для работы с локальной базой данных IndexedDB
import { getUsersFromDB, saveUserToDB } from './storage.js';

export async function registerUser(email, password) {
    const users = await getUsersFromDB();
    if (users[email]) return false;
    const newUser = {
        email,
        password,
        score: 0,
        solved: 0,
        totalAnswered: 0,
        rank: 'Новичок',
        solvedTasks: []
    };
    await saveUserToDB(newUser);
    return true;
}

export async function loginUser(email, password) {
    const users = await getUsersFromDB();
    return !!(users[email] && users[email].password === password);
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
        setTimeout(() => authMessage.classList.add('hidden'), 2000);
    };

    loginBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = authEmail.value.trim();
        const password = authPassword.value.trim();
        if (!email || !password) {
            showAuthMessage('Заполните все поля', true);
            return;
        }
        // Валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showAuthMessage('Введите корректный email', true);
            return;
        }
        // Валидация пароля (минимум 4 символа)
        if (password.length < 4) {
            showAuthMessage('Пароль должен содержать минимум 4 символа', true);
            return;
        }
        if (await loginUser(email, password)) {
            localStorage.setItem('qmath_current_user', email);
            window.location.href = 'home.html';
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
        // Валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showAuthMessage('Введите корректный email', true);
            return;
        }
        // Валидация пароля (минимум 4 символа)
        if (password.length < 4) {
            showAuthMessage('Пароль должен содержать минимум 4 символа', true);
            return;
        }
        if (await registerUser(email, password)) {
            showAuthMessage('Регистрация успешна! Теперь войдите.');
            authEmail.value = '';
            authPassword.value = '';
        } else {
            showAuthMessage('Пользователь уже существует', true);
        }
    });
}