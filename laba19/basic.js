// Задание 1: простой EventEmitter и подписка на события
const EventEmitter = require('events');
const { GROUP } = require('./variant');

const emitter = new EventEmitter();

emitter.on('greet', (name) => {
  console.log('[greet] Привет, ' + name + '!');
});

emitter.on('info', () => {
  console.log('[info] Группа: ' + GROUP);
});

emitter.on('bye', () => {
  console.log('[bye] До свидания!');
});

console.log('=== Демонстрация EventEmitter ===');
emitter.emit('greet', 'Никитос Нос');
emitter.emit('info');
emitter.emit('bye');

// emit() возвращает true, если у события были слушатели, иначе false
console.log('Событие "unknown" без слушателей:', emitter.emit('unknown'));
console.log('Событие "greet" со слушателями:', emitter.emit('greet', 'Никитос Нос'));
