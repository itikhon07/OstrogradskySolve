// Локальное хранилище данных через IndexedDB
import { openDB, getUsersFromDB, saveUserToDB } from './storage.js';

const DB_NAME = 'OstrogradskyDB';
const STORE_USERS = 'users';

// Глобальные переменные для текущего пользователя
let currentUserEmail = null;
let currentUserData = null;

// Получение текущего пользователя из localStorage
export function getCurrentUser() {
    if (!currentUserEmail) {
        currentUserEmail = localStorage.getItem('qmath_current_user');
    }
    return currentUserEmail;
}

// Загрузка данных пользователя из базы
export async function loadUserData(email) {
    if (!email) return null;
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_USERS, 'readonly');
        const store = tx.objectStore(STORE_USERS);
        const request = store.get(email);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result || null);
    });
}

// Обновление данных пользователя
export async function updateUserData(userData) {
    if (!userData || !userData.email) return false;
    await saveUserToDB(userData);
    currentUserData = userData;
    return true;
}

// Выход пользователя
export function logoutUser() {
    localStorage.removeItem('qmath_current_user');
    currentUserEmail = null;
    currentUserData = null;
}

// Инициализация при загрузке страницы
async function initMain() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';

    console.log('Инициализация страницы:', page);

    if (page.includes('auth.html')) {
        // Инициализация страницы авторизации
        const module = await import('./auth.js');
        if (module.initAuthPage) {
            module.initAuthPage();
        }
        console.log('Модуль авторизации загружен');
    } else if (page.includes('game_math.html') || page.includes('game_phys.html')) {
        // Инициализация игровой логики - game.js сам запускается при импорте
        const module = await import('./game.js');
        console.log('Игровой модуль загружен');
    } else if (page.includes('home.html')) {
        // Инициализация главной страницы
        const module = await import('./home.js');
        if (module.initHomePage) {
            await module.initHomePage();
        }
        console.log('Модуль главной страницы загружен');
    } else if (page.includes('profile.html')) {
        // Инициализация страницы профиля
        const module = await import('./profile.js');
        if (module.initProfilePage) {
            await module.initProfilePage();
        }
        console.log('Модуль профиля загружен');
    }
    // Добавьте другие страницы по мере необходимости
}

// Запуск инициализации
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMain);
} else {
    initMain();
}

// Глобальные обработчики событий (если нужны)
window.addEventListener('beforeunload', () => {
    // Очистка ресурсов перед закрытием страницы
});

// Регистрация Service Worker для PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker зарегистрирован:', registration.scope);
            })
            .catch(error => {
                console.log('Ошибка регистрации Service Worker:', error);
            });
    });
}
