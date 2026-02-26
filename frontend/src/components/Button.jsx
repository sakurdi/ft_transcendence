import styles from "./Button.module.css";
import { useNavigate } from "react-router-dom";

export default function Button({
		onClick,
		text = "Default Button"
}) {
	return (
		<div className={styles.Button_Div}>
			<button className={styles.Button}
				onClick = {onClick}>
				{text}
			</button>
		</div>
	)
}

export function ButtonLink({
		link = "/",
		text = "Default ButtonLink"
}) {
	const navigate = useNavigate()
	
	const onClick = () => {
		navigate(link)
		console.log(link)
	}

	return (
		<Button
			onClick={onClick}
			text={text}
		/>
	)
}
