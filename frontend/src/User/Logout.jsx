import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ButtonLink } from "../components/Button"
import useAuth from "./AuthProvider";
import useNotif from "../components/Notif";
import Loading from "../components/Loading";

export function LogoutButton() {
	return (
		<ButtonLink link = "/logout">
			Logout
		</ButtonLink>
	)
}


export default function Logout() {
	const userHandle = useAuth()
	const navigate = useNavigate() 
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
