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

const mimeAvatar = {
	"jpg": "image/jpg",
	"jpeg": "image/jpeg",
	"png": "image/png"
}

const contentTypeData = {
	"image/jpeg": "image",
	"image/jpg": "image",
	"image/png": "image",
	"image/gif": "image",

	"audio/mpeg": "audio",
	"audio/mp4": "audio",

	"video/mp4": "video",
	"video/webm": "video",

	"application/pdf": "application",
	"text/plain": "text"
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
	var accepted = Object.entries(mime).map(([ext, type]) => `${type}`).join(", ");
	console.log("accepetd", accepted)
	return accepted;
}

export function buildAcceptedAvatarFormat() {
	var accepted = Object.entries(mimeAvatar).map(([ext, type]) => `${type}`).join(", ");
	console.log("accepetd", accepted)
	return accepted;
}

export function getContentTypeData(type) {
	if (contentTypeData[type])
		return contentTypeData[type]
	return "unknown"
}