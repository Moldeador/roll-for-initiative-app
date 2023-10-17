class Character{
    constructor(characterName, initiativeModifier){
        this.characterName = characterName;
        this.initiativeModifier = initiativeModifier;
        this.roll = null;
        this.turnOrder = null;
    }
    update(characterName, initiativeModifier){
        this.characterName = characterName;
        this.initiativeModifier = initiativeModifier;
    }
    rollDie(){
        if (this.roll===null){
            this.roll = Math.floor(Math.random() * 20 + 1);
        }
    }
}

module.exports = Character;