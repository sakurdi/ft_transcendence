import {ButtonLink} from "./components/Button"
import { LogoutButton } from "./User/Logout"
import useAuth from "./User/AuthProvider"

function NavBarUser() {
	const userHandle = useAuth()
	const user = userHandle.user

	const classDiv = "ml-auto flex gap-5"

	return (
		<div className={classDiv}>
			<ButtonLink link={"/user/" + user.username}>
				{user.username}
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

	const NavBarHandle = (loggedIn) => {
		if (loggedIn) {
			console.log("Logged In")
			return <NavBarUser/>;
		} else {
			console.log("Not Logged In")
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

