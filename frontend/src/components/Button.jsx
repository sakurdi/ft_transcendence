import styles from "./Button.module.css";
import { useNavigate } from "react-router-dom";

const defaultClassNameButton = "border-3 bg-gaqua"

export default function Button({
		onClick,
		children = "Default Button",
		defaultClassName = {defaultClassNameButton},
		className = ""
}) {
	return (
		<button className = {`${defaultClassName} ${className}`}
			onClick = {onClick}>
			{children}
		</button>
	)
}

export function ButtonLink({
		link = "/",
		children = "Default ButtonLink",
		defaultClassName = {defaultClassNameButton},
		className = ""
}) {
	const navigate = useNavigate()
	
	const onClick = () => {
		navigate(link)
		// console.log(link)
	}

	return (
		<Button onClick={onClick}
			className={className}
			defaultClassName={defaultClassName}>
				{children}
		</Button>
	)
}
