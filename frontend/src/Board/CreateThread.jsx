import { useState } from "react"
import useAuth from "../User/AuthProvider"
import Button from "../components/Button"
import { apiPost } from "../Utils/api"
import TextInput from "../components/TextInput"

// type PostCreate struct {
// 	Title    *string `json:"title"`
// 	Content  string  `json:"content"`
// 	ParentID *int    `json:"parent_id"`
// }


export default function CreatePost({board}) {
	const [title, setTitle] = useState("")
	const [content, setContent] = useState("")

	function handleEnter(event) {
		if (event.key == "Enter") {
			const form = event.target.form;
			const index = [...form].indexOf(event.target);
			form[index + 1].focus();
			event.preventDefault()
		}
	}

	async function onSubmit() {	
		console.log(`Title: ${title}  | "${content}"`)
		const res = await apiPost(`/board/${board.id}/post`,
				{body: JSON.stringify({
					'title': title,
					'content': content,
					'parent_id': null
				})
			})
		if (!res.ok) {
			console.log(res.status)
		} else {
			const json = res.json
			console.log(res)
		}

	}

	return (
		<form onSubmit={(e) => {e.preventDefault(); onSubmit()}}>
			<TextInput value={title}
				onChange = { (value) => setTitle(value) }
				placeholder = "Title"
				onKeypress={handleEnter}
				/>
			<textarea value = {content}
				onChange = { (event) => setContent(event.target.value) }
				placeholder = "Content"
				/>
			<Button type = "submit">
				Confirm
			</Button>
		</form>
	)
} 
