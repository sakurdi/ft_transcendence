async function press() {
	let username = document.getElementById("username").value
	let email = document.getElementById("email").value
	let password1 = document.getElementById("password_1").value
	let password2 = document.getElementById("password_2").value
	if (password1 === password2) {
		console.log("Password match")
		try {
			const response = await fetch('https://localhost:1043/api/register', {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					'username': username,
					'Email': email,
					'Password': password1,
				})
			})
			if (!response.ok) {https://localhost:1043/api/register
				console.log("No ok")
			}
		}
		catch (error) {

		}
	}
	console.log(username, password1, password2)
	document.getElementById('result').innerText = 'Pressed'
}
