import {ButtonLink} from "./components/Button"
import { LogoutButton } from "./Logout"
import {useState, useEffect} from "react"
import useAuth from "./AuthProvider"


import styles from "./NavBar.module.css"

function NavBarUser() {
	const userHandle = useAuth()
	const user = userHandle.user

	return (
		<>
			<ButtonLink
				text={user.username}
				link={"/user/" + user.username}
			/>
			<LogoutButton/>
		</>
	)
}

function NavBarLogin() {
	return (
		<>
			<ButtonLink
				text="Login"
				link="/login"
			/>
			<ButtonLink
				text="Register"
				link="/register"
			/>
		</>
	)
}

export default function NavBar() {
	const userHandle = useAuth()

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
		<div className={styles.NavBar}>
			<ButtonLink text="Home"
				link="/"
			/>
			{AccountHandle(userHandle.user)}
		</div>
	)
	// <AccountHandle loggedIn={loggedIn}/>
}
