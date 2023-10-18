const http = require('http');
const url = require('url');
const nameGenerator = require('./room-name-generator.js');
const Room = require('./room.js');
const Character = require('./character.js');
const User = require('./user.js');
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
	ws.send(JSON.stringify({event: "roomState", data: rooms[roomName].state}))
	ws.on("message", function(msg) {
		const receivedMessage = JSON.parse(msg.toString());
		if (receivedMessage.event === "userData"){

			const userData = receivedMessage.data;
			const uid = userData.uid;

			if (! rooms[roomName].adminId) rooms[roomName].adminId = uid;
			ws.userUid = uid;
			rooms[roomName].deleteInactiveUsers();
			if (rooms[roomName].adminId == uid) ws.send(JSON.stringify({event: "youAreAdmin"}));//TODO: return all user data, including roll

			const charactersData = userData.characters;

			if (uid in rooms[roomName].users){
				rooms[roomName].users[uid].updateCharacters(charactersData);
			} else {
				rooms[roomName].users[uid] = new User(charactersData);
			}
			console.log(rooms[roomName].users[uid]);
			
			rooms[roomName].sendCharactersDataToRoom();
		
		} else if (receivedMessage.event === "roomState"){
			const newState = receivedMessage.data;
			if (rooms[roomName].adminId == ws.userUid){
				if (newState === "initiativeRoll"){
					rooms[roomName].setState(newState);
				} else if (newState === "waitingForDM"){
					rooms[roomName].resetRoom();
					rooms[roomName].setState(newState);
				}
			} 
		} else if (receivedMessage.event === "roll"){
			if (rooms[roomName].state === "initiativeRoll"){
				rooms[roomName].users[ws.userUid].roll();
				rooms[roomName].generateTurnOrder();
				rooms[roomName].sendCharactersDataToRoom();
			}
		}
		
	})
	ws.on("close", function(){
		rooms[roomName].deleteSocketFromRoom(ws);
		rooms[roomName].deleteInactiveUsers();
		rooms[roomName].sendCharactersDataToRoom();
	})
});
