import { db, auth } from './firebase-config.js';
import { doc, getDoc, updateDoc, increment } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

let currentUser = null;
let currentProblem = null;
let score = 0;
let isDrawerOpen = false;
let canvas, ctx;
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentColor = '#000000';
let isEraser = false;
let brushSize = 3;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initCanvas();
    initButtons();
    loadNewProblem();
});

// Инициализация аутентификации
function initAuth() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            document.getElementById('greeting').textContent = `Привет, ${user.displayName || 'Ученик'}!`;
            loadUserScore();
        } else {
            window.location.href = 'login.html';
        }
    });
}

// Загрузка счета пользователя
async function loadUserScore() {
    if (!currentUser) return;
    
    try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            score = userData.score || 0;
            updateScoreDisplay();
        }
    } catch (error) {
        console.error('Ошибка загрузки счета:', error);
    }
}

// Обновление отображения счета
function updateScoreDisplay() {
    document.getElementById('gameScore').innerHTML = `<i class="fas fa-star"></i> ${score} баллов`;
}

// Инициализация холста для рисования
function initCanvas() {
    canvas = document.getElementById('drawCanvas');
    if (!canvas) return;
    
    ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushSize;
    
    // Обработчики событий для рисования
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Поддержка сенсорных устройств
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', stopDrawing);
}

function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function draw(e) {
    if (!isDrawing) return;
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function stopDrawing() {
    isDrawing = false;
}

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    isDrawing = true;
    [lastX, lastY] = [x, y];
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!isDrawing) return;
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    [lastX, lastY] = [x, y];
}

// Инициализация кнопок
function initButtons() {
    // Кнопка проверки ответа
    const checkBtn = document.getElementById('checkBtn');
    if (checkBtn) {
        checkBtn.addEventListener('click', checkAnswer);
    }
    
    // Кнопка пропуска
    const skipBtn = document.getElementById('skipBtn');
    if (skipBtn) {
        skipBtn.addEventListener('click', loadNewProblem);
    }
    
    // Кнопка "На главную"
    const homeBtn = document.getElementById('homeBtn');
    if (homeBtn) {
        homeBtn.addEventListener('click', goToHome);
    }
    
    // Кнопки управления доской
    const toggleDrawerBtn = document.getElementById('toggleDrawerBtn');
    const closeDrawerBtn = document.getElementById('closeDrawerBtn');
    
    if (toggleDrawerBtn) {
        toggleDrawerBtn.addEventListener('click', toggleDrawer);
    }
    
    if (closeDrawerBtn) {
        closeDrawerBtn.addEventListener('click', closeDrawer);
    }
    
    // Выбор цвета
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentColor = btn.dataset.color;
            isEraser = false;
            ctx.strokeStyle = currentColor;
            ctx.globalCompositeOperation = 'source-over';
        });
    });
    
    // Ластик
    const eraserBtn = document.getElementById('eraserBtn');
    if (eraserBtn) {
        eraserBtn.addEventListener('click', () => {
            isEraser = true;
            ctx.globalCompositeOperation = 'destination-out';
        });
    }
    
    // Очистка холста
    const clearCanvasBtn = document.getElementById('clearCanvasBtn');
    if (clearCanvasBtn) {
        clearCanvasBtn.addEventListener('click', clearCanvas);
    }
    
    // Обработка ввода Enter в поле ответа
    const answerInput = document.getElementById('answerInput');
    if (answerInput) {
        answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkAnswer();
            }
        });
    }
}

// Переключение видимости доски
function toggleDrawer() {
    const drawerPanel = document.getElementById('drawerPanel');
    if (!drawerPanel) return;
    
    isDrawerOpen = !isDrawerOpen;
    drawerPanel.setAttribute('aria-hidden', !isDrawerOpen);
    drawerPanel.classList.toggle('open', isDrawerOpen);
    
    if (isDrawerOpen) {
        resizeCanvas();
    }
}

// Закрытие доски
function closeDrawer() {
    const drawerPanel = document.getElementById('drawerPanel');
    if (!drawerPanel) return;
    
    isDrawerOpen = false;
    drawerPanel.setAttribute('aria-hidden', true);
    drawerPanel.classList.remove('open');
}

// Изменение размера холста
function resizeCanvas() {
    if (!canvas) return;
    
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = 400;
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushSize;
}

// Очистка холста
function clearCanvas() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Загрузка новой задачи
async function loadNewProblem() {
    showMessage('', 'hidden');
    document.getElementById('answerInput').value = '';
    
    // Здесь должна быть логика загрузки задачи из базы данных
    // Для примера используем заглушку
    currentProblem = {
        id: 'temp_' + Date.now(),
        image: 'assets/examples/math/example1.png', // Путь к изображению
        answer: 42, // Правильный ответ
        type: 'math' // или 'phys'
    };
    
    // Обновление изображения
    const imgElement = document.getElementById('exampleImg');
    if (imgElement && currentProblem.image) {
        imgElement.src = currentProblem.image;
        imgElement.alt = currentProblem.type === 'math' ? 'Математический пример' : 'Физическая задача';
    }
    
    // Фокус на поле ввода
    document.getElementById('answerInput').focus();
}

// Проверка ответа
async function checkAnswer() {
    const answerInput = document.getElementById('answerInput');
    const userAnswer = parseFloat(answerInput.value);
    
    if (isNaN(userAnswer)) {
        showMessage('Пожалуйста, введите числовой ответ!', 'error');
        return;
    }
    
    if (!currentProblem) {
        showMessage('Ошибка: задача не загружена', 'error');
        return;
    }
    
    // Проверка ответа (с небольшой погрешностью для дробных чисел)
    const isCorrect = Math.abs(userAnswer - currentProblem.answer) < 0.01;
    
    if (isCorrect) {
        // Правильный ответ
        const pointsEarned = 10;
        score += pointsEarned;
        updateScoreDisplay();
        
        // Обновление счета в базе данных
        if (currentUser) {
            try {
                await updateDoc(doc(db, 'users', currentUser.uid), {
                    score: increment(pointsEarned)
                });
            } catch (error) {
                console.error('Ошибка обновления счета:', error);
            }
        }
        
        showMessage(`Правильно! +${pointsEarned} баллов`, 'success');
        
        // Загрузка новой задачи через небольшую паузу
        setTimeout(loadNewProblem, 1500);
    } else {
        // Неправильный ответ
        showMessage(`Неправильно. Попробуйте еще раз!`, 'error');
    }
}

// Переход на главную страницу
function goToHome() {
    window.location.href = 'home.html';
}

// Отображение сообщений
function showMessage(text, type) {
    const messageEl = document.getElementById('gameMessage');
    if (!messageEl) return;
    
    messageEl.textContent = text;
    messageEl.className = 'message ' + type;
    
    if (type !== 'hidden') {
        setTimeout(() => {
            messageEl.className = 'message hidden';
        }, 3000);
    }
}

// Экспорт функций для использования в других модулях
export { loadNewProblem, checkAnswer };
