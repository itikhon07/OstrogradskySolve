export const TASKS_FILE_M = 'data/answers_math.txt';
export const TASKS_FILE_P = 'data/answers_phys.txt';
export const IMAGE_PATH_M = 'assets/images/examples_math/';
export const IMAGE_PATH_P = 'assets/images/examples_phys/';

export let tasksMath = [];
export let tasksMathLoaded = false;

export let tasksPhys = [];
export let tasksPhysLoaded = false;

export async function loadTasksMath() {
    try {
        const response = await fetch(TASKS_FILE_M);
        if (!response.ok) throw new Error('Не удалось загрузить файл с ответами по математике');
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim() !== '');
        tasksMath = lines.map(line => {
            const parts = line.split(':');
            if (parts.length < 2) return null;
            const id = parseInt(parts[0].trim(), 10);
            if (isNaN(id)) return null;
            const answer = parseFloat(parts.slice(1).join(':').trim().replace(',', '.'));
            if (isNaN(answer)) return null;
            return { id, image: `${IMAGE_PATH_M}${id}.png`, answer };
        }).filter(task => task !== null);
        tasksMathLoaded = true;
        console.log(`Загружено ${tasksMath.length} задач по математике`);
    } catch (error) {
        console.error('Ошибка загрузки задач по математике:', error);
        tasksMath = [];
        tasksMathLoaded = false;
    }
}

export async function loadTasksPhys() {
    try {
        const response = await fetch(TASKS_FILE_P);
        if (!response.ok) throw new Error('Не удалось загрузить файл с ответами по физике');
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim() !== '');
        tasksPhys = lines.map(line => {
            const parts = line.split(':');
            if (parts.length < 2) return null;
            const id = parseInt(parts[0].trim(), 10);
            if (isNaN(id)) return null;
            const answer = parseFloat(parts.slice(1).join(':').trim().replace(',', '.'));
            if (isNaN(answer)) return null;
            return { id, image: `${IMAGE_PATH_P}${id}.png`, answer };
        }).filter(task => task !== null);
        tasksPhysLoaded = true;
        console.log(`Загружено ${tasksPhys.length} задач по физике`);
    } catch (error) {
        console.error('Ошибка загрузки задач по физике:', error);
        tasksPhys = [];
        tasksPhysLoaded = false;
    }
}