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

export function EMail_Entry({refEntry}) {
	const regexEmail = "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}"

	return (
		<div className={styles.Text_Entry_Div}>
			<input className={`${styles.Text_Entry} ${styles.EMail_Entry}`}
				type="email"
				placeholder="E-mail"
				pattern={regexEmail}
				ref={refEntry}
			/>
			<div className={styles.spanEMail}></div>
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

function checkEmail(email, setEmailError, setSuccessEmail) {
	const regexEmail = "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}"
	const charWrongEmail = "✖";
	const charValidEmail = "✖";

	if (email === "") {
		setEmailError("Email is empty")
		console.log("Empty Email")
		return false
	}
	else if (!email.match(regexEmail)) {
		setEmailError("Email is not valid")
		console.log("mail Doesnt match")
		return false
	}
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
		setPasswordError("Password don't match")
		console.log("no match password")
		return false
	}
	setPasswordError("")
	console.log("password ok")
	return true
}

export default function Register() {
	const [emailError, setEmailError] = useState('');
	const [usernameError, setUsernameError] = useState('');
	const [passwordError, setPasswordError] = useState('');

	const emailRef = useRef(null);
	const usernameRef = useRef(null);
	const password1Ref = useRef(null);
	const password2Ref = useRef(null);
	const [success, setSuccess] = useState(true);

	function handleClick() {
		const email = emailRef.current.value
		const username = usernameRef.current.value
		const password1 = password1Ref.current.value
		const password2 = password2Ref.current.value
		
		const validEmail = checkEmail(email, setEmailError)
		const validUsername = checkUsername(username, setUsernameError)
		const validPassword = checkPassword(password1, password2, setPasswordError)

		if (!validEmail || !validUsername || !validPassword) {
			setSuccess(false)
			return
		}
		console.log(email, username, password1, password2)
		setSuccess(true)
	}

	const setTextSuccess = (success) => {
		return (success ? "Sucess" : "Failure")
	}
	// onKeyDown = (e) => {
	// 	if (e.key === 'Enter')
	// 		handleClick()
	// }
	
	return (
		<div className={styles.Register}>
			<Entry_Error errorText={emailError}>
				<EMail_Entry refEntry={emailRef}/>
			</Entry_Error>
			<Entry_Error errorText={usernameError}>
				<UserName_Entry refEntry={usernameRef}/>
			</Entry_Error>
			<Entry_Error errorText={passwordError}>
				<PassWord_Entry refEntry={password1Ref}/>
				<PassWord_Entry refEntry={password2Ref} placeholder='Confirm Password'/>
			</Entry_Error>
			<Button handleClick={handleClick}/>
			<div>
				{setTextSuccess(success)}
			</div>
		</div>
	);
	// return (
	// 	<div className={styles.Register}>
	// 		<EMail_Entry refEntry={emailRef}/>
	// 		<UserName_Entry refEntry={usernameRef}/>
	// 		<PassWord_Entry refEntry={password1Ref}/>
	// 		<PassWord_Entry refEntry={password2Ref} placeholder='Confirm Password'/>
	// 		<Button handleClick={handleClick}/>
	// 		<div>
	// 			{setTextSuccess(success)}
	// 		</div>
	// 	</div>
	// );
}
