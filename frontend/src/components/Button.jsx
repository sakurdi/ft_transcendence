import styles from "./Button.module.css";
import { useNavigate } from "react-router-dom";
{/* <button class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold
	hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"></button> */}
const defaultClassNameButton = "font-semibold p-2\
	rounded-lg bg-g_aqua\
	border border-4 border-g_seagreen-300\
	hover:bg-g_aqua-300\
	margin"

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
