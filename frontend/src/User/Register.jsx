import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button"
import TextInput, {EMailInputVerify, PasswordInput} from "../components/TextInput"
import WrapError, {ErrorText} from "../components/WrapError"
import styles from './Register.module.css';
import useAuth from "./AuthProvider";
import useNotif from "../components/Notif";

function checkEmail(email, pushError) {
	const regexEmail = "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}"

	if (email === "") {
		pushError("Email is empty")
		return false
	}
	else if (!email.match(regexEmail)) {
		pushError("Email is not valid")
		return false
	}
	return true
}

function checkUsername(username, pushError) {
	if (username === "") {
		pushError("Username is empty")
		return false
	}
	if (username.length <= 2) {
		pushError("Username needs to be a least 3 characters")
		return false
	}
	return true
}

function checkPassword(password, password2, pushError) {
	if (password === "") {
		pushError("Password is empty")
		return false
	}
	if (password.length <= 3) {
		pushError("Password needs to be a least 4 characters")
		return false
	}
	if (password !== password2) {
		pushError("Passwords don't match")
		return false
	}
	return true
}

export default function Register() {
	const userHandle = useAuth()
	const notifHandle = useNotif()
	const navigate = useNavigate();

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
		if (userHandle.user) {
			notifHandle.pushSuccess("You are already logged in")
			navigate('/')
		}
	}, [])

	function handleEnter(event) {
		if (event.key == "Enter") {
			const form = event.target.form;
			const index = [...form].indexOf(event.target);
			form[index + 1].focus();
			event.preventDefault()
		}
	}

	async function onSubmit() {	
		const validPassword = checkPassword(values.password1, values.password2, notifHandle.pushError)
		const validUsername = checkUsername(values.username, notifHandle.pushError)
		const validEmail = checkEmail(values.email, notifHandle.pushError)

		if (!validEmail || !validUsername || !validPassword) {
			return
		}
		try {
			await userHandle.register(values.username, values.email, values.password1)

			notifHandle.pushSuccess(`Logged in as ${values.username}`)
			navigate('/')
		} catch (error) {
			notifHandle.pushError(error)
		}
	}

	return (
		<form className={styles.Register} onSubmit= {(e) => {e.preventDefault(); onSubmit()}}>
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
				onKeypress={handleEnter}
			/>
			<PasswordInput
				value={values.password2}
				onChange={(password) => setValue("password2", password)}
				placeholder="Confirm password"
				onEnter={onSubmit}
			/>
			<Button type="submit">
				Register
			</Button>
		</form>
	);
}


