// game.js - Основная логика игры с интеграцией Firebase

import { auth, db, saveUserToCloud, loadUserDataFromCloud } from './firebase-sync.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// --- Состояние игры ---
let currentUser = null;
let gameState = {
    level: 1,
    score: 0,
    experience: 0,
    solvedTaskIds: [], // Массив ID решенных задач
    statistics: {
        totalSolved: 0,
        streak: 0,
        bestStreak: 0,
        accuracy: 100,
        correctAnswers: 0,
        totalAttempts: 0
    }
};

let currentTask = null;
let isProcessing = false;

// --- Элементы DOM ---
const ui = {
    level: document.getElementById('user-level'),
    score: document.getElementById('user-score'),
    expBar: document.getElementById('exp-bar-fill'),
    expText: document.getElementById('exp-text'),
    taskContainer: document.getElementById('task-container'),
    taskText: document.getElementById('task-text'),
    answerInput: document.getElementById('answer-input'),
    submitBtn: document.getElementById('submit-btn'),
    feedback: document.getElementById('feedback-msg'),
    statsTotal: document.getElementById('stats-total'),
    statsStreak: document.getElementById('stats-streak'),
    statsAccuracy: document.getElementById('stats-accuracy')
};

// --- Инициализация ---
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Обработчики событий
    if (ui.submitBtn) {
        ui.submitBtn.addEventListener('click', handleSubmission);
    }
    if (ui.answerInput) {
        ui.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSubmission();
        });
    }
});

// --- Проверка авторизации ---
function checkAuth() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            console.log("Пользователь авторизован:", user.email);
            
            // Загружаем данные из облака или создаем новые
            await loadProgress();
            
            // Запускаем игру
            updateUI();
            generateTask();
        } else {
            console.warn("Пользователь не авторизован. Перенаправление...");
            // Если открыли game.html без входа, кидаем на auth
            window.location.href = 'auth.html';
        }
    });
}

// --- Загрузка прогресса ---
async function loadProgress() {
    try {
        const data = await loadUserDataFromCloud(currentUser.uid);
        if (data) {
            gameState = { ...gameState, ...data };
            console.log("Прогресс загружен:", gameState);
        } else {
            console.log("Новый пользователь, инициализация пустого прогресса.");
            await saveProgress(); // Сохраняем начальный статус
        }
        updateStatsUI();
    } catch (error) {
        console.error("Ошибка загрузки прогресса:", error);
        showFeedback("Ошибка загрузки данных", "error");
    }
}

// --- Сохранение прогресса ---
async function saveProgress() {
    if (!currentUser) return;
    try {
        await saveUserToCloud(currentUser.uid, gameState);
        // console.log("Прогресс сохранен в облако");
    } catch (error) {
        console.error("Ошибка сохранения:", error);
        showFeedback("Не удалось сохранить прогресс", "error");
    }
}

// --- Логика игры ---

function generateTask() {
    if (isProcessing) return;
    
    isProcessing = false;
    ui.answerInput.value = '';
    ui.answerInput.focus();
    showFeedback("", "");

    // Простая генерация задач в зависимости от уровня
    const level = gameState.level;
    let num1, num2, operator, answer, taskId;
    
    do {
        const type = Math.random();
        
        if (type < 0.4) { // Сложение
            num1 = Math.floor(Math.random() * (10 * level)) + 1;
            num2 = Math.floor(Math.random() * (10 * level)) + 1;
            operator = '+';
            answer = num1 + num2;
        } else if (type < 0.7) { // Вычитание
            num1 = Math.floor(Math.random() * (10 * level)) + 5;
            num2 = Math.floor(Math.random() * num1); // Чтобы не было отрицательных
            operator = '-';
            answer = num1 - num2;
        } else { // Умножение
            num1 = Math.floor(Math.random() * (5 * level)) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
            operator = '×';
            answer = num1 * num2;
        }

        // Создаем уникальный ID задачи
        taskId = `${num1}${operator}${num2}`;
        
        // Проверяем, не решали ли мы уже эту задачу (опционально, можно убрать для бесконечной игры)
        // if (gameState.solvedTaskIds.includes(taskId)) continue; 
        
    } while (gameState.solvedTaskIds.includes(taskId)); // Генерируем, пока не найдем новую

    currentTask = { id: taskId, answer: answer };
    
    // Отображаем задачу
    ui.taskText.textContent = `${num1} ${operator} ${num2} = ?`;
}

function handleSubmission() {
    if (isProcessing || !currentTask) return;
    
    const userAnswer = parseFloat(ui.answerInput.value);
    
    if (isNaN(userAnswer)) {
        showFeedback("Введите число!", "error");
        return;
    }

    isProcessing = true;
    gameState.statistics.totalAttempts++;

    if (userAnswer === currentTask.answer) {
        // Правильный ответ
        handleCorrectAnswer();
    } else {
        // Неправильный ответ
        handleWrongAnswer();
    }
}

function handleCorrectAnswer() {
    showFeedback("Верно! +10 очков", "success");
    
    // Обновляем статистику
    gameState.score += 10;
    gameState.experience += 20;
    gameState.statistics.correctAnswers++;
    gameState.statistics.streak++;
    gameState.statistics.totalSolved++;
    
    if (gameState.statistics.streak > gameState.statistics.bestStreak) {
        gameState.statistics.bestStreak = gameState.statistics.streak;
    }

    // Добавляем задачу в решенные
    if (!gameState.solvedTaskIds.includes(currentTask.id)) {
        gameState.solvedTaskIds.push(currentTask.id);
    }

    // Проверка уровня
    checkLevelUp();
    
    // Сохраняем и обновляем UI
    saveProgress();
    updateUI();
    updateStatsUI();

    // Следующая задача через паузу
    setTimeout(generateTask, 1000);
}

function handleWrongAnswer() {
    showFeedback(`Ошибка! Правильный ответ: ${currentTask.answer}`, "error");
    
    gameState.statistics.streak = 0;
    
    // Небольшой штраф или просто без бонусов
    saveProgress();
    updateStatsUI();

    setTimeout(generateTask, 1500);
}

function checkLevelUp() {
    const expNeeded = gameState.level * 100;
    if (gameState.experience >= expNeeded) {
        gameState.level++;
        gameState.experience = 0; // Или вычесть порог, если нужна накопительная система
        showFeedback(`Уровень повышен! Теперь вы ${gameState.level} уровня`, "success");
        // Можно добавить звук или анимацию
    }
}

// --- Обновление интерфейса ---
function updateUI() {
    if (!ui.level || !ui.score) return;

    ui.level.textContent = `Ур. ${gameState.level}`;
    ui.score.textContent = `Очки: ${gameState.score}`;
    
    const expNeeded = gameState.level * 100;
    const expPercent = Math.min(100, (gameState.experience / expNeeded) * 100);
    
    if (ui.expBar) ui.expBar.style.width = `${expPercent}%`;
    if (ui.expText) ui.expText.textContent = `${gameState.experience} / ${expNeeded} XP`;
}

function updateStatsUI() {
    if (!ui.statsTotal) return;
    
    const acc = gameState.statistics.totalAttempts > 0 
        ? Math.round((gameState.statistics.correctAnswers / gameState.statistics.totalAttempts) * 100) 
        : 0;

    ui.statsTotal.textContent = gameState.statistics.totalSolved;
    ui.statsStreak.textContent = gameState.statistics.streak;
    ui.statsAccuracy.textContent = `${acc}%`;
}

function showFeedback(text, type) {
    if (!ui.feedback) return;
    ui.feedback.textContent = text;
    ui.feedback.className = type; // 'success' или 'error'
    
    // Анимация появления
    ui.feedback.style.opacity = 1;
    setTimeout(() => {
        if (text === "") ui.feedback.style.opacity = 0;
    }, 2000);
}

// Экспорт функции выхода (если нужна кнопка выхода в игре)
window.logoutGame = async () => {
    const { signOut } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    await signOut(auth);
    window.location.href = 'auth.html';
};
