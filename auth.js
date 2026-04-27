import { getUsersFromDB, saveUserToDB } from './storage.js';

export async function registerUser(email, password) {
    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        console.error("Некорректный формат email");
        return { success: false, error: 'Некорректный формат email' };
    }
    
    // Валидация пароля (минимум 6 символов)
    if (password.length < 6) {
        console.error("Пароль должен содержать минимум 6 символов");
        return { success: false, error: 'Пароль должен содержать минимум 6 символов' };
    }
    
    // Проверяем, существует ли уже пользователь
    const users = await getUsersFromDB();
    if (users[email]) {
        return { success: false, error: 'Пользователь с таким email уже существует' };
    }
    
    // Создаем локальную запись
    const newUser = {
        email,
        password, // Храним локально для простого входа
        score: 0,
        solved: 0,
        totalAnswered: 0,
        rank: 'Новичок',
        solvedTasks: [],
        solvedTaskIds: [] // Массив ID решенных задач
    };
    await saveUserToDB(newUser);
    return { success: true };
}

export async function loginUser(email, password) {
    const users = await getUsersFromDB();
    const user = users[email];
    
    if (!user) {
        return { success: false, error: 'Пользователь не найден' };
    }
    
    if (user.password !== password) {
        return { success: false, error: 'Неверный пароль' };
    }
    
    return { success: true };
}

export async function logoutUser() {
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
        const loginResult = await loginUser(email, password);
        if (loginResult.success) {
            localStorage.setItem('qmath_current_user', email);
            window.location.href = 'home.html';
        } else {
            showAuthMessage(loginResult.error || 'Неверный email или пароль', true);
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
        const registerResult = await registerUser(email, password);
        if (registerResult.success) {
            showAuthMessage('Регистрация успешна! Теперь войдите.');
            authEmail.value = '';
            authPassword.value = '';
        } else {
            showAuthMessage(registerResult.error || 'Ошибка регистрации или пользователь уже существует', true);
        }
    });
}