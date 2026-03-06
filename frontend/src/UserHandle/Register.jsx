import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button"
import TextInput, {EMailInputVerify, PasswordInput} from "../components/TextInput"
import WrapError, {ErrorText} from "../components/WrapError"
import styles from './Register.module.css';
import useAuth from "./AuthProvider";

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
	const userHandle = useAuth()

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

	useEffect(() => { 
			if (userHandle.user) {
				console.log("User is already registerd")
				navigate('/')
			}
		}, []
	)

	async function onSubmit() {	
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
			await userHandle.register(values.username, values.email, values.password1)
			navigate('/')
		} catch (error) {
			console.log(error)
			setRegisterError(error)
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
					onEnter={onSubmit}
				/>
			</WrapError>
			<Button onClick={onSubmit}>
				Register
			</Button>
			<ErrorText errorText={registerError}/>
		</div>
	);
}


