// Задание 3: сетевые интерфейсы и информация о пользователе
const os = require('os');
const { GROUP } = require('./variant');

// AA:BB:CC:DD:EE:FF -> AA:BB:CC:::
function maskMac(mac) {
  if (!mac) return 'н/д';
  const parts = mac.toUpperCase().split(':');
  return parts.map((p, i) => (i < 3 ? p : '')).join(':');
}

function getNetworkInfo() {
  const ifaces = os.networkInterfaces();
  const list = [];
  let primary = null;

  for (const [name, addrs] of Object.entries(ifaces)) {
    const entry = { name, ipv4: null, ipv6: null, mac: null, internal: false };
    for (const a of addrs || []) {
      entry.mac = a.mac;
      entry.internal = a.internal;
      // в разных версиях Node family — строка 'IPv4' или число 4
      if (a.family === 'IPv4' ||  a.family === 4) entry.ipv4 = a.address;
      if (a.family === 'IPv6' ||  a.family === 6) entry.ipv6 = a.address;
    }
    list.push(entry);
    if (!primary && entry.ipv4 && !entry.internal) primary = entry;
  }
  return { list, primary };
}

function getUserInfo() {
  const u = os.userInfo();
  const isUnix = u.uid !== -1;
  return {
    username: u.username,
    uid: u.uid,
    gid: u.gid,
    homedir: u.homedir ||  os.homedir(),
    shell: u.shell,
    isUnix,
    isRoot: u.uid === 0 ||  u.username.toLowerCase() === 'root',
  };
}

function main() {
  const { list, primary } = getNetworkInfo();

  console.log('=== Сетевые интерфейсы ===');
  for (const i of list) {
    console.log(`Интерфейс: ${i.name}`);
    console.log(`  IPv4: ${i.ipv4 || 'нет'}`);
    console.log(`  IPv6: ${i.ipv6 || 'нет'}`);
    console.log(`  MAC: ${maskMac(i.mac)}`);
    console.log(`  Внутренний: ${i.internal ? 'да' : 'нет'}`);
  }
  console.log(`Всего интерфейсов: ${list.length}`);
  console.log(
    primary
      ? `Основной интерфейс: ${primary.name} (${primary.ipv4})`
      : 'Основной интерфейс: не найден'
  );

  const u = getUserInfo();
  console.log('\n=== Информация о пользователе ===');
  console.log(`Имя пользователя: ${u.username}`);
  console.log(`UID: ${u.isUnix ? u.uid : 'недоступно в Windows'}`);
  console.log(`GID: ${u.isUnix ? u.gid : 'недоступно в Windows'}`);
  console.log(`Домашняя директория: ${u.homedir}`);
  console.log(`Оболочка: ${u.shell || 'недоступно'}`);
  console.log(`Группа: ${GROUP}`);
  console.log(`Проверка root: ${u.isRoot ? 'да' : 'нет'}`);
  if (u.isRoot) {
    console.log('⚠️ Скрипт запущен от имени root — для группы это недопустимо!');
  }
}

module.exports = { maskMac, getNetworkInfo, getUserInfo };

if (require.main === module) main();
