import styles from "./Button.module.css";

export default function Button({handleClick, text = "Default Button"}) {
	return (
		<div className={styles.Button_Div}>
			<button className={styles.Button}
				onClick = {handleClick}>
				{text}
			</button>
		</div>
	)
}
