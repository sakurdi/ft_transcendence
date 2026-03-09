import { useState } from "react"
import useAuth from "../AuthProvider"
import Button from "../components/Button"
import { apiPost } from "../Utils/api"
import TextInput from "../components/TextInput"

export default function CreatePost({board}) {
	const [title, setTitle] = useState("")
	const [description, setDescription] = useState("")

	return (
		<div>
			<TextInput value={title}
				onChange = {(value) => {setTitle(value)}}
				placeholder="Title"
			/>
		</div>
	)
} 
