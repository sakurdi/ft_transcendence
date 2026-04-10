import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button"
import TextInput, {PasswordInput} from "../components/TextInput"
import styles from './Register.module.css';
import useAuth from "./AuthProvider";
import useNotif from "../components/Notif";

export default function Login() {
	const userHandle = useAuth()
	const notifHandle = useNotif()

	const navigate = useNavigate()
	
	const [values, setValuesInt] = useState({
		username: '',
		password: '',
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

	function handleEnter(event) {
		if (event.key == "Enter") {
			const form = event.target.form;
			const index = [...form].indexOf(event.target);
			form[index + 1].focus();
			event.preventDefault()
		}
	}

	async function onSubmit() {
		try {
			await userHandle.login(values.username, values.password)
			notifHandle.pushSuccess(`Logged in as ${values.username}`)
			navigate('/')
		} catch (error) {
			setValue("password", "")
			notifHandle.pushError(error)
		}
	}

	return (
		<form className={styles.Register} onSubmit={e => { e.preventDefault(); onSubmit()}}>
			<TextInput
				value={values.username}
				onChange={(username) => setValue("username", username)}
				placeholder="Login"
				onKeypress={handleEnter}
				/>
			<PasswordInput
				value={values.password}
				onChange={(password) => setValue("password", password)}
				// onEnter= {onSubmit} // form handles this
			/>
			<Button type="submit">
				Login
			</Button>
		</form>
	)
}
