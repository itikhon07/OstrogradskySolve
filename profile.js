import { logoutUser } from './auth.js';

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

    if (emailEl) emailEl.textContent = currentUser.email;
    if (rankEl) rankEl.textContent = currentUser.rank;
    if (solvedEl) solvedEl.textContent = currentUser.solved.toString();
    const acc = currentUser.totalAnswered > 0
        ? Math.round((currentUser.solved / currentUser.totalAnswered) * 100)
        : 0;
    if (accEl) accEl.textContent = acc + '%';
    if (scoreEl) scoreEl.textContent = currentUser.score.toString();

    // Отображение массива решенных задач (для отладки/просмотра)
    const solvedTasksEl = document.getElementById('profileSolvedTasks');
    if (solvedTasksEl && currentUser.solvedTaskIds) {
        solvedTasksEl.textContent = `Решено задач: ${currentUser.solvedTaskIds.length}`;
    }

    logoutBtn?.addEventListener('click', async () => {
        await logoutUser();
    });
}