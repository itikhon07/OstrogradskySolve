// Модуль главной страницы
import { openDB } from './storage.js';

const DB_NAME = 'OstrogradskyDB';
const STORE_USERS = 'users';

function getCurrentUserEmail() {
    return localStorage.getItem('qmath_current_user');
}

async function loadUserData(email) {
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

export async function initHomePage() {
    const email = getCurrentUserEmail();
    const currentUser = await loadUserData(email);

    // Обновление приветствия
    const greetingEl = document.getElementById('greeting');
    if (greetingEl) {
        if (currentUser) {
            greetingEl.textContent = `Привет, ${currentUser.email.split('@')[0]}!`;
        } else if (email) {
            greetingEl.textContent = `Привет, ${email.split('@')[0]}!`;
        } else {
            // Если пользователь не авторизован, перенаправляем на страницу входа
            window.location.href = 'auth.html';
            return;
        }
    }

    const startMathBtn = document.getElementById('startMathBtn');
    const startPhysBtn = document.getElementById('startPhysBtn');

    startMathBtn?.addEventListener('click', () => {
        window.location.href = 'game_math.html';
    });

    startPhysBtn?.addEventListener('click', () => {
        window.location.href = 'game_phys.html';
    });
}
