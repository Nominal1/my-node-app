

const fs = require('fs').promises; // только асинхронные методы (async/await)
const path = require('path');      // модуль path для всех операций с путями

const VARIANT = 5;
const FILE_NAME = `student_${VARIANT}.txt`;
const FILE_PATH = path.join(__dirname, FILE_NAME);

const studentInfo = {
    name: 'Дворник Никита',
    group: '478',
    variant: VARIANT,
    favorites: [
        'Довод',
        'Бессметрные',
        'Стражи Галактики',
        'Мстители',
        'Зеленый Фонарь',
    ],
};

async function main() {
    try {
        const now = new Date();
        const dateStr = now.toLocaleString('ru-RU');

        // Строки, которые будем записывать в файл
        const lines = [
            `Студент: ${studentInfo.name}`,
            `Группа: ${studentInfo.group}`,
            `Вариант: ${studentInfo.variant}`,
            `Дата: ${dateStr}`,
            'Любимые книги и фильмы:',
        ];

        studentInfo.favorites.forEach((title, index) => {
            lines.push(`${index + 1}. "${title}"`);
        });

        await fs.writeFile(FILE_PATH, lines.join('\n') + '\n', 'utf-8');

        const countLine = `Количество записей: ${lines.length}`;
        await fs.appendFile(FILE_PATH, countLine + '\n', 'utf-8');

        console.log(`Создан файл: ${FILE_NAME}`);

        const content = await fs.readFile(FILE_PATH, 'utf-8');
        console.log('Содержимое файла:');
        console.log(content);
    } catch (error) {
        console.error(`Ошибка при работе с файлом: ${error.message}`);
        process.exitCode = 1;
    }
}

main();
