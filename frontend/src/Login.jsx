import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./components/Button"
import TextInput, {PasswordInput} from "./components/TextInput"
import {ErrorText} from "./components/WrapError"
import styles from './Register.module.css';

export default function Login() {
	const navigate = useNavigate()
	const [values, setValuesInt] = useState({
		username: '',
		password: '',
	})
	const [loginError, setLoginError] = useState('');

	const setValue = (field, value) => {
		setValuesInt(prev => ({...prev, [field]: value}))
	}

	async function onClick() {
		console.log(values.username, values.password)
		try {
			const response = await fetch('/api/login', {
				method: 'POST',
				body: JSON.stringify({
					'username': values.username,
					'password': values.password
				})
			})
			if (!response.ok) {
				const errorBody = await response.text(); // or response.text()
				console.log("Status:", response.status);
				console.log("Error body:", errorBody);	
				throw (errorBody)
			}
			const data = await response.json()
			console.log(data)
			navigate("/")
			if (data.success)
				navigate("/")
			else
				setLoginError(data.context)
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
