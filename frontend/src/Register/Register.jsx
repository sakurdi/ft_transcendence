import {useState, useRef, forwardRef} from "react";
import styles from './Register.module.css';

function Entry_Error({child, errorText}) {
	return (
		<div className={styles.entryError}>
			<ErrorText error/>
			{child}
		</div>
	)
}

function ErrorText({errorText}) {
	
}

export function EMail_Entry({refEntry}) {
	const regexEmail = "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}"

	return (
		<div className={`${styles.Text_Entry_Div} ${styles.EMail_Entry_Span}`}>
			<input className={`${styles.Text_Entry} ${styles.EMail_Entry}`}
				type="email"
				placeholder="E-mail"
				pattern={regexEmail}
				ref={refEntry}
			/>
			<span className="validity"></span>
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

function checkEmail(email) {
	const regexEmail = "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}"

	if (email === "") {
		console.log("Empty Email")
		return false
	}
	else if (!email.match(regexEmail)) {
		console.log("mail Doesnt match")
		return false
	}
	console.log("Mail ok")
	return true
}

function checkUsername(username) {
	if (username === "") {
		console.log("Empty username")
		return false
	}
	if (username.length <= 2) {
		console.log("To small username")
		return false
	}
	console.log("username ok")
	return true
}

function checkPassword(password, password2) {
	if (password === "") {
		console.log("Empty password")
		return false
	}
	if (password.length <= 3) {
		console.log("Tosmall password")
		return false
	}
	if (password !== password2) {
		console.log("no match password")
		return false
	}
	console.log("password ok")
	return true
}

export default function Register() {
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
		
		const validEmail = checkEmail(email)
		const validUsername = checkUsername(username)
		const validPassword = checkPassword(password1, password2)

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

	return (
		<div className={styles.Register}>
			<EMail_Entry refEntry={emailRef}/>
			<UserName_Entry refEntry={usernameRef}/>
			<PassWord_Entry refEntry={password1Ref}/>
			<PassWord_Entry refEntry={password2Ref} placeholder='Confirm Password'/>
			<Button handleClick={handleClick}/>
			<div>
				{setTextSuccess(success)}
			</div>
		</div>
	);
}
