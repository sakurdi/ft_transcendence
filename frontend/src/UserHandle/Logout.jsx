import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button"
import {ErrorText} from "../components/WrapError"
import useAuth from "./AuthProvider";


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
	const navigate = useNavigate()

	var [logoutError, setLogoutError] = useState('')

	async function onClick() {
		try {
			userHandle.logout()
			navigate("/");
		} catch (error) {
			console.log(error.message)
			setLogoutError("Fetch error")
		}
	}

	useEffect(() => { 
			if (!userHandle.user) {
				console.log("Not logged in")
				navigate('/')
			}
		}, []
	)

	return (
		<>
			<Button onClick={onClick}>Logout</Button>
			<ErrorText errorText={logoutError}/>
		</>
	)
}
