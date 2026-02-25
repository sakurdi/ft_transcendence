import {useState, useRef, forwardRef} from "react";
import styles from './Register.module.css';

function Entry_Error({children, errorText}) {
	return (
		<div className={styles.entryError}>
			<ErrorText errorText={errorText}/>
			{children}
		</div>
	)
}

function ErrorText({errorText}) {
	return (
		<div className={styles.Error}>
			{errorText}
		</div>
	)
}

const validEMailTrue = "✓";
const validEMailFalse = "✖";
export function EMail_Entry({refEntry, emailValidChar}) {
	// const regexEmail = "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}"

	const emailValidStyle = ((emailValidChar) => {
		if (emailValidChar === '')
			return (styles.divValidEMail)
		else if (emailValidChar === validEMailTrue)
			return (styles.divValidEMailTrue)
		else
			return (styles.divValidEMailFalse)
		})(emailValidChar)
	
	return (
		<div className={styles.Text_Entry_Div}>
			<input className={`${styles.Text_Entry} ${styles.EMail_Entry}`}
				type="email"
				placeholder="E-mail"
				// pattern={regexEmail}
				ref={refEntry}
			/>
			<div className={emailValidStyle}>{emailValidChar}</div>
		</div>
	)
}

export function UserName_Entry({refEntry}) {
	return (
		<div className={styles.Text_Entry_Div}>
			<input className={styles.Text_Entry}
				type="text"
				placeholder="Username"
				ref={refEntry}
			/>
		</div>
	)
}

export function PassWord_Entry({refEntry, placeholder = "Password"}) {
	return (
		<div className={styles.Text_Entry_Div}>
			<input className={styles.Text_Entry}
				type="password"
				placeholder={placeholder}
				ref={refEntry}
			/>
		</div>
	)
}

function Button({handleClick}) {
	return (
		<div className={styles.Button_Div}>
			<button className={styles.Button}
				onClick = {handleClick}>
				Register
			</button>
		</div>
	)
}

function checkEmail(email, setEmailError, setValidEmailChar) {
	const regexEmail = "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}"

	if (email === "") {
		setValidEmailChar(validEMailFalse)
		setEmailError("Email is empty")
		console.log("Empty Email")
		return false
	}
	else if (!email.match(regexEmail)) {
		setValidEmailChar(validEMailFalse)
		setEmailError("Email is not valid")
		console.log("mail Doesnt match")
		return false
	}
	setValidEmailChar(validEMailTrue)
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
	const [emailError, setEmailError] = useState('');
	const [emailValidChar, setValidEmailChar] = useState('');
	const [usernameError, setUsernameError] = useState('');
	const [passwordError, setPasswordError] = useState('');

	const emailRef = useRef(null);
	const usernameRef = useRef(null);
	const password1Ref = useRef(null);
	const password2Ref = useRef(null);
	const [success, setSuccess] = useState(true);
	const [jsonResponse, setjsonResponse] = useState('');

	async function fetchRegisterApi(email, username, password) {
		try {
			// const response = await fetch('https://localhost:1043/api/register', {
			const response = await fetch('/api/register', {
				method: 'POST',
				body: JSON.stringify({
					'username': username,
					'Email': email,
					'Password': password,
				})
			})
			if (!response.ok) {
				throw (`Response status: ${response.status}`);
				throw new Error(`Response status: ${response.status}`);
			}
			const responseJSON = await response.json();
			console.log(responseJSON)
		} catch (error) {
			console.log(error)
			setSuccess(false)
			return (false)
		}
		return (true);
	}

	function handleClick() {
		const email = emailRef.current.value
		const username = usernameRef.current.value
		const password1 = password1Ref.current.value
		const password2 = password2Ref.current.value
		
		const validEmail = checkEmail(email, setEmailError, setValidEmailChar)
		const validUsername = checkUsername(username, setUsernameError)
		const validPassword = checkPassword(password1, password2, setPasswordError)

		if (!validEmail || !validUsername || !validPassword) {
			return
		}
		console.log(email, username, password1, password2)
		const SuccessAPI = fetchRegisterApi(email, username, password1)
		setSuccess(SuccessAPI)
	}


	const setTextSuccess = (success) => {
		return (success ? "Sucess" : "Failure")
	}
	
	return (
		<div className={styles.Register}>
			<Entry_Error errorText={emailError}>
				<EMail_Entry refEntry={emailRef}
					emailValidChar={emailValidChar}/>
			</Entry_Error>
			<Entry_Error errorText={usernameError}>
				<UserName_Entry refEntry={usernameRef}/>
			</Entry_Error>
			<Entry_Error errorText={passwordError}>
				<PassWord_Entry refEntry={password1Ref}/>
				<PassWord_Entry refEntry={password2Ref}
					placeholder='Confirm Password'/>
			</Entry_Error>
			<Button handleClick={handleClick}/>
			<div>
				{success ? "Sucess" : "Failure"}
			</div>
		</div>
	);
}
