// Задание 2: информация о процессоре и памяти
const os = require('os');
const { GROUP } = require('./variant');

const BYTES_IN_GB = 1024 ** 3;
const toGB = (bytes) => bytes / BYTES_IN_GB;

function getCpuInfo() {
  const cpus = os.cpus();
  const speeds = cpus.map((c) => c.speed);
  const avgSpeed = speeds.length
    ? speeds.reduce((a, b) => a + b, 0) / speeds.length
    : 0;
  return {
    count: cpus.length,
    model: cpus.length ? cpus[0].model : 'неизвестно',
    speeds,
    avgSpeed,
  };
}

function getMemoryInfo() {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  return {
    totalGB: toGB(total),
    freeGB: toGB(free),
    usedGB: toGB(used),
    usedPercent: (used / total) * 100,
    freePercent: (free / total) * 100,
  };
}

function getLoadAvg() {
  return os.loadavg();
}

function main() {
  const cpu = getCpuInfo();
  const mem = getMemoryInfo();

  console.log('=== Информация о процессоре ===');
  console.log(`Количество логических ядер: ${cpu.count}`);
  console.log(`Модель процессора: ${cpu.model}`);
  cpu.speeds.forEach((s, i) => console.log(`  Ядро ${i}: ${s} МГц`));
  console.log(`Средняя частота: ${Math.round(cpu.avgSpeed)} МГц`);

  console.log('\n=== Информация о памяти ===');
  console.log(`Общий объём: ${mem.totalGB.toFixed(2)} ГБ`);
  console.log(`Свободно: ${mem.freeGB.toFixed(2)} ГБ`);
  console.log(
   ` Использовано: ${mem.usedGB.toFixed(2)} ГБ (${mem.usedPercent.toFixed(1)}%)
  `);

  console.log('\n=== Средняя загрузка системы ===');
  if (os.platform() === 'win32') {
    console.log('Недоступно в Windows (os.loadavg() возвращает [0, 0, 0])');
  } else {
    const [l1, l5, l15] = getLoadAvg();
    console.log(
      `1 мин: ${l1.toFixed(2)} | 5 мин: ${l5.toFixed(2)} | 15 мин: ${l15.toFixed(2)}
    `);
  }

  console.log(`\nГруппа: ${GROUP}`);
  if (mem.freePercent < 20) {
    console.log(
     ` ⚠️ ПРЕДУПРЕЖДЕНИЕ: свободной памяти меньше 20% (${mem.freePercent.toFixed(1)}%)
    `);
  } else {
    console.log('Память в норме');
  }
}

module.exports = { getCpuInfo, getMemoryInfo, getLoadAvg };

if (require.main === module) main();
