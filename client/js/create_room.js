async function createNewRoom(idToStoreNameOfNewRoom){
	let response = await fetch("http://localhost:3000/createRoom");
	let data = await response.text();
	console.log(response);
	document.getElementById(idToStoreNameOfNewRoom).innerHTML = data;
}
