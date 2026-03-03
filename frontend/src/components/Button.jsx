import styles from "./Button.module.css";
import { useNavigate } from "react-router-dom";

const defaultClassNameButton = "font-semibold p-2\
	rounded-lg bg-g_aqua\
	border border-4 border-g_aqua-500\
	hover:bg-g_aqua-400\
	m-2"

export default function Button({
		onClick,
		children = "Default Button",
		defaultClassName = defaultClassNameButton,
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
		defaultClassName = defaultClassNameButton,
		className = ""
}) {
	const navigate = useNavigate()
	
	const onClick = () => {
		navigate(link)
	}

	return (
		<Button onClick={onClick}
			className={className}
			defaultClassName={defaultClassName}>
				{children}
		</Button>
	)
}
