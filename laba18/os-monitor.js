// Задание 4: мониторинг системы в реальном времени
const os = require('os');
const fs = require('fs');
const path = require('path');
const { GROUP } = require('./variant');
const { getOsInfo } = require('./os-info');
const { getCpuInfo, getMemoryInfo, getLoadAvg } = require('./os-resources');
const { getNetworkInfo, getUserInfo, maskMac } = require('./os-netweork');

const INTERVAL_MS = 2000;
const LOG_FILE = path.join(__dirname, 'monitor.log');

// --- первичный "слепок" системы ---
function collectSnapshot() {
  const { list, primary } = getNetworkInfo();
  return {
    timestamp: new Date().toISOString(),
    group: GROUP,
    system: getOsInfo(),
    cpu: getCpuInfo(),
    memory: getMemoryInfo(),
    loadavg: os.platform() === 'win32' ? null : getLoadAvg(),
    network: {
      interfaces: list.map((i) => ({ ...i, mac: maskMac(i.mac) })),
      primary: primary ? `${primary.name} (${primary.ipv4})` : null,
    },
    user: getUserInfo(),
  };
}

// --- расчёт загрузки CPU по двум замерам os.cpus() ---
function takeCpuTimes() {
  return os.cpus().map((c) => ({ ...c.times }));
}

function calcCpuLoad(prev, curr) {
  let busyDiff = 0;
  let totalDiff = 0;
  for (let i = 0; i < curr.length; i++) {
    const p = prev[i];
    const c = curr[i];
    const idle = c.idle - p.idle;
    const total =
      c.user - p.user + (c.nice - p.nice) + (c.sys - p.sys) +
      (c.irq - p.irq) + idle;
    totalDiff += total;
    busyDiff += total - idle;
  }
  return totalDiff === 0 ? 0 : (busyDiff / totalDiff) * 100;
}

// --- логирование ---
function pad(n) {
  return String(n).padStart(2, '0');
}

function timestamp() {
  const d = new Date();
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}

function logWarning(text) {
  fs.appendFileSync(LOG_FILE, `[${timestamp()}] [${GROUP}] Предупреждение: ${text}\n`);
}

// --- основной цикл ---
function main() {
  const snapshot = collectSnapshot();
  console.log('=== Первичный сбор данных ===');
  console.log(JSON.stringify(snapshot, null, 2));
  console.log();
  console.log(`Мониторинг (группа ${GROUP}). Ctrl+C для выхода.`);

  let prevTimes = takeCpuTimes();
  let warnings = 0;

  const timer = setInterval(() => {
    const currTimes = takeCpuTimes();
    const cpuLoad = calcCpuLoad(prevTimes, currTimes);
    prevTimes = currTimes;

    const mem = getMemoryInfo();
    let mark = '';
    const issues = [];

    if (cpuLoad > 80) {
      mark = ' ⚠️⚠️';
      issues.push(`CPU критично: ${cpuLoad.toFixed(1)}%`);
    } else if (cpuLoad > 50) {
      mark = ' ⚠️';
      issues.push(`CPU повышена: ${cpuLoad.toFixed(1)}%`);
    }
    if (mem.freePercent < 10) {
      mark += ' ⚠️';
      issues.push(`мало свободной памяти: ${mem.freePercent.toFixed(1)}%`);
    }

    if (issues.length) {
      warnings++;
      logWarning(issues.join('; '));
    }

    const line =
      `CPU: ${cpuLoad.toFixed(1)}% | RAM: ${mem.usedPercent.toFixed(1)}% ` +
      `(${mem.freeGB.toFixed(2)} ГБ свободно)${mark}`;
    process.stdout.write('\r' + line.padEnd(80));
  }, INTERVAL_MS);

  process.on('SIGINT', () => {
    clearInterval(timer);
    console.log(`\nМониторинг остановлен. Предупреждений: ${warnings}`);
    process.exit(0);
  });
}

main();
