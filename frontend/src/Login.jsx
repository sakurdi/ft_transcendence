import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./components/Button"
import TextInput, {EMailInput, EMailInputVerify, PasswordInput} from "./components/TextInput"
import WrapError, {ErrorText} from "./components/WrapError"
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

	async function handleClick() {
		console.log(values.username, values.password)
		try {
			await fetch('/api/login', {
				method: 'POST',
				body: JSON.stringify({
					'username': values.username,
					'password': values.password
				})
			})
			.then((response) => response.json())
			.then((data) => {
				console.log(data)
				if (data.success) {
					navigate("/salut");
				}
				else
					setLoginError(data.context)
			})
		} catch (error) {
			console.log(error)
			setLoginError("Fetch error")
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
			<Button handleClick={handleClick} text="Login"/>
			<ErrorText errorText={loginError}/>
		</div>
	)
}
