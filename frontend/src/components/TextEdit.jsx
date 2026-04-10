import { useState } from "react"
import TextButton from "./TextButton"

export default function TextEdit({ baseValue, onValueSave = (value) => {} }) {
	const [value, setValue] = useState(baseValue)
	const [edit, setEdit] = useState(false)

	if (edit === false) {
		return (
			<div className="space-y-1">
				<p className="text-[#c8c8d8] text-sm leading-relaxed">{value}</p>
				<TextButton text="Edit" onClick={() => setEdit(true)} />
			</div>
		)
	} else {
		return (
			<div className="space-y-2">
				<textarea
					className="w-full bg-[#1f1f28] text-[#eaeaf4] text-sm rounded-lg
						border border-white/8 px-3 py-2 resize-none
						focus:outline-none focus:border-g_seagreen focus:ring-2 focus:ring-g_seagreen/15"
					value={value}
					onChange={e => setValue(e.target.value)}
					rows={Math.max(2, (value.match(/\n/g) || []).length + 1)}
				/>
				<div className="flex gap-3">
					<TextButton text="Save" onClick={() => { onValueSave(value); setEdit(false) }} />
					<TextButton text="Discard" onClick={() => { setValue(baseValue); setEdit(false) }} />
				</div>
			</div>
		)
	}
}
