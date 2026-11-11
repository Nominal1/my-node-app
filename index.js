const http = require('http');
const EventEmitter = require('events');
const fs = require('fs');
const { setupLogger } = require('./logger');

class AppServer extends EventEmitter{
	 start(port){
		this.server = http.createServer( (req, res) => {
		setTimeout(() =>{
		this.emit('z', req.url, req.method);
		}, 2000 );
		
	   
				  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
				  res.write('<h1>Dvornik  Nikita</h1>');
				  res.write('478<br>');
				  
				});
	
		this.server.listen(port, () => {
			this.emit('ServerWithPortCreated', port);
		});
	}	
	stop(){
		setTimeout(() => {		            
		            this.server.close(() => {
		                this.emit('server:stopped');
		            });
		        }, 60000);
	}
}

const server = new AppServer();
setupLogger(server);

server.once('ServerWithPortCreated', (port) => {
	console.log(`🚀Сервер запущен на порту: ${port}`)
});
server.once('server:stopped', () => {
	console.log(`🛑 Сервер остановлен`);
	process.exit(0);
});

server.on('z', (url, method) => {
	console.log(`${url} ${method}`);
	console.log("Hello from Event-Driven Server")
});

server.start(8090)
server.stop()
