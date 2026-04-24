import { migrateFromLocalStorage, getUsersFromDB } from './storage.js';
import { loadTasksMath, loadTasksPhys } from './tasks.js';
import { initAuthPage } from './auth.js';
import { initHomePage } from './home.js';
import { initGameMathPage, initGamePhysPage } from './game.js';
import { initProfilePage } from './profile.js';

let currentUser = null;

async function initCurrentUser() {
    const email = localStorage.getItem('qmath_current_user');
    if (email) {
        const users = await getUsersFromDB();
        currentUser = users[email] ? { email, ...users[email] } : null;
        if (!currentUser) localStorage.removeItem('qmath_current_user');
    }
}

export function getCurrentUser() { return currentUser; }
export function setCurrentUser(email) {
    if (email) localStorage.setItem('qmath_current_user', email);
    else localStorage.removeItem('qmath_current_user');
}

async function initPage() {
    await migrateFromLocalStorage();
    await initCurrentUser();
    await loadTasksMath();
    await loadTasksPhys();

    const path = window.location.pathname.split('/').pop() || 'auth.html';

    if (!currentUser && !['auth.html', ''].includes(path)) {
        window.location.href = 'auth.html';
        return;
    }
    if (currentUser && path === 'auth.html') {
        window.location.href = 'home.html';
        return;
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