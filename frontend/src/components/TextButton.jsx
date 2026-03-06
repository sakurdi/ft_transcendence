import { useNavigate } from "react-dom"

export default function TextButton({onClick, hover = true, text}) {
	const className = "" + (hover ? " cursor-pointer":"")

	return (
		<span className = {className}
			onClick = {(e) => {e.stopPropagation(); onClick(e)}}>
			{text}
		</span>
	)
}


export function TextLink({link = undefined, text}) {
	const navigate = useNavigate()

	const onClick = ( link === undefined
			? ((e) => {})
			: ((e) => {navigate(link)})
	)
	return ( <TextButton onClick = {onClick} text={text}/> )
}

