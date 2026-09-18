const path = require('path');
const fs = require('fs');
const filepath = path.join(__dirname, 'logs.txt');
const timenow = new Date().toLocaleTimeString();

const stream = fs.createWriteStream(filepath, { flags: 'a', encoding: 'utf8' });

function setupLogger(server){
	server.once('ServerWithPortCreated', (port) => {
		console.log(`🚀Сервер запущен на порту: ${port}`)
		stream.write(`[${timenow}] ServerWithPortCreated: localhost:${port}\n`)
	});
	
	server.once('server:stopped', () => {
		console.log(`Сервер остановлен`);
		stream.write(`[${timenow}] serverclosed: Сервер остановлен\n`)
		process.exit(0);
	});
	
	server.on('📨 Получен запрос:', (url, method) => {
		console.log(`${url} ${method}`);
		console.log("Hello from Event-Driven Server")
	    stream.write(`[${timenow}] z :${url} ${method}\n`)
	});
}

module.exports = { setupLogger }; 
