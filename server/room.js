class Room{

    constructor(name){
        this.name = name;
        this.webSockets = [];
        this.users = {};
        this.adminId = null;
        this.state = "WaitingForDM";
    }

    sendMessageToRoom(message){
        for (const webSocket of this.webSockets){
            webSocket.send(message);
        }
    }

    deleteSocketFromRoom(socket){
        const index = this.webSockets.indexOf(socket);
        this.webSockets.splice(index, 1);
    }

    deleteInactiveUsers(){
        const activeUserUids = new Set();
        for (const webSocket of this.webSockets){
            if (webSocket.userUid) activeUserUids.add(webSocket.userUid);
        }
        const usersToDelete = [];
        for (const uid in this.users){
            if (! activeUserUids.has(uid)) usersToDelete.push(uid);
        }
        for (const uid of usersToDelete){
            delete this.users[uid];
        }
    }

    getListOfUsers(){
        const dataToSendToClient = [];
        for (const [uid, userData] of Object.entries(this.users)){
            dataToSendToClient.push(userData);
        }
        return dataToSendToClient;
    }
    
    setState(data){
        this.state = data;
        this.sendStateToRoom();
    }

    sendStateToRoom(){
        this.sendMessageToRoom(JSON.stringify({event: "roomState", data: this.state}));
    }

}
module.exports = Room;