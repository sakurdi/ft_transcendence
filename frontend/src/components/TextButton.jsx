import { useNavigate } from "react-router-dom"

export default function TextButton({ onClick, hover = true, text, ...props }) {
	const className =
		"inline-flex items-center text-xs font-medium text-[#8a8aa8] " +
		"transition-colors duration-100 " +
		(hover ? "hover:text-[#eaeaf4] cursor-pointer" : "")

	return (
		<span className={className}
			onClick={(e) => { e.stopPropagation(); onClick(e) }}
			{...props}>
			{text}
		</span>
	)
}

export function TextLink({ link = undefined, text, ...props }) {
	const navigate = useNavigate()

	const onClick = (link === undefined
		? ((e) => {})
		: ((e) => { navigate(link) })
	)
	return <TextButton onClick={onClick} text={text} {...props} />
}
