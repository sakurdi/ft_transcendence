import { useState } from "react"

import TextButton from "./TextButton"

export default function TextEdit({ baseValue, onValueSave = (value)=>{} }) {
	// const oldValue = baseValue
	const [value, setValue] = useState(baseValue)
	const [edit, setEdit] = useState(false)

	if (edit === false) {
		return (
			<div>
				<p>
					{value}
				</p>
				<br/>
				<small>
					<TextButton text="Edit" onClick={(e) => setEdit(true)}/>
				</small>
			</div>
		)
	} else {
		return (
			<div>
				<textarea value={value} onChange={e => setValue(e.target.value)}/>
				<br/>
				<small>
					<TextButton text="Save" onClick={(e) => {onValueSave({value}); setEdit(false)}}/>
					<TextButton text="Discard" onClick={(e) => {setValue(baseValue); onValueSave({value}); setEdit(false)}}/>
				</small>
			</div>
		)
	}
}
