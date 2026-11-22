// Задание 3: наследование от EventEmitter (DatabaseConnection)
const EventEmitter = require('events');
const { GROUP } = require('./variant');

class DatabaseConnection extends EventEmitter {
  constructor() {
    super();
    this.connected = false;
  }

  connect() {
    this.emit('connecting');
    this.connected = true;
    this.emit('connect');
    return this;
  }

  query(sql) {
    if (!this.connected) {
      this.error('Нет соединения с БД');
      return this;
    }
    let result;
    if (sql.toUpperCase().startsWith('SELECT')) {
      result = '50 записей';
    } else if (sql.toUpperCase().startsWith('INSERT')) {
      result = '1 запись добавлена';
    } else {
      result = 'выполнено';
    }
    this.emit('query', sql, result);
    return this;
  }

  close() {
    this.emit('closing');
    this.connected = false;
    this.emit('close');
    return this;
  }

  error(message) {
    // событие 'error' особое: без слушателя Node.js выбросит исключение
    this.emit('error', new Error(message));
    return this;
  }
}

// --- Демонстрация работы ---
console.log('=== DatabaseConnection (группа ' + GROUP + ') ===');
const db = new DatabaseConnection();

db.on('connecting', () => console.log('[EVENT] Подключение к БД...'));
db.on('connect', () => console.log('[EVENT] Соединение установлено'));
db.on('query', (sql, result) => {
  console.log('[EVENT] Выполнение запроса: ' + sql);
  console.log('[EVENT] Результат: ' + result);
});
db.on('closing', () => console.log('[EVENT] Закрытие соединения'));
db.on('close', () => console.log('[EVENT] Соединение закрыто'));
db.on('error', (err) => console.log('[EVENT] Ошибка: ' + err.message));

db.connect();
db.query('SELECT * FROM students');
db.query('INSERT INTO students');
db.close();

// --- Ошибка как событие ---
console.log('\n=== Демонстрация ошибки ===');
db.error('Connection timeout'); // есть слушатель - ошибка обработана

console.log('\n--- Без слушателя error ---');
const brokenDb = new DatabaseConnection();
try {
  brokenDb.error('Connection timeout');
} catch (e) {
  console.log('Без слушателя error выброшено исключение: ' + e.message);
  console.log('(в реальном приложении процесс бы упал)');
}
