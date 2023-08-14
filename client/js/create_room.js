async function createNewRoom(){
	let response = await fetch("http://localhost:3000/rooms", {method: "POST"});
	let data = await response.text();
	location.href = `./room.html?name=${data}`;
}
