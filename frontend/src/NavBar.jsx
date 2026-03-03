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
			<ButtonLink link={"/user/" + user.username}>
				{user.username}
			</ButtonLink>
			<LogoutButton/>
		</>
	)
}

function NavBarLogin() {
	return (
		<>
			<ButtonLink link="/login">
				Login
			</ButtonLink>
			<ButtonLink link="/register">
				Register
			</ButtonLink>
		</>
	)
}

export default function NavBar() {
	const userHandle = useAuth()

	const NavBarHandle = (loggedIn) => {
		if (loggedIn) {
			console.log("Logged In")
			return <NavBarUser/>;
		} else {
			console.log("Not Logged In")
			return <NavBarLogin/>;
		}
	}

	return (
		<header>
			<nav className="flex items-center h-20">
				<ButtonLink link="/">
					Home
				</ButtonLink>
				<div className="ml-auto flex gap-5">
					{NavBarHandle(userHandle.user)}
				</div>
			</nav>
		</header>
	)
}

