export default function TextArea({value, setValue, rows=1, onEscape, allowEnter = true, bgColor = white, ...props}) {
	const onChange = (e) => {
		e.stopPropagation()
		if (e.key == "Escape" && onEscape !== undefined) {
			onEscape()
		} else if (e.key == "Enter" && !allowEnter) {
			e.preventDefault()
		} else {
			setValue(e.target.value)
		}
			
	}
	return (
		<textarea className="text-black font-bold text-base bg-transparent resize-none focus:outline-none
			rounded-xl"
			style={{ backgroundColor: bgColor}}
			value = {value}
			onChange = {onChange}
			onClick = {(e) => {e.stopPropagation()}}
		/>
	)
}

// export function TextArea({value, setValue, ...props}) {
	
// }
