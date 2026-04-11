import { useState } from "react"
import Button from "../components/Button"
import useNotif from "../components/Notif"
import { buildAcceptedFormat, getFileFormatWithURL, getContentTypeData, getMagicNumber } from "../Utils/Data"
import { maxFileSize } from "../Utils/Data"
import uploadFile from "../Utils/Upload"

function MediaPreview({ file, previewUrl }) {
	if (!file) return null
	const format = getContentTypeData(file.type)

	switch (format) {
		case 'image':
			return (
				<div className="mt-3">
					<img src={previewUrl} alt="preview"
						className="max-w-[200px] max-h-[160px] rounded-xl object-cover
							border border-white/10 shadow-lg shadow-black/30" />
				</div>
			)
		case 'audio':
			return <div className="mt-3"><audio controls src={previewUrl} className="w-full max-w-xs" /></div>
		case 'video':
			return (
				<div className="mt-3">
					<video controls src={previewUrl}
						className="max-w-[200px] rounded-xl border border-white/10 shadow-lg shadow-black/30" />
				</div>
			)
		default:
			return null
	}
}

export default function CreatePost({ board, setRefreshKeyThread }) {
	const notifHandle = useNotif()

	const [title, setTitle] = useState("")
	const [content, setContent] = useState("")
	const [file, setFile] = useState(null)
	const [previewUrl, setPreviewUrl] = useState(null)
	const [isUploading, setIsUploading] = useState(false)
	const [uploadProgress, setUploadProgress] = useState(0)
	const [fileError, setFileError] = useState("")
	const [fileInfo, setFileInfo] = useState("")

	const handleFileError = async (selectedFile) => {
		setFileError("")
		if (selectedFile.size > maxFileSize) {
			setFileError("File is too large")
			throw new Error("File is too large")
		}
		const declaredType = getContentTypeData(selectedFile.type)
		if (declaredType === "unknown") { setFileError("Unsupported file type"); throw new Error() }
		if (getFileFormatWithURL(selectedFile.name) === "unknown") { setFileError("Unsupported extension"); throw new Error() }
		const magicType = await getMagicNumber(selectedFile)
		if (magicType === "unknown" || magicType !== declaredType) {
			setFileError("File content mismatch"); throw new Error()
		}
	}

	const handleFileChange = async (e) => {
		const selectedFile = e.target.files[0]
		if (!selectedFile) { setFileInfo(""); return }
		try {
			await handleFileError(selectedFile)
			setFileInfo(`${selectedFile.name} · ${(selectedFile.size / 1024).toFixed(1)} KB`)
			setFile(selectedFile)
			setPreviewUrl(URL.createObjectURL(selectedFile))
		} catch {
			setFile(null); setPreviewUrl(null)
		}
	}

	function handleEnter(event) {
		if (event.key === "Enter") {
			const form = event.target.form
			const index = [...form].indexOf(event.target)
			form[index + 1]?.focus()
			event.preventDefault()
		}
	}

	const buildFormData = () => {
		const formData = new FormData()
		formData.append('title', title)
		formData.append('content', content)
		formData.append('parent_id', '0')
		if (file) formData.append("upload", file)
		return formData
	}

	async function onSubmit() {
		if (title == "") {
			notifHandle.pushError("Title cannot be empty")
			return
		}
		setIsUploading(true)
		setUploadProgress(0)
		const res = await uploadFile(`/board/${board.id}/post`, buildFormData(), {
			onProgress: (percent) => setUploadProgress(percent),
		})
		setIsUploading(false)
		// console.log(res)
		// console.log(res.json)

		if (!res.ok) {
			notifHandle.pushError(res.status)
		} else {
			notifHandle.pushSuccess(`Thread "${title}" created`)
			setTitle("")
			setContent("")
			setFile(null)
			setPreviewUrl(null)
			setFileInfo("")
			setFileError("")
			setRefreshKeyThread()
		}
	}

	return (
		<form onSubmit={(e) => { e.preventDefault(); onSubmit() }}
			className="glass rounded-2xl p-5 space-y-4">

			<input
				type="text"
				value={title}
				onChange={e => setTitle(e.target.value)}
				onKeyDown={handleEnter}
				placeholder="Thread title…"
				className="font-semibold"
			/>

			<textarea
				value={content}
				onChange={e => setContent(e.target.value)}
				placeholder="What's on your mind?"
				rows={4}
				className="resize-none"
			/>

			{/* File upload */}
			<div className="flex items-center gap-3 flex-wrap">
				<label htmlFor="input-file"
					className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
						text-[#9898b8] glass hover:border-white/20 hover:text-[#eaeaf4]
						cursor-pointer transition-all duration-150 w-auto">
					Attach file
				</label>
				<input type="file" id="input-file" onChange={handleFileChange}
					accept={buildAcceptedFormat()} className="hidden" />
				{fileInfo && <span className="text-xs text-[#9898b8]">{fileInfo}</span>}
				{fileError && <span className="text-xs text-red-400">{fileError}</span>}
			</div>

			<MediaPreview file={file} previewUrl={previewUrl} />

			{/* Upload progress */}
			{(isUploading || uploadProgress > 0) && (
				<div className="space-y-1.5">
					<div className="flex justify-between text-xs text-[#9898b8]">
						<span>Uploading</span>
						<span>{uploadProgress}%</span>
					</div>
					<div className="w-full bg-white/8 rounded-full h-1.5 overflow-hidden">
						<div className="h-1.5 bg-g_seagreen rounded-full transition-all duration-200
							shadow-sm shadow-g_seagreen/50"
							style={{ width: `${uploadProgress}%` }} />
					</div>
				</div>
			)}

			<div className="flex justify-end">
				<Button type="submit" disabled={isUploading} className="shadow-md shadow-g_seagreen/20">
					{isUploading ? "Posting…" : "Post Thread"}
				</Button>
			</div>
		</form>
	)
}
