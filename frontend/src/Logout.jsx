import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./components/Button"
import {ErrorText} from "./components/WrapError"


export function LogoutButton() {
	async function onClick() {
		try {
			const response = await fetch('/api/logout', {method: 'POST'})
			if (!response.ok) {
				throw new Error("Error: 40X")
			}
			const data = await response.json()
			console.log(data)
			if (data.success)
				navigate("/");
		} catch (error) {
			console.log(error.message)
		}
	}

	return (
		<Button onClick={onClick} text="Logout"/>
	)
}

export default function LogoutPage() {
	const navigate = useNavigate()

	var [logoutError, setLogoutError] = useState('')

	async function onClick() {
		try {
			const response = await fetch('/api/logout', {method: 'POST'})
			if (!response.ok) {
				throw new Error("Error: 40X")
			}
			const data = await response.json()
			console.log(data)
			navigate("/");
			// if (data.success)
			// 	navigate("/");
			// else
			// 	setLogoutError(data.context)
		} catch (error) {
			console.log(error.message)
			setLogoutError("Fetch error")
		}
	}

	return (
		<>
			<Button onClick={onClick} text="Logout"/>
			<ErrorText errorText={logoutError}/>
		</>
	)
}
