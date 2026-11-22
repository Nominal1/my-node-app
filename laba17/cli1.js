const { Command } = require('commander');
const program = new Command();

// ЗАДАНИЕ 1
const args = process.argv.slice(2);

// Если запущен без аргументов или с --help, и это не команда для commander
if (args.length === 0) {
  console.log(`Использование: my-cli <команда> [аргументы]

Доступные команды:
  greet <имя>  - поприветствовать пользователя
  info         - вывести информацию о группе

  (Для Задания 2 используйте: node cli1.js generate --help)`);
  process.exit(0);
}

if (args[0] === 'greet') {
  const name = args[1];
  if (!name) {
    console.error('Ошибка: укажите имя. Пример: node cli1.js greet "Иван"');
    process.exit(1);
  }
  console.log(`Привет, ${name}! Добро пожаловать в CLI-приложение группы ББМО-01-23.`);
  process.exit(0);
}

if (args[0] === 'info') {
  console.log('Группа: ББМО-01-23');
  console.log('Студент: Иванов Иван Иванович'); // Замените на свое ФИО
  console.log('Лабораторная работа: №17');
  console.log('Дата: 2024-01-15');
  process.exit(0);
}

if (args[0] === 'unknown') {
  console.error(`Ошибка: неизвестная команда "${args[0]}"`);
  console.error('Для справки используйте: my-cli --help');
  process.exit(1);
}

// ЗАДАНИЕ 2 
const ALLOWED_TYPES = ['html', 'pdf', 'json', 'csv'];

program
  .name('my-cli')
  .description('CLI-приложение для лабораторной работы №17')
  .version('1.0.0')
  .option('-v, --verbose', 'подробный вывод');

program
  .command('generate')
  .description('сгенерировать отчёт')
  .option('-t, --type <type>', 'тип отчёта', 'html')
  .option('-o, --output <path>', 'путь для сохранения')
  .option('-f, --force', 'перезаписать существующий файл')
  .option('--dry-run', 'показать что будет сделано без выполнения')
  .action((opts) => {
    const globalOpts = program.opts();
    const type = opts.type;

    if (!ALLOWED_TYPES.includes(type)) {
      console.error(`Ошибка: недопустимый тип отчёта "${type}".`);
      console.error(`Допустимые значения: ${ALLOWED_TYPES.join(', ')}`);
      process.exit(1);
    }

    const output = opts.output || `./output.${type}`;

    if (opts.dryRun) {
      console.log(`[DRY-RUN] Будет сгенерирован отчёт типа: ${type}`);
      console.log(`[DRY-RUN] Файл будет сохранён в: ${output}`);
      console.log('[DRY-RUN] Действия не выполнены (режим проверки)');
      return;
    }

    if (globalOpts.verbose) {
      console.log('[VERBOSE] Запуск генерации отчёта...');
      console.log(`[VERBOSE] Тип отчёта: ${type}`);
      console.log(`[VERBOSE] Путь сохранения: ${output}`);
    }
    console.log(`Отчёт успешно сгенерирован: ${output}`);
  });

// Запускаем commander, только если есть флаги, чтобы не конфликтовать с Заданием 1
if (args[0] === 'generate' || args[0] === '--help' || args[0] === '--version' || args[0] === '-v') {
  program.parse(process.argv);
}
