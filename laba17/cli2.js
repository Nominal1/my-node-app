const { Command } = require('commander');
const inquirer = require('inquirer');
const program = new Command();

program.name('my-cli');

program
  .command('init')
  .option('--name <name>')
  .option('--type <type>')
  .option('--typescript')
  .option('--prettier')
  .option('--git')
  .option('--no-interactive', 'отключить интерактивный режим')
  .action(async (opts) => {
    const interactive = opts.interactive !== false && process.stdin.isTTY;

    let answers = {
      name: opts.name,
      type: opts.type,
      options: [],
      git: opts.git,
    };
    if (opts.typescript) answers.options.push('TypeScript');
    if (opts.prettier) answers.options.push('Prettier');

    if (!interactive) {
      if (!answers.name || !answers.type) {
        console.error('Ошибка: в неинтерактивном режиме необходимо указать --name и --type');
        process.exit(1);
      }
    } else {
      if (!answers.name) {
        const a = await inquirer.prompt([{ type: 'input', name: 'name', message: 'Введите название проекта:' }]);
        answers.name = a.name;
      }
      if (!answers.type) {
        const a = await inquirer.prompt([{
            type: 'list', name: 'type', message: 'Выберите тип проекта:',
            choices: ['Web-приложение', 'CLI-утилита', 'Библиотека', 'Микросервис'],
        }]);
        answers.type = a.type;
      }
      if (!answers.options.length) {
        const a = await inquirer.prompt([{
            type: 'checkbox', name: 'options', message: 'Выберите дополнительные опции:',
            choices: ['TypeScript', 'ESLint', 'Prettier', 'Jest'],
        }]);
        answers.options = a.options;
      }
      if (answers.git === undefined) {
        const a = await inquirer.prompt([{ type: 'confirm', name: 'git', message: 'Использовать Git?', default: true }]);
        answers.git = a.git;
      }
      const a = await inquirer.prompt([{ type: 'password', name: 'token', message: 'Введите токен доступа:', mask: '*' }]);
    }

    console.log(`✓ Проект "${answers.name}" успешно инициализирован!`);
    console.log(`Тип: ${answers.type}`);
    console.log(`Опции: ${answers.options.join(', ') || '—'}`);
    console.log(`Git: ${answers.git ? 'да' : 'нет'}`);
  });

program.parse();
