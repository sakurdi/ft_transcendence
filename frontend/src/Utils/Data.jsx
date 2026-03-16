const extension = {
	"jpg": "image",
	"jpeg": "image",
	"png": "image",
	"gif": "image",

	"mp3": "audio",
	"mpeg": "audio",

	"mp4": "video",
	"webm": "video"
}


export default function getFileFormat(fileExtension) {
	if (extension[fileExtension])
		return extension[fileExtension]
	return "unknown"
}

export function buildAcceptedFormat() {
	var accepted = Object.entries(extension).map(([ext, type]) => `${type}/${ext}`).join(", ");
	console.log("accepetd", accepted)
	return accepted;
}