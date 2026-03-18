import { useState } from "react"
import useAuth from "../User/AuthProvider"
import { useNavigate } from "react-router-dom"
import Button from "../components/Button"
import { apiPost } from "../Utils/api"
import TextInput from "../components/TextInput"
import getFileFormat from "../Utils/Data"
import { buildAcceptedFormat, getFileFormatWithURL, getContentTypeData } from "../Utils/Data"

// type PostCreate struct {
// 	Title    *string `json:"title"`
// 	Content  string  `json:"content"`
// 	ParentID *int    `json:"parent_id"`
// }
function MediaPreview({file, previewUrl}) {
	if (!file)
		return

	var format = getContentTypeData(file.type);

	switch (format) {
		case 'image':
			return <p>
				<img src={previewUrl}
							alt="upload123"
							className="w-24 h-24 object-cover border-2 border-stone-200"/>
			</p>

		case 'audio':
			return <p>
				<audio controls src={previewUrl}/>
			</p>

		case 'video':
			return <p>
					<video controls src={previewUrl}/>
			</p>
		
		case 'application':
			return <p>
					<embed src={previewUrl} width="600px" height="300px"/>
			</p>

		case 'text':
			return <p>
					<a href src={previewUrl} download="file">Download</a> <a/>
			</p>
			
		default:
			<></>
	}
}

export default function CreatePost({board, setRefreshKeyThread}) {
	const navigate = useNavigate();


	const [title, setTitle] = useState("")
	const [content, setContent] = useState("")

	const [file, setFile] = useState(null)
	const [previewUrl, setPreviewUrl] = useState(null)

	const infoElementError = document.getElementById("input-error");
	const infoElement = document.getElementById("input-preview");

	const handleFileError = (selectedFile) => {
		if (selectedFile.size > (1 << 20)){
			infoElementError.textContent = "File is too big";
			infoElementError.style.color = "red";
			setFile("")
			setPreviewUrl("")
		}
		else if (getFileFormatWithURL(selectedFile.name) == "unknown") {
			infoElementError.textContent = "Wrong file extension";
			infoElementError.style.color = "red";
		}
		else {
			infoElementError.textContent = "";
			infoElementError.style.color = "";
		}
	}

	const handleFileChange = (e) => {
		const selectedFile = e.target.files[0];

		if (selectedFile) {
			handleFileError(selectedFile)

			infoElement.textContent = `Selected file: ${selectedFile.name}
									(${(selectedFile.size /1024).toFixed(2)})KB)`;
			setFile(selectedFile);
			setPreviewUrl(URL.createObjectURL(selectedFile));
		}
		else {
			infoElement.textContent = '';
		}
	}

	function handleEnter(event) {
		if (event.key == "Enter") {
			const form = event.target.form;
			const index = [...form].indexOf(event.target);
			form[index + 1].focus();
			event.preventDefault()
		}
	}

	const buildFormData = () => {
		const formData = new FormData();
		formData.append('title', title);
		formData.append('content', content);
		formData.append('parent_id', '0');
		if (file) {
			formData.append("upload", file);
		}
		return formData
	}

	async function onSubmit() {	
		console.log(`Title: ${title}  | "${content}"`)

		const res = await fetch(`/api/board/${board.id}/post`, {
					method: 'POST',
					body: buildFormData()
				})

		// const res = await apiPost(`/board/${board.id}/post`,
		// 		{body: JSON.stringify({
		// 			'title': title,
		// 			'content': content,
		// 			'parent_id': null
		// 		})
		// 	})
		if (!res.ok) {
			console.log(res.status)
		} else {
			const json = res.json
			console.log(res)
			setTitle("")
			setContent("")
			setFile("")
			setPreviewUrl("")
			infoElement.textContent = '';
			infoElementError.textContent = '';
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


			<p id="input-preview"></p>
			<p id="input-error"></p>
			<input type="file"
				onChange={handleFileChange}
				accept={buildAcceptedFormat()}
				id="input-file"
				/>

			<MediaPreview file={file} previewUrl={previewUrl}/>

			<Button type = "submit">
				Confirm
			</Button>
		</form>
	)
} 
