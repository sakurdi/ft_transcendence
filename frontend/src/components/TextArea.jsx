import { forwardRef } from "react"

const TextArea = forwardRef(function TextArea({value, setValue, rows, onEscape, onEnter = undefined, bgColor = "white", ...props}, ref) {
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
        } else if (e.key === "Enter" && onEnter != undefined) {
            e.preventDefault()
			onEnter()
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
			{...props}
			ref = {ref}
		/>
	)
})
export default TextArea;

export const TextAreaTitle = forwardRef(function TextAreaTitle({...props}, ref) {
	return (
		<TextArea rows = {1} {...props} ref = {ref}/>
	)
})

