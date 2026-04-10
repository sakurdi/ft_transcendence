import { useEffect } from "react"
import useAuth from "./User/AuthProvider"
import {ButtonLink} from "./components/Button"
import { LogoutButton } from "./User/Logout"
import Loading from "./components/Loading"

function NavBarUser({username}) {

	const classDiv = "ml-auto flex gap-5"

	return (
		<div className={classDiv}>
			<ButtonLink link={"/user/" + username}>
				{username}
			</ButtonLink>
			<LogoutButton/>
		</div>
	)
}

function NavBarLogin() {

	const classDiv = "ml-auto flex gap-3 mr-5"

	return (
		<div className={classDiv}>
			<ButtonLink link="/login">
				Login
			</ButtonLink>
			<ButtonLink link="/register">
				Register
			</ButtonLink>
		</div>
	)
}

export default function NavBar() {
	const userHandle = useAuth()

	useEffect(() => {
		if (userHandle.loading) return	
	}, [userHandle.loading])
	
	const NavBarHandle = (user) => {
		if (userHandle.loading)	return <Loading/>
		if (user) {
			return <NavBarUser username = {user.username}/>;
		} else {
			return <NavBarLogin/>;
		}
	}

	const classNav = "flex items-center h-fit\
		bg-gradient-to-t from-g_seagreen to-g_seagreen-300"
	return (
		<header>
			<nav className={classNav}>
				<ButtonLink link="/">
					Home
				</ButtonLink>
				{NavBarHandle(userHandle.user)}
			</nav>
		</header>
	)
}
