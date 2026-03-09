import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button"
import TextInput, {PasswordInput} from "../components/TextInput"
import {ErrorText} from "../components/WrapError"
import styles from './Register.module.css';
import useAuth from "./AuthProvider";


export default function Login() {
	const userHandle = useAuth()
	
	const navigate = useNavigate()
	
	const [values, setValuesInt] = useState({
		username: '',
		password: '',
	})
	
	const [loginError, setLoginError] = useState('');

	const setValue = (field, value) => {
		setValuesInt(prev => ({...prev, [field]: value}))
	}

	useEffect(() => { 
			console.log(userHandle.user)
			if (userHandle.user) {
				console.log("User is already logged in")
				navigate('/')
			}
		}, []
	)

	function handleEnter(event) {
		if (event.key == "Enter") {
			const form = event.target.form;
			const index = [...form].indexOf(event.target);
			console.log(`Index: ${index}`)
			form[index + 1].focus();
			event.preventDefault()
		}
	}

	async function onSubmit() {
		console.log(values.username, values.password)
		try {
			await userHandle.login(values.username, values.password)
			navigate('/')
		} catch (error) {
			console.log(error)
			setLoginError(error)
		}
	}

	return (
		<form className={styles.Register} onSubmit={e => { e.preventDefault();}}>
			<TextInput
				value={values.username}
				onChange={(username) => setValue("username", username)}
				placeholder="Login"
				onKeypress={ handleEnter }
				/>
			<PasswordInput
				value={values.password}
				onChange={(password) => setValue("password", password)}
				onKeypress={ handleEnter }
				// onEnter={onSubmit}
			/>
			<Button onClick={onSubmit}>
				Login
			</Button>
			<ErrorText errorText={loginError}/>
		</form>
	)
}
