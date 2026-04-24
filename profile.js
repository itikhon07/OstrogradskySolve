import { logoutUser } from './auth.js';

export function initProfilePage(currentUser) {
    if (!currentUser || !currentUser.email) {
        window.location.href = 'auth.html';
        return;
    }

    const emailEl = document.getElementById('profileEmail');
    const rankEl = document.getElementById('profileRank');
    const solvedEl = document.getElementById('profileSolved');
    const accEl = document.getElementById('profileAccuracy');
    const scoreEl = document.getElementById('profileScore');
    const logoutBtn = document.getElementById('logoutBtn');

    if (emailEl) emailEl.textContent = currentUser.email;
    if (rankEl) rankEl.textContent = currentUser.rank || 'Новичок';
    if (solvedEl) solvedEl.textContent = (currentUser.solved || 0).toString();
    const acc = (currentUser.totalAnswered || 0) > 0
        ? Math.round(((currentUser.solved || 0) / (currentUser.totalAnswered || 1)) * 100)
        : 0;
    if (accEl) accEl.textContent = acc + '%';
    if (scoreEl) scoreEl.textContent = (currentUser.score || 0).toString();

    // Отображение массива решенных задач (для отладки/просмотра)
    const solvedTasksEl = document.getElementById('profileSolvedTasks');
    if (solvedTasksEl) {
        const solvedIds = currentUser.solvedTaskIds || currentUser.solvedTasks || [];
        solvedTasksEl.textContent = `Решено задач: ${solvedIds.length}`;
    }

    logoutBtn?.addEventListener('click', async () => {
        await logoutUser();
    });
}