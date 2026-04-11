import { useNavigate } from "react-router-dom";

const defaultClassNameButton =
	"inline-flex items-center justify-center gap-2 " +
	"px-4 py-2 rounded-lg text-sm font-semibold " +
	"bg-g_seagreen text-white border border-g_seagreen-600 " +
	"hover:bg-g_seagreen-600 " +
	"active:scale-[0.97] " +
	"transition-all duration-150 ease-out " +
	"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-g_seagreen/40 " +
	"disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"

const defaultClassNameButtonLink =
	"inline-flex items-center justify-center gap-2 " +
	"px-3 py-1.5 rounded-lg text-sm font-medium " +
	"text-[#9898b8] border border-transparent " +
	"hover:text-[#eaeaf4] hover:bg-white/6 hover:border-white/8 " +
	"active:scale-[0.97] " +
	"transition-all duration-150 ease-out " +
	"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"

export default function Button({
		onClick,
		children = "Default Button",
		defaultClassName = defaultClassNameButton,
		className = "",
		type = "button",
		...props
}) {
	return (
		<button className={`${defaultClassName} ${className}`}
			onClick={onClick}
			type={type}
			{...props}>
			{children}
		</button>
	)
}

export function ButtonLink({
		link = "/",
		children = "Default ButtonLink",
		defaultClassName = defaultClassNameButtonLink,
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
