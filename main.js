import { migrateFromLocalStorage } from './storage.js';
import { getUserByEmail } from './storage.js';
import { loadTasksMath, loadTasksPhys } from './tasks.js';
import { initAuthPage } from './auth.js';
import { initHomePage } from './home.js';
import { initGameMathPage, initGamePhysPage } from './game.js';
import { initProfilePage } from './profile.js';

let currentUser = null;
let currentUserReady = false;

async function initCurrentUser() {
    const email = localStorage.getItem('qmath_current_user');
    if (email) {
        // Ждем немного, чтобы Firebase успел загрузить данные
        let retries = 0;
        while (retries < 10) {
            currentUser = await getUserByEmail(email);
            if (currentUser && currentUser.score !== undefined) {
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            retries++;
        }
        if (!currentUser) {
            localStorage.removeItem('qmath_current_user');
        }
    }
    currentUserReady = true;
}

export function isUserReady() { return currentUserReady; }

export function getCurrentUser() { return currentUser; }
export async function setCurrentUser(email) {
    if (email) {
        localStorage.setItem('qmath_current_user', email);
        let retries = 0;
        while (retries < 10) {
            currentUser = await getUserByEmail(email);
            if (currentUser && currentUser.score !== undefined) break;
            await new Promise(resolve => setTimeout(resolve, 100));
            retries++;
        }
        currentUserReady = true;
    } else {
        localStorage.removeItem('qmath_current_user');
        currentUser = null;
        currentUserReady = false;
    }
}

async function initPage() {
    await migrateFromLocalStorage();
    
    const path = window.location.pathname.split('/').pop() || 'auth.html';

    // Сначала загружаем текущего пользователя
    await initCurrentUser();

    // Проверка авторизации BEFORE загрузки задач
    if (!currentUser && !['auth.html', ''].includes(path)) {
        window.location.href = 'auth.html';
        return;
    }
    
    // Если пользователь уже вошел и пытается зайти на страницу авторизации - редирект на home
    if (currentUser && path === 'auth.html') {
        window.location.href = 'home.html';
        return;
    }

    // Загружаем задачи только если мы на странице игры или главной
    if (['home.html', 'game_math.html', 'game_phys.html'].includes(path)) {
        try {
            await Promise.all([loadTasksMath(), loadTasksPhys()]);
        } catch (err) {
            console.error('Ошибка загрузки задач:', err);
        }
    }

    const greetingEl = document.getElementById('greeting');
    if (greetingEl && currentUser) {
        greetingEl.textContent = `Привет, ${currentUser.email.split('@')[0]}!`;
    }

    switch (path) {
        case 'auth.html': initAuthPage(); break;
        case 'home.html': initHomePage(); break;
        case 'game_math.html': initGameMathPage(currentUser); break;
        case 'game_phys.html': initGamePhysPage(currentUser); break;
        case 'profile.html': initProfilePage(currentUser); break;
    }
}

document.addEventListener('DOMContentLoaded', initPage);