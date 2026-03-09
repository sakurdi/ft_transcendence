import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button"
import TextInput, { EMailInputVerify, PasswordInput } from "../components/TextInput"
import useAuth from "./AuthProvider";
import useNotif from "../components/Notif";
import Loading from "../components/Loading";
import Card from "../components/Card"

function validate(values, pushError) {
	const regexEmail = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
	const regexUsername = /^[a-zA-Z0-9_]{3,}$/;

	if (!values.email || !regexEmail.test(values.email)) {
		pushError("Please enter a valid email address");
		return false;
	}
	if (!values.username || !regexUsername.test(values.username)) {
		pushError("Username must be at least 3 characters and contain only letters, numbers, and '_'");
		return false;
	}
	if (!values.password1 || values.password1.length < 4) {
		pushError("Password must be at least 4 characters");
		return false;
	}
	if (values.password1 !== values.password2) {
		pushError("Passwords do not match");
		return false;
	}
	return true;
}

export default function Register() {
	const userHandle = useAuth()
	const notifHandle = useNotif()
	const navigate = useNavigate();

	const [values, setValues] = useState({
		email: '',
		username: '',
		password1: '',
		password2: '',
	})

	const setValue = (field, value) => {
		setValues(prev => ({ ...prev, [field]: value }))
	}

	useEffect(() => {
		if (userHandle.loading) return
		if (userHandle.user) {
			navigate('/')
		}
	}, [userHandle.loading, userHandle.user])

	if (userHandle.loading) return <Loading />

	async function onSubmit() {
		if (!validate(values, notifHandle.pushError)) {
			setValues(prev => ({ ...prev, password1: '', password2: '' }));
			return;
		}

		try {
			await userHandle.register(values.username, values.email, values.password1)
			notifHandle.pushSuccess(`Welcome, ${values.username}!`);
			navigate('/')
		} catch (error) {
			notifHandle.pushError(error)
			setValues(prev => ({ ...prev, password1: '', password2: '' }));
		}
	}

	return (
		<div className="flex justify-center">
			<div className="w-full max-w-md">
				<Card
					title="Create Account"
					description="Join our community today! Please fill in your details below."
				>
					<form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); onSubmit() }}>
						<EMailInputVerify
							value={values.email}
							oldOnChange={(email) => setValue("email", email)}
						/>
						<TextInput
							value={values.username}
							onChange={(username) => setValue("username", username)}
							placeholder="Username"
						/>
						<PasswordInput
							value={values.password1}
							onChange={(password) => setValue("password1", password)}
						/>
						<PasswordInput
							value={values.password2}
							onChange={(password) => setValue("password2", password)}
							placeholder="Confirm password"
						/>
						<Button type="submit" className="w-full mt-2" variant="primary">
							Register
						</Button>
					</form>
				</Card>
			</div>
		</div>
	);
}


