import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Button from "../components/Button"
import { apiPostFormData } from "../Utils/api"
import TextInput from "../components/TextInput"
import useNotif from "../components/Notif"
import { buildAcceptedFormat, getContentTypeData, getMagicNumber, getFileFormatWithURL, maxFileSize } from "../Utils/Data"
import uploadFile from "../Utils/Upload"

function MediaPreview({file, previewUrl}) {
	if (!file) return null

	var format = getContentTypeData(file.type);

	return (
		<div className="mt-4 p-2 bg-surface-50 rounded-xl border border-surface-200">
			{format === 'image' && <img src={previewUrl} alt="Preview" className="max-h-48 rounded-lg object-contain mx-auto"/>}
			{format === 'audio' && <audio controls src={previewUrl} className="w-full"/>}
			{format === 'video' && <video controls src={previewUrl} className="max-h-48 rounded-lg mx-auto"/>}
			<p className="text-[10px] text-surface-400 text-center mt-2 truncate">{file.name}</p>
		</div>
	)
}

export default function CreatePost({board, setRefreshKeyThread}) {
	const notifHandle = useNotif()

	const [title, setTitle] = useState("")
	const [content, setContent] = useState("")
	const [file, setFile] = useState(null)
	const [previewUrl, setPreviewUrl] = useState(null)
	const [isUploading, setIsUploading] = useState(false)
	const [uploadProgress, setUploadProgress] = useState(0)
	const [fileError, setFileError] = useState("")

	const validateFile = async (selectedFile) => {
		if (selectedFile.size > maxFileSize) throw new Error("File exceeds 1MB limit");
		const declaredType = getContentTypeData(selectedFile.type);
		if (declaredType === "unknown") throw new Error("Unsupported file type");
		if (getFileFormatWithURL(selectedFile.name) === "unknown") throw new Error("Invalid file extension");
		
		const magicType = await getMagicNumber(selectedFile);
		if (magicType === "unknown" || magicType !== declaredType) throw new Error("File content mismatch");
	}

	const handleFileChange = async (e) => {
		const selectedFile = e.target.files[0];
		setFileError("");
		if (selectedFile) {
			try {
				await validateFile(selectedFile)
				setFile(selectedFile);
				setPreviewUrl(URL.createObjectURL(selectedFile));
			} catch (err) {
				setFile(null);
				setPreviewUrl(null);
				setFileError(err.message);
			}
		}
	}

	const buildFormData = () => {
		const formData = new FormData();
		formData.append('title', title);
		formData.append('content', content);
		formData.append('parent_id', '0');
		if (file) formData.append("upload", file);
		return formData
	}

	async function onSubmit(e) {	
		if (e) e.preventDefault();
		if (!title.trim()) {
			notifHandle.pushError("Thread title is required");
			return;
		}

		setIsUploading(true);
		const res = await uploadFile(`/board/${board.id}/post`, buildFormData(), {
			onProgress: (percent) => setUploadProgress(percent),
		});
		setIsUploading(false);
		
		if (!res.ok) {
			notifHandle.pushError(res.status || "Failed to post");
		} else {
			notifHandle.pushSuccess("Thread published");
			setTitle("");
			setContent("");
			setFile(null);
			setPreviewUrl(null);
			setRefreshKeyThread();
		}
	}

	return (
		<form onSubmit={onSubmit} className="space-y-4">
			<div>
				<label className="block text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1 ml-1">Title</label>
				<TextInput 
					value={title}
					onChange={setTitle}
					placeholder="What's on your mind?"
				/>
			</div>

			<div>
				<label className="block text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1 ml-1">Content</label>
				<textarea 
					value={content}
					onChange={(e) => setContent(e.target.value)}
					placeholder="Expand on your title..."
					className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm text-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all min-h-[120px] resize-none"
				/>
			</div>

			<div className="relative group">
				<input 
					type="file"
					onChange={handleFileChange}
					accept={buildAcceptedFormat()}
					className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
				/>
				<div className="py-3 px-4 border-2 border-dashed border-surface-200 rounded-xl flex items-center justify-center gap-2 group-hover:border-brand-300 transition-colors">
					<span className="text-xl">📎</span>
					<span className="text-xs font-bold text-surface-400 uppercase tracking-widest">Attach Media</span>
				</div>
			</div>

			{fileError && <p className="text-[10px] text-red-500 font-bold ml-1">{fileError}</p>}
			<MediaPreview file={file} previewUrl={previewUrl}/>

			{isUploading && (
				<div className="space-y-2">
					<div className="flex justify-between text-[10px] font-bold text-surface-400 uppercase tracking-widest">
						<span>Uploading</span>
						<span>{uploadProgress}%</span>
					</div>
					<div className="w-full bg-surface-100 rounded-full h-1.5 overflow-hidden">
						<div className="h-full bg-brand-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
					</div>
				</div>
			)}

			<Button type="submit" className="w-full py-3" disabled={isUploading}>
				{isUploading ? "Publishing..." : "Post Thread"}
			</Button>
		</form>
	)
} 
