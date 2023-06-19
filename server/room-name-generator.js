const words = [
	"dragon",
	"vampire",
	"wizard",
	"ooze",
	"lord",
	"zombie",
	"mage",
	"goblin",
	"knight",
	"angel",
	"elf",
	"sword",
	"shield",
	"hoard",
	"treasure",
	"pole",
	"manticore",
	"orc",
	"god",
	"temple",
	"ruins",
	"thief",
	"rogue",
	"cleric",
	"paladin",
	"druid",
	"sorcerer",
	"demon",
	"devil"
];

function getRandomValueFromList(list){
	let randomValue = list[Math.floor(Math.random()*list.length)];
	return randomValue;
}

function generateName(){
	let name = getRandomValueFromList(words);
	for (let i = 0; i < 2; i++){
		name = name + "-" + getRandomValueFromList(words);
	};
	return name;
}

module.exports.generateName = generateName;
