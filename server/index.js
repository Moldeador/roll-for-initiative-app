const http = require('http');
const url = require('url');
const mysql = require('mysql2');
const nameGenerator = require('./room-name-generator.js');



let rooms = [];


const server = http.createServer(function (req, res) {
	var parsedUrl = url.parse(req.url, true);
	if (parsedUrl.pathname === '/createRoom'){
		res.writeHead(200, {
			'Content-Type': 'text/plain',
			'Access-Control-Allow-Origin': 'http://localhost:8000'
		});
		

		let name = nameGenerator.generateName();
		while (rooms.includes(name)){
			let name = nameGenerator.generateName();
		}
		rooms.push(name)
		res.write(name);
		res.end();
	}
	if (parsedUrl.pathname === '/list_of_rooms'){
	
		res.writeHead(200, {
			'Content-Type': 'text/plain',
			'Access-Control-Allow-Origin': 'http://localhost:8000'
		});
		res.write(JSON.stringify(rooms));
		res.end();

	}
});

server.on('connection', function (socket) {
	console.log('New connection');
});

server.listen(3000);

console.log('Listening on port 3000...');
