import { tasksMath, tasksMathLoaded, tasksPhys, tasksPhysLoaded } from './tasks.js';
import { saveUserToDB, getUsersFromDB } from './storage.js';
import { saveUserToCloud } from './firebase-sync.js';

async function updateUserInDB(email, newData) {
    const users = await getUsersFromDB();
    const user = users[email];
    if (!user) throw new Error('User not found');
    const updated = { ...user, ...newData };
    await saveUserToDB({ email, ...updated });
    
    // Сохраняем в облако Firebase
    try {
        await saveUserToCloud({ email, ...updated });
    } catch (e) {
        console.error("Не удалось сохранить в облако:", e);
    }
    
    return { email, ...updated };
}

function getRank(score) {
    if (score < 100) return 'Новичок';
    if (score < 300) return 'Ученик';
    if (score < 600) return 'Знаток';
    return 'Математик';
}

function initGame(tasks, tasksLoaded, subject, initialUser) {
    const gameScoreSpan = document.getElementById('gameScore');
    const exampleImg = document.getElementById('exampleImg');
    const answerInput = document.getElementById('answerInput');
    const checkBtn = document.getElementById('checkBtn');
    const skipBtn = document.getElementById('skipBtn');
    const gameMessage = document.getElementById('gameMessage');

    const drawerPanel = document.getElementById('drawerPanel');
    const toggleDrawerBtn = document.getElementById('toggleDrawerBtn');
    const closeDrawerBtn = document.getElementById('closeDrawerBtn');
    const drawCanvas = document.getElementById('drawCanvas');
    const clearCanvasBtn = document.getElementById('clearCanvasBtn');
    const colorBtns = document.querySelectorAll('.color-btn');
    const eraserBtn = document.getElementById('eraserBtn');

    if (!gameScoreSpan || !exampleImg || !answerInput || !checkBtn || !skipBtn || !gameMessage ||
        !drawerPanel || !toggleDrawerBtn || !closeDrawerBtn || !drawCanvas || !clearCanvasBtn || !eraserBtn) {
        console.error('Не найден один из обязательных элементов');
        return;
    }

    let currentUser = initialUser;
    let currentTaskIndex = 0;
    let answerLocked = false;

    let ctx = null;
    let isDrawing = false;
    let lastX = 0, lastY = 0;
    let currentColor = '#000000';
    let eraserMode = false;

    const refreshUI = () => {
        gameScoreSpan.textContent = `${currentUser.score} баллов`;
    };

    const showGameMessage = (text, isError = false) => {
        gameMessage.textContent = text;
        gameMessage.classList.remove('hidden');
        if (isError) gameMessage.classList.add('error');
        else gameMessage.classList.remove('error');
        setTimeout(() => gameMessage.classList.add('hidden'), 3000);
    };

    const loadRandomTask = () => {
        if (!tasksLoaded || tasks.length === 0) {
            exampleImg.src = '';
            exampleImg.alt = 'Задачи не загружены';
            return;
        }

        const solvedSet = new Set(currentUser.solvedTasks);
        const unsolvedTasks = tasks.filter(task => !solvedSet.has(task.id));

        if (unsolvedTasks.length === 0) {
            exampleImg.src = '';
            exampleImg.alt = `🎉 Поздравляем! Вы решили все задачи по ${subject === 'math' ? 'математике' : 'физике'}!`;
            answerInput.disabled = true;
            checkBtn.disabled = true;
            skipBtn.disabled = true;
            showGameMessage(`🎉 Поздравляем! Вы решили все доступные задачи по ${subject === 'math' ? 'математике' : 'физике'}!`);
            return;
        }

        const randomIndex = Math.floor(Math.random() * unsolvedTasks.length);
        const task = unsolvedTasks[randomIndex];
        currentTaskIndex = tasks.findIndex(t => t.id === task.id);

        exampleImg.src = task.image;
        exampleImg.alt = `Пример ${task.id}`;
        answerInput.value = '';
        gameMessage.classList.add('hidden');
        answerLocked = false;
        checkBtn.disabled = false;
        checkBtn.style.opacity = '1';
        checkBtn.style.pointerEvents = 'auto';
        answerInput.disabled = false;
        skipBtn.disabled = false;
    };

    const checkAnswer = async () => {
        if (!tasksLoaded || tasks.length === 0) {
            showGameMessage('Задачи ещё не загружены', true);
            return;
        }
        if (answerLocked) {
            showGameMessage('Вы уже ответили на этот пример', true);
            return;
        }

        const task = tasks[currentTaskIndex];
        const userAnswer = parseFloat(answerInput.value);
        if (isNaN(userAnswer)) {
            showGameMessage('Введите число!', true);
            return;
        }

        const isCorrect = (userAnswer === task.answer);
        const newTotal = currentUser.totalAnswered + 1;
        let newSolved = currentUser.solved;
        let newScore = currentUser.score;
        const newSolvedTasks = [...currentUser.solvedTasks];

        if (isCorrect) {
            newSolved += 1;
            newScore += subject === 'math' ? 10 : 15;
            if (!newSolvedTasks.includes(task.id)) {
                newSolvedTasks.push(task.id);
            }
            showGameMessage(`✅ Верно! +${subject === 'math' ? 10 : 15} баллов`);
            answerLocked = true;
            checkBtn.disabled = true;
            checkBtn.style.opacity = '0.5';
            checkBtn.style.pointerEvents = 'none';

            const rank = getRank(newScore);
            currentUser = await updateUserInDB(currentUser.email, {
                solved: newSolved,
                totalAnswered: newTotal,
                score: newScore,
                solvedTasks: newSolvedTasks,
                rank
            });
            refreshUI();

            setTimeout(() => loadRandomTask(), 1500);
        } else {
            showGameMessage('❌ Неверно, попробуй ещё раз', true);
            currentUser = await updateUserInDB(currentUser.email, {
                totalAnswered: newTotal
            });
            refreshUI();
        }
    };

    const skipTask = () => {
        loadRandomTask();
        showGameMessage('⏭ Задача пропущена');
    };

    // Canvas functions
    const initCanvas = () => {
        if (drawCanvas) {
            ctx = drawCanvas.getContext('2d');
            if (ctx) {
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
                ctx.strokeStyle = currentColor;
                ctx.globalCompositeOperation = 'source-over';
            }
        }
    };

    const getCanvasCoordinates = (e) => {
        if (!drawCanvas) return null;
        const rect = drawCanvas.getBoundingClientRect();
        const scaleX = drawCanvas.width / rect.width;
        const scaleY = drawCanvas.height / rect.height;

        let clientX, clientY;
        if (e instanceof TouchEvent) {
            if (e.touches.length === 0) return null;
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;
        return {
            x: Math.max(0, Math.min(drawCanvas.width, x)),
            y: Math.max(0, Math.min(drawCanvas.height, y))
        };
    };

    const startDrawing = (e) => {
        e.preventDefault();
        if (!ctx) return;
        isDrawing = true;
        const pos = getCanvasCoordinates(e);
        if (pos) {
            lastX = pos.x;
            lastY = pos.y;
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
        }
    };

    const draw = (e) => {
        e.preventDefault();
        if (!isDrawing || !ctx) return;
        const pos = getCanvasCoordinates(e);
        if (pos) {
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
            lastX = pos.x;
            lastY = pos.y;
        }
    };

    const stopDrawing = () => {
        isDrawing = false;
        if (ctx) ctx.closePath();
    };

    const setColor = (color) => {
        currentColor = color;
        if (ctx) {
            ctx.strokeStyle = color;
            ctx.globalCompositeOperation = 'source-over';
        }
        eraserMode = false;
        eraserBtn.classList.remove('active');
    };

    const toggleEraser = () => {
        if (!ctx) return;
        eraserMode = !eraserMode;
        eraserBtn.classList.toggle('active', eraserMode);
        if (eraserMode) {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = 20;
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.lineWidth = 3;
            ctx.strokeStyle = currentColor;
        }
    };

    const clearCanvas = () => {
        if (ctx && drawCanvas) {
            ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
        }
    };

    const openDrawer = () => {
        drawerPanel.classList.add('open');
        drawerPanel.setAttribute('aria-hidden', 'false');
        drawCanvas.focus();
    };

    const closeDrawer = () => {
        drawerPanel.classList.remove('open');
        drawerPanel.setAttribute('aria-hidden', 'true');
    };

    const toggleDrawer = () => {
        drawerPanel.classList.contains('open') ? closeDrawer() : openDrawer();
    };

    // Event listeners
    checkBtn.addEventListener('click', checkAnswer);
    skipBtn.addEventListener('click', skipTask);
    answerInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkAnswer(); });
    toggleDrawerBtn.addEventListener('click', toggleDrawer);
    closeDrawerBtn.addEventListener('click', closeDrawer);
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawerPanel.classList.contains('open')) closeDrawer(); });

    initCanvas();
    drawCanvas.addEventListener('mousedown', startDrawing);
    drawCanvas.addEventListener('mousemove', draw);
    drawCanvas.addEventListener('mouseup', stopDrawing);
    drawCanvas.addEventListener('mouseleave', stopDrawing);
    drawCanvas.addEventListener('touchstart', startDrawing, { passive: false });
    drawCanvas.addEventListener('touchmove', draw, { passive: false });
    drawCanvas.addEventListener('touchend', stopDrawing);
    drawCanvas.addEventListener('touchcancel', stopDrawing);

    colorBtns.forEach(btn => btn.addEventListener('click', () => {
        const color = btn.getAttribute('data-color');
        if (color) setColor(color);
    }));
    eraserBtn.addEventListener('click', toggleEraser);
    clearCanvasBtn.addEventListener('click', clearCanvas);

    refreshUI();
    loadRandomTask();
}

export function initGameMathPage(currentUser) {
    if (!currentUser) {
        window.location.href = 'auth.html';
        return;
    }
    initGame(tasksMath, tasksMathLoaded, 'math', currentUser);
}

export function initGamePhysPage(currentUser) {
    if (!currentUser) {
        window.location.href = 'auth.html';
        return;
    }
    initGame(tasksPhys, tasksPhysLoaded, 'phys', currentUser);
}