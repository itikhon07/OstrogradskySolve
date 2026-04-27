
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

// Конфигурация Firebase
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Определение текущей страницы и инициализация соответствующего модуля
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    
    if (page.includes('game_math.html') || page.includes('game_phys.html')) {
        // Инициализация игровой логики
        import('./game.js').then(module => {
            console.log('Игровой модуль загружен');
        }).catch(error => {
            console.error('Ошибка загрузки игрового модуля:', error);
        });
    } else if (page.includes('home.html')) {
        // Инициализация главной страницы
        import('./home.js').then(module => {
            console.log('Модуль главной страницы загружен');
        }).catch(error => {
            console.error('Ошибка загрузки модуля главной страницы:', error);
        });
    } else if (page.includes('profile.html')) {
        // Инициализация страницы профиля
        import('./profile.js').then(module => {
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
