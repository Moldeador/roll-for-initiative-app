class Room{

    constructor(name){
        this.name = name;
        this.webSockets = [];
        this.users = {};
        this.adminId = null;
        this.state = "waitingForDM";
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
    
    sendUsersDataToRoom(){
        this.sendMessageToRoom(JSON.stringify({event: "listOfUsers", data: this.getListOfUsers()}));

    }

    generateTurnOrder(){
        if (! this.allPlayersHaveRolled()) return;
        let initiativeRolls = [];
        for (const [uid, user] of Object.entries(this.users)){
            let initiativeRoll = Number(user.roll) + Number(user.initiativeModifier);
            initiativeRolls.push([uid, initiativeRoll]);
        }
        initiativeRolls.sort((a,b)=>b[1]-a[1]);
        for (const turnOrder in initiativeRolls){
            const uid = initiativeRolls[turnOrder][0];
            this.users[uid]["turnOrder"] = Number(turnOrder) + 1; 
        }
        console.log(this.users);
        this.state = "turnOrder";
        this.sendStateToRoom();
        this.sendUsersDataToRoom();


    }

    allPlayersHaveRolled(){
        for (const [uid, user] of Object.entries(this.users)){
            if (user.roll===null) return false;
        }
        return true;
    }

}
module.exports = Room;