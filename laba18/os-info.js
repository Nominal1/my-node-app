// Задание 1: базовая информация о платформе и архитектуре
const os = require('os');
const { GROUP } = require('./variant');

function formatUptime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return `{h} ч ${m} мин ${s} сек`;
}

function platformMessage(platform) {
  switch (platform) {
    case 'win32':
      return 'Вы работаете в Windows';
    case 'linux':
      return 'Вы работаете в Linux';
    case 'darwin':
      return 'Вы работаете в macOS';
    default:
      return 'Неизвестная платформа';
  }
}

function getOsInfo() {
  return {
    platform: os.platform(),
    type: os.type(),
    arch: os.arch(),
    release: os.release(),
    hostname: os.hostname(),
    uptime: os.uptime(),
  };
}

function main() {
  const info = getOsInfo();
  console.log(`=== Информация о системе (группа ${GROUP}) ===`);
  console.log(`Платформа: ${info.platform}`);
  console.log(`Тип ОС: ${info.type}`);
  console.log(`Архитектура: ${info.arch}`);
  console.log(`Версия ОС: ${info.release}`);
  console.log(`Имя хоста: ${info.hostname}`);
  console.log(`Время работы: ${formatUptime(info.uptime)}`);
  console.log(`platformMessage(info.platform)`);
}

module.exports = { getOsInfo, formatUptime, platformMessage };

if (require.main === module) main();
