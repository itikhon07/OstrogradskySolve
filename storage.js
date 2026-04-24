const DB_NAME = 'OstrogradskyDB';
const DB_VERSION = 1;
const STORE_USERS = 'users';

let dbInstance = null;

function openDB() {
    if (dbInstance) return Promise.resolve(dbInstance);
    
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            dbInstance = request.result;
            resolve(dbInstance);
        };
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_USERS)) {
                db.createObjectStore(STORE_USERS, { keyPath: 'email' });
            }
        };
    });
}

export async function getUsersFromDB() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_USERS, 'readonly');
        const store = tx.objectStore(STORE_USERS);
        const request = store.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const usersArray = request.result;
            const usersObj = {};
            usersArray.forEach(u => {
                usersObj[u.email] = u;
            });
            resolve(usersObj);
        };
    });
}

export async function getUserByEmail(email) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_USERS, 'readonly');
        const store = tx.objectStore(STORE_USERS);
        const request = store.get(email);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

export async function saveUserToDB(user) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_USERS, 'readwrite');
        const store = tx.objectStore(STORE_USERS);
        const request = store.put(user);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

export async function updateUserField(email, field, value) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_USERS, 'readwrite');
        const store = tx.objectStore(STORE_USERS);
        const getRequest = store.get(email);
        getRequest.onerror = () => reject(getRequest.error);
        getRequest.onsuccess = () => {
            const user = getRequest.result;
            if (!user) {
                reject(new Error('User not found'));
                return;
            }
            user[field] = value;
            const putRequest = store.put(user);
            putRequest.onerror = () => reject(putRequest.error);
            putRequest.onsuccess = () => resolve(user);
        };
    });
}

export async function migrateFromLocalStorage() {
    const oldUsers = localStorage.getItem('qmath_users');
    if (!oldUsers) return;
    const users = JSON.parse(oldUsers);
    for (const email in users) {
        await saveUserToDB({ email, ...users[email] });
    }
    localStorage.removeItem('qmath_users');
}