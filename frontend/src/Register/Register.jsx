import styles from './Register.module.css';

export function EMail_Entry(){
	const regexEmail = "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}"

	return (
		<div className={`${styles.Text_Entry_Div} ${styles.EMail_Entry_Span}`}>
			<input className={`${styles.Text_Entry} ${styles.EMail_Entry}`}
				type="email"
				placeholder="E-mail"
				pattern={regexEmail}
				required>
			</input>
			<span className="validity"></span>
		</div>
	)
}

export function UserName_Entry(){
	return (
		<div className={styles.Text_Entry_Div}>
			<input className={styles.Text_Entry}
				type="text"
				placeholder="Username"
				required>
			</input>
		</div>
	)
}

export function PassWord_Entry({placeholder = "Password"}){
	return (
		<div className={styles.Text_Entry_Div}>
			<input className={styles.Text_Entry}
				type="password"
				placeholder={placeholder}
				required>
			</input>
		</div>
	)
}

function Button()
{
	const handleClick = () => {
		Console.log("Salut")
	}

	return (
		<div className={styles.Button_Div}>
			<button className={styles.Button}
				onClick = {handleClick}>
				Salut
			</button>
		</div>
	)
}

export default function Register() {
  return (
	<div className={styles.Register}>
		<EMail_Entry/>
		<UserName_Entry/>
		<PassWord_Entry/>
		<PassWord_Entry placeholder='Confirm Password'/>
		<Button/>
	</div>
	);
}
