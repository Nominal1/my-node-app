const http = require('http');

const nomer = 6;
let sum = 0;
let znak = 1;

for (let k = 0; k < nomer; k++) {
  const den = 2 * k + 1;
  sum += znak / den;
  znak = -znak;
} 

let pi = 4 * sum;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.write('<h1>Dvornik  Nikita</h1>');
  res.write('478<br>')
  res.write(`Число PI: ${pi}`);
});
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
