const extension = {
	"jpg": "image",
	"jpeg": "image",
	"png": "image",
	"gif": "image",

	"mp3": "audio",
	"mpeg": "audio",

	"mp4": "video",
	"webm": "video",

	"pdf": "application",
	"txt": "text"
}

const mime = {
	"jpg": "image/jpg",
	"jpeg": "image/jpeg",
	"png": "image/png",
	"gif": "image/gif",

	"mp3": "audio/mpeg",
	"mpeg": "audio/mpeg",

	"mp4": "video/mp4",
	"webm": "video/webm",

	"pdf": "application/pdf",
	"txt": "text/plain"
}

export default function getFileFormat(fileExtension) {
	if (extension[fileExtension])
		return extension[fileExtension]
	return "unknown"
}

export function getFileFormatWithURL(fileURL) {
	const ext = fileURL.split('.').pop().toLowerCase()
	if (extension[ext])
		return extension[ext]
	return "unknown"
}

export function buildAcceptedFormat() {
	var accepted = Object.entries(extension).map(([ext, type]) => `${type}`).join(", ");
	console.log("accepetd", accepted)
	return accepted;
}