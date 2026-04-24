// profile.js
import { loadUserDataFromCloud } from './firebase-sync.js';
import { auth } from './firebase-sync.js';
import { onAuthStateChanged } from './firebase-sync.js';

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const data = await loadUserDataFromCloud(user.uid);
        if (data) {
            // Обновляем интерфейс профиля данными из БД
            document.getElementById('profileName').textContent = user.email.split('@')[0];
            document.getElementById('profileLevel').textContent = data.level || 1;
            document.getElementById('profileScore').textContent = data.score || 0;
            document.getElementById('solvedCount').textContent = (data.solvedTaskIds || []).length;
        }
    } else {
        window.location.href = 'auth.html';
    }
});
