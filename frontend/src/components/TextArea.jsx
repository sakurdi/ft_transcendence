export default function TextArea({value, setValue, rows, onEscape, allowEnter = true, bgColor = "white", ...props}) {
	if (rows === undefined) {
		rows = (value.match(/\n/g) || []).length + 1
	}

	const onChange = (e) => {
		e.stopPropagation()
		setValue(e.target.value)
	}

	const onKeyDown = (e) => {
        e.stopPropagation()
        if (e.key === "Escape" && onEscape !== undefined) {
            onEscape()
        } else if (e.key === "Enter" && !allowEnter) {
            e.preventDefault()
        }
    }
	return (
		<textarea className="text-black font-bold text-base bg-transparent resize-none focus:outline-none
			rounded-xl"
			style={{ backgroundColor: bgColor}}
			value = {value}
			onChange = {onChange}
			onClick = { (e) => {e.stopPropagation()} }
			onKeyDown = {onKeyDown}
			rows = {rows} width = "90" spellCheck = "false"
		/>
	)
}

export function TextAreaTitle({...props}) {
	return (
		<TextArea allowEnter={false} rows = {1} {...props}/>
	)
}
