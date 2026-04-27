// Модуль профиля для работы с локальной базой данных IndexedDB
import { logoutUser } from './main.js';

export function initProfilePage(currentUser) {
    if (!currentUser) {
        window.location.href = 'auth.html';
        return;
    }
    
    const emailEl = document.getElementById('profileEmail');
    const rankEl = document.getElementById('profileRank');
    const solvedEl = document.getElementById('profileSolved');
    const accEl = document.getElementById('profileAccuracy');
    const scoreEl = document.getElementById('profileScore');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Защита от XSS - экранирование email
    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };
    
    if (emailEl) emailEl.textContent = escapeHtml(currentUser.email);
    if (rankEl) rankEl.textContent = currentUser.rank || 'Новичок';
    if (solvedEl) solvedEl.textContent = (currentUser.solved || 0).toString();
    const acc = currentUser.totalAnswered > 0
        ? Math.round((currentUser.solved / currentUser.totalAnswered) * 100)
        : 0;
    if (accEl) accEl.textContent = acc + '%';
    if (scoreEl) scoreEl.textContent = (currentUser.score || 0).toString();
    
    logoutBtn?.addEventListener('click', () => {
        logoutUser();
        window.location.href = 'auth.html';
    });
}
