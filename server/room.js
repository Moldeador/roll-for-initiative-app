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
 
    setState(data){
        this.state = data;
        console.log(`new state: ${this.state}`)
        this.sendStateToRoom();
    }

    sendStateToRoom(){
        this.sendMessageToRoom(JSON.stringify({event: "roomState", data: this.state}));
    }
    
    sendCharactersDataToRoom(){
        for (const webSocket of this.webSockets){
            const charactersLists = this.getOwnedCharactersAndOthersCharacters(webSocket.userUid);
            const message = JSON.stringify({event: "listOfCharacters", data: charactersLists});
            webSocket.send(message);
        }
    }

    getOwnedCharactersAndOthersCharacters(ownUid){
        const charactersList = [];
        for (const [uid, userData] of Object.entries(this.users)){
            const isMe = (uid===ownUid) ? true : false;
            for (const character of userData.characters) {
                character["isMe"] = isMe;
                charactersList.push(character);
            }
        }
        return charactersList;
    }

    generateTurnOrder(){
        if (! this.allPlayersHaveRolled()) return;
        let initiativeRolls = [];
        for (const [uid, user] of Object.entries(this.users)){
            for (const [index, character] of Object.entries(user.characters)){
                let initiativeRoll = Number(character.roll) + Number(character.initiativeModifier);
                initiativeRolls.push([uid, index, initiativeRoll]);
            }
        }
        initiativeRolls.sort((a,b)=>b[2]-a[2]);
        for (const turnOrder in initiativeRolls){
            const uid = initiativeRolls[turnOrder][0];
            const index = initiativeRolls[turnOrder][1];
            this.users[uid].characters[index]["turnOrder"] = Number(turnOrder) + 1; 
        }
        this.state = "turnOrder";
        console.log(`The state now is: ${this.state}`);
        this.sendStateToRoom();
    }

    allPlayersHaveRolled(){
        for (const [uid, user] of Object.entries(this.users)){
            for (const character of user.characters){
                if (character.roll===null) return false;
            }
        }
        return true;
    }

    resetRoom(){
        for (const [uid, user] of Object.entries(this.users)){
            for (const character of user.characters){
                character.resetCharacter();
            }
        }
        this.sendCharactersDataToRoom();
    }

}
module.exports = Room;