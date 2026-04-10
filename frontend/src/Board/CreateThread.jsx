import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Button from "../components/Button"
import { apiPostFormData } from "../Utils/api"
import TextInput from "../components/TextInput"
import useNotif from "../components/Notif"
import getFileFormat from "../Utils/Data"
import { buildAcceptedFormat, getFileFormatWithURL, getContentTypeData, getMagicNumber } from "../Utils/Data"
import { maxFileSize } from "../Utils/Data"
import uploadFile from "../Utils/Upload"

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
			
		default:
			<></>
	}
}

export default function CreatePost({board, setRefreshKeyThread}) {
	const navigate = useNavigate();
	const notifHandle = useNotif()

	const [title, setTitle] = useState("")
	const [content, setContent] = useState("")

	const [file, setFile] = useState(null)
	const [previewUrl, setPreviewUrl] = useState(null)

	const infoElementError = document.getElementById("input-error");
	const infoElement = document.getElementById("input-preview");

	const handleFileError = async (selectedFile) => {
		if (selectedFile.size > maxFileSize) {
			infoElementError.textContent = "File is too big";
			infoElementError.style.color = "red";
			throw new Error("File is too big");
		}

		const declaredType = getContentTypeData(selectedFile.type);
		if (declaredType == "unknown") {
			infoElementError.textContent = "Wrong file type";
			infoElementError.style.color = "red";
			throw new Error("Wrong file type");
		}

		if (getFileFormatWithURL(selectedFile.name) == "unknown") {
			infoElementError.textContent = "Wrong file extension";
			infoElementError.style.color = "red";
			throw new Error("Wrong file extension");
		}

		const magicType = await getMagicNumber(selectedFile);
		if (magicType == "unknown" || magicType !== declaredType) {
			infoElementError.textContent = "Wrong file type magic number";
			infoElementError.style.color = "red";
			throw new Error("Wrong file type magic number");
		}
		else {
			infoElementError.textContent = "";
			infoElementError.style.color = "";
		}
	}

	const handleFileChange = async (e) => {
		const selectedFile = e.target.files[0];

		if (selectedFile) {
			try {
				await handleFileError(selectedFile)
			}
			catch (err) {
				setFile("")
				setPreviewUrl("")
				return;
			}

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

		// const res = await apiPostFormData(`/board/${board.id}/post`, { body: buildFormData() });
		const res = await uploadFile(`/board/${board.id}/post`, buildFormData());
		
		if (!res.ok) {
			notifHandle.pushError(res.status)
		} else {
			const json = res.json
			notifHandle.pushSuccess(`Post "${title} created"`)
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
				// accept={buildAcceptedFormat()}
				id="input-file"
				/>

			<MediaPreview file={file} previewUrl={previewUrl}/>

			<Button type = "submit">
				Confirm
			</Button>
		</form>
	)
} 
