const Character = require('./character.js');
class User{
    constructor(charactersData){
        this.characters = [];
        for (const data of charactersData){
            this.characters.push(new Character(data.characterName, data.initiativeModifier));
        }
    }
    updateCharacters(charactersData){
        for (const index in charactersData){
            const data = charactersData[index];
            if (index in this.characters) {
                this.characters[index].update(data.characterName, data.initiativeModifier);
            } else {
                this.characters.push(new Character(data.characterName, data.initiativeModifier));
            }
        }
        this.characters.splice(charactersData.length);
    }
    roll(){
        for (const character of this.characters) {
            character.rollDie();
        }
    }
}

module.exports = User;