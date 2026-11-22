	// Задание 2: on, once, addListener и управление подписками
const EventEmitter = require('events');
const { GROUP } = require('./variant');

function times(n) {
  if (n % 10 === 1 && n % 100 !== 11) return n + ' раз';
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return n + ' раза';
  return n + ' раз';
}

// --- 1. Сравнение on и once ---
console.log('=== Сравнение on и once ===');
const emitter = new EventEmitter();
let onCalls = 0;
let onceCalls = 0;

emitter.on('tick', (n) => {
  onCalls++;
  console.log('[tick #' + n + '] on-слушатель');
});

emitter.once('tick', (n) => {
  onceCalls++;
  console.log('[tick #' + n + '] once-слушатель');
});

for (let i = 1; i <= 3; i++) {
  emitter.emit('tick', i);
}
console.log('on-слушатель вызван: ' + times(onCalls));
console.log('once-слушатель вызван: ' + times(onceCalls));

// --- 2. Управление подписками ---
console.log('\n=== Управление подписками ===');
const manager = new EventEmitter();
function listenerA() {}
function listenerB() {}
function listenerC() {}

manager.on('task', listenerA);
manager.addListener('task', listenerB); // addListener - синоним on
manager.on('task', listenerC);

console.log('Слушателей до удаления:', manager.listenerCount('task'));
console.log('Массив слушателей:', manager.listeners('task'));

manager.removeListener('task', listenerB);
console.log('Слушателей после удаления одного:', manager.listenerCount('task'));

manager.removeAllListeners('task');
console.log('Слушателей после removeAllListeners:', manager.listenerCount('task'));

// --- 3. Порядок вызова ---
console.log('\n=== Порядок вызова ===');
const order = new EventEmitter();
order.on('step', () => console.log('1. Первый слушатель (группа ' + GROUP + ')'));
order.on('step', () => console.log('2. Второй слушатель'));
order.on('step', () => console.log('3. Третий слушатель'));
order.emit('step');
