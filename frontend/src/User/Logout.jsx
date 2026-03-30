import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button, { ButtonLink } from "../components/Button"
import useAuth from "./AuthProvider";
import useNotif from "../components/Notif";
import Loading from "../components/Loading";

export function LogoutButton() {
	const userHandle = useAuth()
	const notifHandle = useNotif()

	const logout = () => {
		if (!userHandle.loading && userHandle.user) {
			try {
				userHandle.logout()
				notifHandle.pushSuccess("Logged out")
			} catch (error) {
				notifHandle.pushError(error)
			}
		} else {
			notifHandle.pushError("You are not logged in")	
		}
	}
	return (
		<Button onClick={logout}>
			Logout
		</Button>
	)
	return (
		<ButtonLink link = "/logout">
			Logout
		</ButtonLink>
	)
}


export default function Logout() {
	const navigate = useNavigate() 
	const userHandle = useAuth()
	const notifHandle = useNotif()
	
	useEffect(() => {
		if (userHandle.loading) return
		if (userHandle.user) {
			try {
				userHandle.logout()
				notifHandle.pushSuccess("Logged out")
			} catch (error) {
				notifHandle.pushError(error)
			}
		} else {
			notifHandle.pushError("You are not logged in")	
		}
		navigate("/");
	}, [userHandle.loading])

	if (userHandle.loading) return <Loading/>
}
