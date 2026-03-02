import {ButtonLink} from "./components/Button"
import { LogoutButton } from "./Logout"
import {useState, useEffect} from "react"

import { IsLoggedIn } from "./utils/Utils"

function NavBarUser() {
	const [username, setUsername] = useState('')

	useEffect(() => {
		async function getUserName() {
			const response = await fetch("/api/user", {method: 'GET',} )

			console.log(response)
			if (!response.ok)
				return
			const data = await response.json()
			console.log(data)
			if (data.success === false)
				return
			setUsername(data.userinfo.username)
		}
		getUserName()
	}, [])

	return (
		<div>
			<ButtonLink
				text={username}
				link={"/user/" + username}
			/>
			<LogoutButton/>
		</div>
	)
}

function NavBarLogin() {
	return (
		<div>
			<ButtonLink
				text="Login"
				link="/login"
			/>
			<ButtonLink
				text="Register"
				link="/register"
			/>
		</div>
	)
}

export default function NavBar() {
	const [loggedIn, setLoggedIn] = useState(false)
	
	useEffect(() => {setLoggedIn(IsLoggedIn())}, [])

	const AccountHandle = (loggedIn) => {
		if (loggedIn) {
			console.log("Logged In")
			return <NavBarUser/>;
		} else {
			console.log("Not Logged In")
			return <NavBarLogin/>;
		}
	}

	return (
		<div>
			<ButtonLink text="Home"
				link="/"
			/>
			{AccountHandle(loggedIn)}
		</div>
	)
	// <AccountHandle loggedIn={loggedIn}/>
}
