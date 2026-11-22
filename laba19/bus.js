// Задание 5: EventBus с приоритетами, wildcard, once-кэшем, метриками и интеграцией os/http
const EventEmitter = require('events');
const http = require('http');
const os = require('os');
const { GROUP } = require('./variant');

class EventBus extends EventEmitter {
  constructor() {
    super();
    this._handlers = new Map(); // event -> [{ listener, priority, once, seq }]
    this._any = [];             // wildcard-слушатели
    this._seq = 0;
    this._metrics = { counts: {}, errors: {}, lastCall: {}, total: 0 };
  }

  _add(event, listener, priority, once) {
    if (typeof listener !== 'function') {
      throw new TypeError('listener должен быть функцией');
    }
    const list = this._handlers.get(event) || [];
    list.push({ listener, priority: priority || 0, once, seq: this._seq++ });
    // приоритет по убыванию, при равенстве - порядок добавления
    list.sort((a, b) => b.priority - a.priority || a.seq - b.seq);
    this._handlers.set(event, list);
    return this;
  }

  on(event, listener, priority = 0) {
    return this._add(event, listener, priority, false);
  }

  addListener(event, listener, priority = 0) {
    return this.on(event, listener, priority);
  }

  once(event, listener, priority = 0) {
    return this._add(event, listener, priority, true);
  }

  off(event, listener) {
    const list = this._handlers.get(event);
    if (!list) return this;
    const idx = list.findIndex((h) => h.listener === listener);
    if (idx !== -1) list.splice(idx, 1);
    if (list.length === 0) this._handlers.delete(event);
    return this;
  }

  removeListener(event, listener) {
    return this.off(event, listener);
  }

  removeAllListeners(event) {
    if (event === undefined) {
      this._handlers.clear();
      this._any = [];
    } else {
      this._handlers.delete(event);
    }
    return this;
  }

  listenerCount(event) {
    const list = this._handlers.get(event);
    return list ? list.length : 0;
  }

  onAny(listener) {
    this._any.push(listener);
    return this;
  }

  offAny(listener) {
    this._any = this._any.filter((l) => l !== listener);
    return this;
  }

  _onListenerError(event, err) {
    this._metrics.errors[event] = (this._metrics.errors[event] || 0) + 1;
    if (event === 'error') {
      console.error('[ERROR] [' + GROUP + '] Ошибка в обработчике error: ' + err.message);
      return;
    }
    if (this.listenerCount('error') > 0) {
      this._dispatch('error', [err, event]);
    } else {
      console.error('[ERROR] [' + GROUP + '] Ошибка в слушателе "' + event + '": ' + err.message);
    }
  }

  _dispatch(event, args) {
    const list = (this._handlers.get(event) || []).slice();
    let called = false;
    for (const h of list) {
      if (h.once) this.off(event, h.listener); // once-кэш: удаляем до вызова
      called = true;
      try {
        h.listener.apply(this, args);
      } catch (err) {
        this._onListenerError(event, err);
      }
    }
    return called;
  }

  emit(event, ...args) {
    const m = this._metrics;
    m.counts[event] = (m.counts[event] || 0) + 1;
    m.total++;
    m.lastCall[event] = new Date().toISOString();

    let called = false;
    for (const any of this._any.slice()) {
      called = true;
      try {
        any.call(this, event, ...args);
      } catch (err) {
        this._onListenerError(event, err);
      }
    }
    if (this._dispatch(event, args)) called = true;
    return called;
  }

  getMetrics() {
    const listeners = {};
    for (const [name, list] of this._handlers) {
      listeners[name] = list.length;
    }
    return {
      group: GROUP,
      events: { ...this._metrics.counts },
      errors: { ...this._metrics.errors },
      total: this._metrics.total,
      lastCall: { ...this._metrics.lastCall },
      listeners,
    };
  }
}

function plural(n, one, few, many) {
  if (n % 10 === 1 && n % 100 !== 11) return n + ' ' + one;
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return n + ' ' + few;
  return n + ' ' + many;
}// ================= Демонстрация =================
const bus = new EventBus();
console.log('=== EventBus (группа ' + GROUP + ') ===');

// --- Приоритеты ---
console.log('--- Приоритеты ---');
bus.on('prio', () => console.log('[priority 0] Низкий приоритет'), 0);
bus.on('prio', () => console.log('[priority 5] Средний приоритет'), 5);
bus.on('prio', () => console.log('[priority 10] Высокий приоритет'), 10);
bus.emit('prio');

// --- Wildcard ---
console.log('--- Wildcard ---');
const logAny = (event, ...args) => {
  console.log('[onAny] Событие "' + event + '" с аргументами: ' + JSON.stringify(args));
};
bus.onAny(logAny);
bus.on('greet', () => {});
bus.emit('greet', 'Иван');
bus.emit('info', GROUP);
bus.offAny(logAny);

// --- Once-кэш ---
console.log('--- Once-кэш ---');
let tickCalls = 0;
let onceCalls = 0;
bus.on('tick', () => console.log('[tick] Вызов ' + ++tickCalls));
bus.once('tick', () => { onceCalls++; });
bus.emit('tick');
bus.emit('tick');
bus.emit('tick');
console.log('once-слушатель вызван: ' + onceCalls + ' раз');

// --- Обработка ошибок ---
console.log('--- Обработка ошибок ---');
// error-слушатель с высоким приоритетом
bus.on('error', (err, event) => {
  console.log('[ERROR] [' + GROUP + '] Ошибка в слушателе "' + event + '": ' + err.message);
}, 100);

let testCalls = 0;
bus.on('test', () => {
  testCalls++;
  if (testCalls === 1) throw new Error('сбой при первом вызове');
});
bus.on('test2', () => {
  throw new Error('сбой в слушателе test2');
});
bus.emit('test');
bus.emit('test');
bus.emit('test2');

// --- Метрики ---
console.log('--- Метрики ---');
const metrics = bus.getMetrics();
for (const [name, count] of Object.entries(metrics.events)) {
  const errs = metrics.errors[name];
  const suffix = errs ? ' (' + plural(errs, 'ошибка', 'ошибки', 'ошибок') + ')' : '';
  console.log(name + ': ' + plural(count, 'вызов', 'вызова', 'вызовов') + suffix);
}
console.log('Всего событий: ' + metrics.total);

// --- Интеграция с os и http ---
bus.on('request', (method, url) => {
  console.log('[http] ' + method + ' ' + url);
});

bus.on('system:stats', (stats) => {
  console.log(
    '[os] Свободно памяти: ' + stats.freeGB + ' ГБ, использовано: ' +
    stats.usedPercent + '%, load(1m): ' + stats.load1
  );
});

function emitSystemStats() {
  const total = os.totalmem();
  const free = os.freemem();
  bus.emit('system:stats', {
    freeGB: (free / 1024 ** 3).toFixed(2),
    usedPercent: (((total - free) / total) * 100).toFixed(1),
    load1: os.loadavg()[0].toFixed(2),
  });
}

emitSystemStats();
const statsTimer = setInterval(emitSystemStats, 10000);

const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  bus.emit('request', req.method, req.url);

  if (req.method === 'GET' && req.url === '/metrics') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(bus.getMetrics(), null, 2));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found. Используйте GET /metrics');
  }
});

server.listen(PORT, () => {
  console.log('\nHTTP-сервер: http://localhost:' + PORT + '/metrics (Ctrl+C для выхода)');
});

process.on('SIGINT', () => {
  clearInterval(statsTimer);
  server.close();
  console.log('\nСервер остановлен.');
  process.exit(0);
});
