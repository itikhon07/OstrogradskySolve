// Локальное хранилище данных через IndexedDB
import { getUsersFromDB, saveUserToDB } from './storage.js';

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
    const users = await getUsersFromDB();
    return users[email] || null;
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
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    
    if (page.includes('auth.html')) {
        // Инициализация страницы авторизации
        import('./auth.js').then(module => {
            if (module.initAuthPage) {
                module.initAuthPage();
            }
            console.log('Модуль авторизации загружен');
        }).catch(error => {
            console.error('Ошибка загрузки модуля авторизации:', error);
        });
    } else if (page.includes('game_math.html') || page.includes('game_phys.html')) {
        // Инициализация игровой логики
        import('./game.js').then(module => {
            console.log('Игровой модуль загружен');
        }).catch(error => {
            console.error('Ошибка загрузки игрового модуля:', error);
        });
    } else if (page.includes('home.html')) {
        // Инициализация главной страницы
        import('./home.js').then(module => {
            if (module.initHomePage) {
                module.initHomePage();
            }
            console.log('Модуль главной страницы загружен');
        }).catch(error => {
            console.error('Ошибка загрузки модуля главной страницы:', error);
        });
    } else if (page.includes('profile.html')) {
        // Инициализация страницы профиля
        import('./profile.js').then(module => {
            if (module.initProfilePage) {
                const email = getCurrentUser();
                loadUserData(email).then(userData => {
                    module.initProfilePage(userData);
                });
            }
            console.log('Модуль профиля загружен');
        }).catch(error => {
            console.error('Ошибка загрузки модуля профиля:', error);
        });
    }
    // Добавьте другие страницы по мере необходимости
});

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
