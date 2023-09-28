const http = require('http');
const url = require('url');
const mysql = require('mysql2');
const nameGenerator = require('./room-name-generator.js');



let rooms = [];


const server = http.createServer(function (req, res) {
	var parsedUrl = url.parse(req.url, true);
	if (req.method === "GET"){
		if (parsedUrl.pathname === '/rooms'){
		
			res.writeHead(200, {
				'Content-Type': 'text/plain',
				'Access-Control-Allow-Origin': '*'
			});
			res.write(JSON.stringify(rooms));
			res.end();

		} else if (parsedUrl.pathname.startsWith('/rooms/')){
			res.writeHead(200, {
				'Content-Type': 'text/plain',
				'Access-Control-Allow-Origin': '*'
			});
			const pathParts = parsedUrl.pathname.split("/");
			const nameOfRoom = pathParts[1];
			if ( ! rooms.includes(nameOfRoom) ){
				res.end(`{"error": "${http.STATUS_CODES[404]}"}`);
			} else {
				res.write(nameOfRoom);
				res.end();
			}
		
		}
	} else if (req.method === "POST") {
		if (parsedUrl.pathname === '/rooms'){
			res.writeHead(201, {
				'Content-Type': 'text/plain',
				'Access-Control-Allow-Origin': '*'
			});
			

			let name = nameGenerator.generateName();
			while (rooms.includes(name)){
				name = nameGenerator.generateName();
			}
			rooms.push(name)
			res.write(name);
			res.end();
		}

	} else {
		res.end(`{"error": "${http.STATUS_CODES[405]}"}`)	
	}
});

server.on('connection', function (socket) {
	console.log('New connection');
});

server.listen(3000);

console.log('Listening on port 3000...');
