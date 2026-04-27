// Игровой модуль для математики и физики
// Все данные хранятся локально через IndexedDB

import { openDB } from './storage.js';
import { tasksMath, tasksPhys, loadTasksMath, loadTasksPhys } from './tasks.js';

const DB_NAME = 'OstrogradskyDB';
const STORE_USERS = 'users';

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

// Получение текущего пользователя
function getCurrentUserEmail() {
    return localStorage.getItem('qmath_current_user');
}

// Загрузка данных пользователя
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

// Сохранение данных пользователя
async function saveUserData(user) {
    if (!user || !user.email) return false;
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_USERS, 'readwrite');
        const store = tx.objectStore(STORE_USERS);
        const request = store.put(user);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(true);
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Страница загружена, начинаем инициализацию...');
    
    // Сначала инициализируем аутентификацию и ждем загрузки пользователя
    const userLoaded = await initAuth();
    
    // Загрузка задач
    try {
        await loadTasksMath();
        console.log(`Математика: загружено ${tasksMath.length} задач`);
    } catch (e) {
        console.error('Ошибка загрузки математики:', e);
    }
    
    try {
        await loadTasksPhys();
        console.log(`Физика: загружено ${tasksPhys.length} задач`);
    } catch (e) {
        console.error('Ошибка загрузки физики:', e);
    }
    
    // Инициализация canvas и кнопок после аутентификации
    initCanvas();
    initButtons();
    
    // Загружаем первую задачу только если пользователь успешно аутентифицирован
    if (userLoaded) {
        loadNewProblem();
    }
});

// Инициализация аутентификации
async function initAuth() {
    const email = getCurrentUserEmail();
    if (email) {
        currentUser = await loadUserData(email);
        if (currentUser) {
            document.getElementById('greeting').textContent = `Привет, ${email.split('@')[0]}!`;
            score = currentUser.score || 0;
            updateScoreDisplay();
            return true; // Пользователь успешно загружен
        } else {
            window.location.href = 'auth.html';
            return false;
        }
    } else {
        window.location.href = 'auth.html';
        return false;
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
    
    // Определение типа задачи из URL
    const path = window.location.pathname;
    const isMath = path.includes('game_math.html');
    
    // Выбор случайной задачи из загруженных
    const tasks = isMath ? tasksMath : tasksPhys;
    if (tasks && tasks.length > 0) {
        const randomIndex = Math.floor(Math.random() * tasks.length);
        currentProblem = tasks[randomIndex];
    } else {
        // Заглушка, если задачи не загружены
        currentProblem = {
            id: 'temp_' + Date.now(),
            image: isMath ? 'assets/images/examples_math/1.png' : 'assets/images/examples_phys/1.png',
            answer: isMath ? 0.368 : 10,
            type: isMath ? 'math' : 'phys'
        };
    }
    
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
        
        // Обновление данных пользователя локально
        if (currentUser) {
            try {
                currentUser.score = (currentUser.score || 0) + pointsEarned;
                currentUser.solved = (currentUser.solved || 0) + 1;
                currentUser.totalAnswered = (currentUser.totalAnswered || 0) + 1;
                
                // Добавляем задачу в список решенных
                if (!currentUser.solvedTasks) {
                    currentUser.solvedTasks = [];
                }
                if (!currentUser.solvedTasks.includes(currentProblem.id)) {
                    currentUser.solvedTasks.push(currentProblem.id);
                }
                
                // Сохраняем обновленные данные в IndexedDB
                await saveUserData(currentUser);
            } catch (error) {
                console.error('Ошибка обновления счета:', error);
            }
        }
        
        showMessage(`Правильно! +${pointsEarned} баллов`, 'success');
        
        // Загрузка новой задачи через небольшую паузу
        setTimeout(loadNewProblem, 1500);
    } else {
        // Неправильный ответ
        if (currentUser) {
            currentUser.totalAnswered = (currentUser.totalAnswered || 0) + 1;
            await saveUserData(currentUser);
        }
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
