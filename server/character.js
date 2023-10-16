class Character{
    constructor(characterName, initiativeModifier){
        this.characterName = characterName;
        this.initiativeModifier = initiativeModifier;
        this.roll = null;
        this.turnOrder = null;
    }
}

module.exports = Character;