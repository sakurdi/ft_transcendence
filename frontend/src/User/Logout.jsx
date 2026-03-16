import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button"
import useAuth from "./AuthProvider";
import useNotif from "../components/Notif";

export function LogoutButton() {
	const userHandle = useAuth()
	const navigate = useNavigate() 

	async function onClick() {
		try {
			userHandle.logout()
			navigate("/");
		} catch (error) {
			console.log(error.message)
		}
	}

	return (
		<Button onClick={onClick}>Logout</Button>
	)
}

export default function LogoutPage() {
	const userHandle = useAuth()
	const notifHandle = useNotif()

	const navigate = useNavigate()

	async function onClick() {
		try {
			userHandle.logout()
			notifHandle.pushSuccess("Logged out")
			navigate("/");
		} catch (error) {
			setLogoutError(error)
		}
	}

	useEffect(() => { 
		if (!userHandle.user) {
			notifHandle.pushError("Not logged in")
			navigate('/')
		}
		}, []
	)

	return (
		<>
			<Button onClick={onClick}>Logout</Button>
		</>
	)
}
