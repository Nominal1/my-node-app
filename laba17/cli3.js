const { Command } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const cliProgress = require('cli-progress');
const fs = require('fs');
const program = new Command();

// --- Обработка ошибок (Задание 5) ---
process.on('uncaughtException', (e) => {
  if (process.env.NODE_ENV === 'development') console.error(e.stack);
  else console.error(chalk.red(`✖ Ошибка: ${e.message}`));
  process.exit(1);
});

// --- Настройка цветов (Задание 4) ---
const useColor = process.stdout.isTTY;
const c = {
  ok: (s) => (useColor ? chalk.green(s) : s),
  err: (s) => (useColor ? chalk.red(s) : s),
  warn: (s) => (useColor ? chalk.yellow(s) : s),
  info: (s) => (useColor ? chalk.blue(s) : s),
};

program.name('my-cli').version('1.0.0');

// --- Задание 4: Process с прогресс-баром ---
program
  .command('process')
  .option('--files <files...>')
  .action(async (opts) => {
    const files = opts.files || [];
    const found = [];
    const missing = [];

    const spinner = process.stderr.isTTY ? ora('Проверка файлов...').start() : null;
    for (const f of files) {
      if (fs.existsSync(f)) found.push(f);
      else missing.push(f);
    }
    if (spinner) spinner.succeed(`Файлы найдены (${found.length} шт.)`);

    if (found.length > 1 && process.stderr.isTTY) {
      const bar = new cliProgress.SingleBar(
        { format: '{bar} {percentage}% | {value}/{total} | ETA: {eta_formatted}' },
        cliProgress.Presets.shades_classic
      );
      bar.start(found.length, 0);
      for (let i = 0; i < found.length; i++) {
        await new Promise((r) => setTimeout(r, 150));
        bar.update(i + 1);
      }
      bar.stop();
    }

    for (const f of missing) console.error(c.err(`✖ Файл ${f} не найден`));
    for (const f of found) console.log(c.ok(`✔ Файл ${f} обработан`));
    if (missing.length) console.error(c.warn(`⚠ Пропущено ${missing.length} файл(ов)`));

    process.stdout.write(JSON.stringify({ processed: found }, null, 2) + '\n');
    process.exit(missing.length ? 1 : 0);
  });

// --- Задание 5: Архитектура ---
program
  .command('build')
  .option('--config <path>', 'путь к конфигу', 'config.json')
  .action((opts) => {
    c.info('Сборка проекта...');
    try {
      if (!fs.existsSync(opts.config)) throw new Error('файл конфигурации не найден');
      c.ok('Сборка завершена за 2.3s');
      c.ok('Результат: dist/my-app.js');
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        throw e; // Вызовет uncaughtException со стектрейсом
      } else {
        console.error(c.err(`Ошибка: ${e.message}`));
        console.error(c.err('Укажите путь через --config'));
        process.exit(1);
      }
    }
  });

program
  .command('test')
  .action(() => {
    c.info('Запуск тестов...');
    c.ok('Пройдено: 15/15 тестов');
    c.ok('Покрытие: 87%');
  });

program.parse();
