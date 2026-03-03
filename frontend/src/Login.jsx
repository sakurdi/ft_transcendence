import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./components/Button"
import TextInput, {PasswordInput} from "./components/TextInput"
import {ErrorText} from "./components/WrapError"
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
			if (userHandle.user) {
				console.log("User is already logged in")
				navigate('/')
			}
		}, []
	)
	async function onClick() {
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
		<div className={styles.Register}>
			<TextInput
				value={values.username}
				onChange={(username) => setValue("username", username)}
				placeholder="Login"
			/>
			<PasswordInput
				value={values.password}
				onChange={(password) => setValue("password", password)}
			/>
			<Button onClick={onClick} text="Login"/>
			<ErrorText errorText={loginError}/>
		</div>
	)
}
