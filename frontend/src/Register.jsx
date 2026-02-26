import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./components/Button"
import TextInput, {EMailInput, EMailInputVerify, PasswordInput} from "./components/TextInput"
import WrapError, {ErrorText} from "./components/WrapError"
import styles from './Register.module.css';

function checkEmail(email, setEmailError) {
	const regexEmail = "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}"

	if (email === "") {
		// setValidEmailChar(validEMailFalse)
		setEmailError("Email is empty")
		console.log("Empty Email")
		return false
	}
	else if (!email.match(regexEmail)) {
		// setValidEmailChar(validEMailFalse)
		setEmailError("Email is not valid")
		console.log("mail Doesnt match")
		return false
	}
	// setValidEmailChar(validEMailTrue)
	setEmailError("")
	console.log("Mail ok")
	return true
}

function checkUsername(username, setUsernameError) {
	if (username === "") {
		setUsernameError("Username is empty")
		console.log("Empty username")
		return false
	}
	if (username.length <= 2) {
		setUsernameError("Username needs to be a least 3 characters")
		console.log("To small username")
		return false
	}
	setUsernameError("")
	console.log("username ok")
	return true
}

function checkPassword(password, password2, setPasswordError) {
	if (password === "") {
		setPasswordError("Password is empty")
		console.log("Empty password")
		return false
	}
	if (password.length <= 3) {
		setPasswordError("Password needs to be a least 4 characters")
		console.log("Tosmall password")
		return false
	}
	if (password !== password2) {
		setPasswordError("Passwords don't match")
		console.log("no match password")
		return false
	}
	setPasswordError("")
	console.log("password ok")
	return true
}

export default function Register() {
	const navigate = useNavigate();

	const [values, setValuesInt] = useState({
		email: '',
		username: '',
		password1: '',
		password2: '',
	})
	const [errors, setErrorsInt] = useState({
		email: "",
		username: '',
		password: '',
	})

	const setValue = (field, value) => {
		setValuesInt(prev => ({...prev, [field]: value}))
	}
	const setError = (field, value) => {
		setErrorsInt(prev => ({...prev, [field]: value}))
	}

	const [registerError, setRegisterError] = useState('');

	async function handleClick() {	
		const validEmail = checkEmail(values.email,
			(errEmail) => {setError("email", errEmail)})
		const validUsername = checkUsername(values.username,
			(errUsername) => {setError("username", errUsername)})
		const validPassword = checkPassword(values.password1, values.password2,
			(errPassword) => {setError("password", errPassword)})
		if (!validEmail || !validUsername || !validPassword) {
			return
		}
		console.log(values.email, values.username, values.password1, values.password2)
		try {
			await fetch('/api/register', {
				method: 'POST',
				body: JSON.stringify({
					'username': values.username,
					'Email': values.email,
					'Password': values.password1,
				})
			})
			.then((response) => response.json())
			.then((data) => {
				if (data.success) {
					navigate("/salut");
				}
				else
					setRegisterError(data.context)
			})
		} catch (error) {
			console.log(error)
			setRegisterError("Fetch error")
		}
	}

	return (
		<div className={styles.Register}>
			<WrapError errorText={errors.email}>
				<EMailInputVerify
					value={values.email}
					oldOnChange={(email) => setValue("email", email)}
				/>
			</WrapError>
			<WrapError errorText={errors.username}>
				<TextInput
					value={values.username}
					onChange={(username) => setValue("username", username)}
					placeholder="Username"
				/>
			</WrapError>
			<WrapError errorText={errors.password}>
				<PasswordInput
					value={values.password1}
					onChange={(password) => setValue("password1", password)}
				/>
				<PasswordInput
					value={values.password2}
					onChange={(password) => setValue("password2", password)}
					placeholder="Confirm password"
				/>
			</WrapError>
			<Button handleClick={handleClick} text="Register"/>
			<ErrorText errorText={registerError}/>
		</div>
	);
}


