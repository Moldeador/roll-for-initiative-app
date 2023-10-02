const http = require('http');
const url = require('url');
const nameGenerator = require('./room-name-generator.js');
//Websockets
const ws =require('ws');

const wss = new ws.WebSocketServer({ noServer: true });


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

server.on('upgrade', function(request, socket, head){
	wss.handleUpgrade(request, socket, head, function(ws){
		wss.emit('connection', ws, "santi");
	});
});


server.listen(3000);

console.log('Listening on port 3000...');





wss.on("connection", function connection(ws, roomName) {
	ws.on("message", function message(data) {
		console.log("received: %s", data);
	});
	ws.send("youve joined room " + roomName);
	setInterval(async ()=>{
		ws.send("hello");
	}, 1000);
});
