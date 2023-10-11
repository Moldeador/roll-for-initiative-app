class Room{

    constructor(name){
        this.name = name;
        this.webSockets = [];
        this.users = {};
        this.adminId = null;
    }
}
module.exports = Room;