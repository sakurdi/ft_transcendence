import styles from "./TextInput.module.css";
import { useState } from "react";

export default function TextInput ({
	value,
	onChange,
	placeholder = "",
	type = "text",
	id,
	name,
	autoComplete = "off",
	className,
	onEnter = undefined,
	onKeypress = undefined,
	children,
}) {
	if (className === undefined)
		className = styles.TextInput
	
	return (
		<div className={styles.TextInput_Div}>
			<input className={className}
				id={id}
				name={name}
				autoComplete={autoComplete}
				onKeyDown={(e) => {onKeypress?.(e); e.key == "Enter" && onEnter?.()}}
				type={type}
				placeholder={placeholder}
				value={value}
				onChange={(event) => (onChange(event.target.value))}
			/>
			{children}
		</div>
	)
}

export function EMailInputVerify({
	value,
	oldOnChange,
	placeholder = "Email",
	id,
	name,
	autoComplete = "email",
	onEnter = undefined,
	onKeypress = undefined,
}) {
	const regexEmail = "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}"
	const validEMailTrue = "✓";
	const validEMailFalse = "✖";

	var [charValidEMail, setCharValidEMail] = useState('')
	var [styleValidEMail, setStyleValidEMail] = useState([])

	const onChange = (v) => {
		oldOnChange(v)

		let char = ""
		if (v == "")
			char = ""
		else if (!v.match(regexEmail))
			char = validEMailFalse
		else
			char =validEMailTrue
		setCharValidEMail(char)
		setStyleValidEMail(
			((charValidEMail) => {
				if (charValidEMail === validEMailTrue)
					return (styles.EMailInputValidTrue)
				else if (charValidEMail === validEMailFalse)
					return (styles.EMailInputValidFalse)
				else
					return (styles.EMailInputValid)
			})(char))
	}

	return (
		<TextInput className={`${styles.TextInput} ${styles.EMailInput}`}
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				type="email"
				id={id}
				name={name}
				autoComplete={autoComplete}
				onEnter={onEnter}
				onKeypress={onKeypress}>
			<div className={styleValidEMail}>{charValidEMail}</div>
		</TextInput>
	)
}

export function EMailInput({
	value,
	onChange,
	placeholder = "Email",
	verifyEmail = true,
	id,
	name,
	autoComplete = "email",
	onEnter = undefined,
	onKeypress = undefined,
}) {
	if (verifyEmail === true) {
		return (<EMailInputVerify
					value={value}
					onChange={onChange}
					placeholder={placeholder}
					id={id}
					name={name}
					autoComplete={autoComplete}
					onEnter={onEnter}
					onKeypress={onKeypress}/>
			)
	}
	else {
		return (
			<TextInput
				value={value}
				onChange={onChange}
				type="email"
				placeholder={placeholder}
				id={id}
				name={name}
				autoComplete={autoComplete}
				onEnter={onEnter}
				onKeypress={onKeypress}
			/>
		)
	}
}

export function PasswordInput({
	value,
	onChange,
	placeholder = "Password",
	id,
	name,
	autoComplete = "current-password",
	onEnter = undefined,
	onKeypress = undefined
}) {
	return (
		<TextInput
			value={value}
			onChange={onChange}
			placeholder={placeholder}
			id={id}
			name={name}
			autoComplete={autoComplete}
			onEnter={onEnter}
			onKeypress={onKeypress}
			type="password"
		/>
	)
}
