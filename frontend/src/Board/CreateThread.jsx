import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Button from "../components/Button"
import { apiPost } from "../Utils/api"
import TextInput from "../components/TextInput"
import useNotif from "../components/Notif"

export default function CreatePost({board, setRefreshKeyThread}) {
	const navigate = useNavigate();
	const notifHandle = useNotif()

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
		// console.log(`Title: ${title}  | "${content}"`)
		const res = await apiPost(`/board/${board.id}/post`,
				{body: JSON.stringify({
					'title': title,
					'content': content,
					'parent_id': null
				})
			})
		if (!res.ok) {
			notifHandle.pushError(res.status)
		} else {
			const json = res.json
			notifHandle.pushSuccess(`Post "${title} created"`)
			setTitle("")
			setContent("")
			// navigate(`/post/${json.id}`)
			setRefreshKeyThread()
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
