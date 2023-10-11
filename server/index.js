const http = require('http');
const url = require('url');
const nameGenerator = require('./room-name-generator.js');
const Room = require('./room.js');
//Websockets
const ws =require('ws');

const wss = new ws.WebSocketServer({ noServer: true });


let rooms = {};

const server = http.createServer(function (req, res) {
	var parsedUrl = url.parse(req.url, true);
	if (req.method === "GET"){
		if (parsedUrl.pathname === '/rooms'){
		
			res.writeHead(200, {
				'Content-Type': 'text/plain',
				'Access-Control-Allow-Origin': '*'
			});
			res.write(JSON.stringify(Object.keys(rooms)));
			res.end();

		} else if (parsedUrl.pathname.startsWith('/rooms/')){
			res.writeHead(200, {
				'Content-Type': 'text/plain',
				'Access-Control-Allow-Origin': '*'
			});
			const pathParts = parsedUrl.pathname.split("/");
			const nameOfRoom = pathParts[2];
			if ( ! (nameOfRoom in rooms) ){
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
			while (name in rooms){
				name = nameGenerator.generateName();
			}
			rooms[name] = new Room(name);
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
	const { pathname } = url.parse(request.url);
	const pathParts = pathname.split("/");
	const mainPage = pathParts[1];
	const slug = pathParts[2];

	if (mainPage === 'rooms') {
		roomName = slug;
		if(roomName in rooms){
			wss.handleUpgrade(request, socket, head, function (ws) {
				rooms[roomName].webSockets.push(ws);
				console.log(rooms);
				wss.emit('connection', ws, slug);
			});
		} else {
			socket.destroy();
		}
	} else {
		socket.destroy();
	}
});


server.listen(3000);

console.log('Listening on port 3000...');





wss.on("connection", function connection(ws, roomName) {
	rooms[roomName].sendStateToRoom();
	ws.on("message", function(msg) {
		const receivedMessage = JSON.parse(msg.toString());
		if (receivedMessage.event === "userData"){
			const userData = receivedMessage.data;
			const uid = userData.uid;
			const characterName = userData.characterName;
			const initiativeModifier = userData.initiativeModifier;
			rooms[roomName].users[uid] = {characterName, initiativeModifier}
			if (! rooms[roomName].adminId) rooms[roomName].adminId = uid;
			ws.userUid = uid;
			rooms[roomName].deleteInactiveUsers();
			console.log(rooms);
			console.log(rooms[roomName].users[uid]);
			console.log(rooms[roomName].webSockets);
			//send a message you are the admin
			rooms[roomName].sendMessageToRoom(JSON.stringify({event: "listOfUsers", data: rooms[roomName].getListOfUsers()}));
		} else if (receivedMessage.event === "roomState"){
			rooms[roomName].setState(receivedMessage.data);
		}
		
	})
	ws.on("close", function(){
		rooms[roomName].deleteSocketFromRoom(ws);
		rooms[roomName].deleteInactiveUsers();
		rooms[roomName].sendMessageToRoom("a player has left the room: " + roomName);
	})
});
