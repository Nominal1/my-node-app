// Задание 4: newListener, removeListener, плагины, утечки, async-слушатели
const EventEmitter = require('events');
const { GROUP_LATIN } = require('./variant');

const PREFIX = '[' + GROUP_LATIN + ']';

// --- Система плагинов ---
class PluginManager extends EventEmitter {
  constructor() {
    super();
    this.plugins = new Map();

    // специальные встроенные события
    this.on('newListener', (event, listener) => {
      console.log('[newListener] Добавлен слушатель "' + event + '"');
    });
    this.on('removeListener', (event, listener) => {
      console.log('[removeListener] Удалён слушатель "' + event + '"');
    });
  }

  register(plugin) {
    this.plugins.set(plugin.name, plugin);
    this.emit('plugin:registered', plugin.name);
    for (const [event, handler] of Object.entries(plugin.handlers)) {
      this.on(event, handler);
    }
  }

  unregister(name) {
    const plugin = this.plugins.get(name);
    if (!plugin) return;
    for (const [event, handler] of Object.entries(plugin.handlers)) {
      this.removeListener(event, handler);
    }
    this.plugins.delete(name);
    this.emit('plugin:removed', name);
  }
}

console.log('=== Система плагинов ===');
const manager = new PluginManager();

manager.on('plugin:registered', (name) => console.log('[PLUGIN] Зарегистрирован: ' + name));
manager.on('plugin:removed', (name) => console.log('[PLUGIN] Удалён: ' + name));

manager.register({
  name: 'LoggerPlugin',
  handlers: { log: (msg) => console.log('[LoggerPlugin] ' + msg) },
});
manager.register({
  name: 'AlertPlugin',
  handlers: { alert: (msg) => console.log('[AlertPlugin] ' + msg) },
});

manager.emit('log', 'тестовое сообщение');
manager.unregister('LoggerPlugin');

// --- Утечка памяти ---
console.log('\n=== Демонстрация утечки ===');
const leaky = new EventEmitter();
const handlers = [];

for (let i = 0; i < 10; i++) {
  leaky.on('data', () => {});
}
console.log('Слушателей до:', leaky.listenerCount('data'));

// Node.js предупредит (MaxListenersExceededWarning) при > 10 слушателей на одно событие
for (let i = 0; i < 1000; i++) {
  const h = () => {};
  handlers.push(h);
  leaky.on('data', h);
}
console.log('Слушателей после добавления 1000:', leaky.listenerCount('data'));

// Решение: отписываться от событий, когда слушатель больше не нужен
for (const h of handlers) {
  leaky.removeListener('data', h);
}
console.log('Слушателей после removeListener для 1000:', leaky.listenerCount('data'));

leaky.removeAllListeners('data');
console.log('Слушателей после removeAllListeners:', leaky.listenerCount('data'));

// --- Асинхронные слушатели ---
console.log('\n=== Асинхронные слушатели ===');
const asyncEmitter = new EventEmitter();

asyncEmitter.on('work', async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  console.log(PREFIX + ' async-слушатель завершён через 100ms');
});

asyncEmitter.on('deferred', () => {
  console.log(PREFIX + ' deferred: синхронная часть слушателя');
  setImmediate(() => {
    console.log(PREFIX + ' deferred: отложено через setImmediate');
  });
});

asyncEmitter.emit('work');
console.log(PREFIX + ' emit вызван (не ждёт async-слушатель)');

asyncEmitter.emit('deferred');
console.log(PREFIX + ' emit(deferred) завершён, setImmediate выполнится позже');
