export function initHomePage() {
    const startMathBtn = document.getElementById('startMathBtn');
    const startPhysBtn = document.getElementById('startPhysBtn');

    startMathBtn?.addEventListener('click', () => {
        window.location.href = 'game_math.html';
    });

    startPhysBtn?.addEventListener('click', () => {
        window.location.href = 'game_phys.html';
    });
}