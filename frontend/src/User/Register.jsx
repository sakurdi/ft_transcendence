import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button"
import TextInput, { EMailInputVerify, PasswordInput } from "../components/TextInput"
import useAuth from "./AuthProvider";
import useNotif from "../components/Notif";
import Loading from "../components/Loading";
import Card from "../components/Card"

function checkEmail(email, pushError) {
	const regexEmail = "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}"
	if (email === "") { pushError("Email cannot be empty"); return false }
	if (!email.match(regexEmail)) { pushError("Email is not valid"); return false }
	return true
}

function checkUsername(username, pushError) {
	const regexUsername = "[a-zA-Z0-9_]{3,}"
	if (username === "") { pushError("Username cannot be empty"); return false }
	if (username.length <= 2) { pushError("Username must be at least 3 characters"); return false }
	if (!username.match(regexUsername)) { pushError("Username: letters, numbers and '_' only"); return false }
	return true
}

function checkPassword(password, password2, pushError) {
	if (password === "") { pushError("Password cannot be empty"); return false }
	if (password.length <= 3) { pushError("Password must be at least 4 characters"); return false }
	if (password !== password2) { pushError("Passwords don't match"); return false }
	return true
}

export default function Register() {
	const userHandle = useAuth()
	const notifHandle = useNotif()
	const navigate = useNavigate()

	const [values, setValuesInt] = useState({
		email: '',
		username: '',
		password1: '',
		password2: '',
	})

	const setValue = (field, value) => {
		setValuesInt(prev => ({...prev, [field]: value}))
	}

	useEffect(() => {
		if (userHandle.loading) return
		if (userHandle.user) {
			notifHandle.pushSuccess("You are already logged in")
			navigate('/')
		}
	}, [userHandle.loading])

	if (userHandle.loading) return <Loading />

	function handleEnter(event) {
		if (event.key === "Enter") {
			const form = event.target.form
			const index = [...form].indexOf(event.target)
			form[index + 1]?.focus()
			event.preventDefault()
		}
	}

	async function onSubmit() {
		const validPassword = checkPassword(values.password1, values.password2, notifHandle.pushError)
		const validUsername = checkUsername(values.username, notifHandle.pushError)
		const validEmail = checkEmail(values.email, notifHandle.pushError)

		if (!validEmail || !validUsername || !validPassword) {
			setValue("password1", "")
			setValue("password2", "")
			return
		}
		try {
			await userHandle.register(values.username, values.email, values.password1)
			notifHandle.pushSuccess(`Welcome, ${values.username}!`)
			navigate('/')
		} catch (error) {
			notifHandle.pushError(error)
			setValue("password1", "")
			setValue("password2", "")
		}
	}

	return (
		<Card title="Create Account" description="Join the community today.">
			<form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); onSubmit() }}>
				<EMailInputVerify
					value={values.email}
					oldOnChange={(email) => setValue("email", email)}
					onKeypress={handleEnter}
				/>
				<TextInput
					value={values.username}
					onChange={(username) => setValue("username", username)}
					placeholder="Username"
					onKeypress={handleEnter}
				/>
				<PasswordInput
					value={values.password1}
					onChange={(password) => setValue("password1", password)}
					placeholder="Password"
					onKeypress={handleEnter}
				/>
				<PasswordInput
					value={values.password2}
					onChange={(password) => setValue("password2", password)}
					placeholder="Confirm password"
					onEnter={onSubmit}
				/>
				<Button type="submit" className="w-full justify-center py-2.5 mt-1">
					Create Account
				</Button>
				<p className="text-center text-xs text-[#46465a]">
					Already have an account?{" "}
					<button type="button" onClick={() => navigate("/login")}
						className="text-g_seagreen hover:underline">
						Sign in
					</button>
				</p>
			</form>
		</Card>
	)
}
