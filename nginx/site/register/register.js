function press() {
	let username = document.getElementById("username").value
	let email = document.getElementById("email").value
	let password1 = document.getElementById("password_1").value
	let password2 = document.getElementById("password_2").value
	if (password1 === password2) {
		console.log("Password match")
		const response = fetch('https://localhost:1043/api/register', {
			mode: 'no-cors',
			method: 'POST',
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				'username': username,
				'Email': email,
				'Password': password1,
			})
		})
		if (!response.Ok) {
			console.log("No ok")
			return
		}
	}
	console.log(username, password1, password2)
	return username
}
