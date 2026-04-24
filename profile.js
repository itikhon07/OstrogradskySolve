import { logoutUser } from './auth.js';
import { getUserByEmail } from './storage.js';

export async function initProfilePage(currentUser) {
    if (!currentUser || !currentUser.email) {
        window.location.href = 'auth.html';
        return;
    }

    // Пытаемся загрузить актуальные данные пользователя из IndexedDB
    let userData = currentUser;
    try {
        const freshUser = await getUserByEmail(currentUser.email);
        if (freshUser && freshUser.email === currentUser.email) {
            userData = freshUser;
        }
    } catch (e) {
        console.warn('Не удалось загрузить свежие данные пользователя:', e);
    }

    const emailEl = document.getElementById('profileEmail');
    const rankEl = document.getElementById('profileRank');
    const solvedEl = document.getElementById('profileSolved');
    const accEl = document.getElementById('profileAccuracy');
    const scoreEl = document.getElementById('profileScore');
    const logoutBtn = document.getElementById('logoutBtn');

    if (emailEl) emailEl.textContent = userData.email;
    if (rankEl) rankEl.textContent = userData.rank || 'Новичок';
    if (solvedEl) solvedEl.textContent = (userData.solved || 0).toString();
    const acc = (userData.totalAnswered || 0) > 0
        ? Math.round(((userData.solved || 0) / (userData.totalAnswered || 1)) * 100)
        : 0;
    if (accEl) accEl.textContent = acc + '%';
    if (scoreEl) scoreEl.textContent = (userData.score || 0).toString();

    // Отображение массива решенных задач (для отладки/просмотра)
    const solvedTasksEl = document.getElementById('profileSolvedTasks');
    if (solvedTasksEl) {
        const solvedIds = userData.solvedTaskIds || userData.solvedTasks || [];
        solvedTasksEl.textContent = `Решено задач: ${solvedIds.length}`;
    }

    logoutBtn?.addEventListener('click', async () => {
        await logoutUser();
    });
}