export const maxAvatarSize = 1 << 20; // 1MB
export const maxFileSize = 1 << 20; // 1MB

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

const mime = {
	"jpg": "image/jpg",
	"jpeg": "image/jpeg",
	"png": "image/png",
	"gif": "image/gif",

	"mp3": "audio/mpeg",
	"mpeg": "audio/mpeg",

	"mp4": "video/mp4",
	"webm": "video/webm"
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
	"video/webm": "video"
}

const avatarContentTypeData = {
	"image/jpeg": "image",
	"image/jpg": "image",
	"image/png": "image",
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

export function getFileFormatAvatar(fileURL) {
	const ext = fileURL.split('.').pop().toLowerCase()
	if (mimeAvatar[ext])
		return mimeAvatar[ext]
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

export function getAvatarContentTypeData(type) {
	if (avatarContentTypeData[type])
		return avatarContentTypeData[type]
	return "unknown"
}

export async function getMagicNumber(file) {
	if (!file)
	{
		console.log("file error")
		return "unknown"
	}

	try {
		const buffer = await file.slice(0, 64).arrayBuffer();
		const bytes = new Uint8Array(buffer);

		// jpeg
		if (
			bytes.length >= 3 &&
			bytes[0] === 0xFF &&
			bytes[1] === 0xD8 &&
			bytes[2] === 0xFF
		)
			return "image";

		//jpg
		if (
			bytes.length >= 4 &&
			bytes[0] === 0xFF &&
			bytes[1] === 0xD8 &&
			bytes[2] === 0xFF &&
			(bytes[3] === 0xE0 || bytes[3] === 0xE1 || bytes[3] === 0xE8)
		)
			return "image";

		// png
		if (
			bytes.length >= 8 &&
			bytes[0] === 0x89 &&
			bytes[1] === 0x50 &&
			bytes[2] === 0x4E &&
			bytes[3] === 0x47 &&
			bytes[4] === 0x0D &&
			bytes[5] === 0x0A &&
			bytes[6] === 0x1A &&
			bytes[7] === 0x0A
		)
			return "image";

		// gif
		if (
			bytes.length >= 4 &&
			bytes[0] === 0x47 &&
			bytes[1] === 0x49 &&
			bytes[2] === 0x46 &&
			bytes[3] === 0x38
		)
			return "image";
		
		// mp3 with ID3
		if (
			bytes.length >= 4 &&
			bytes[0] === 0x49 &&
			bytes[1] === 0x44 &&
			bytes[2] === 0x33
		)
			return "audio";

		// mp3 frame header
		if (
			bytes.length >= 2 &&
			bytes[0] === 0xFF &&
			(bytes[1] === 0xFB || bytes[1] === 0xF3 || bytes[1] === 0xF2)
		)
			return "audio"; 

		// mp4 family
		if (
			bytes.length >= 12 &&
			bytes[4] === 0x66 &&
			bytes[5] === 0x74 &&
			bytes[6] === 0x79 &&
			bytes[7] === 0x70
		)
			return "video";

		// webm/mkv
		if (
			bytes.length >= 4 &&
			bytes[0] === 0x1A &&
			bytes[1] === 0x45 &&
			bytes[2] === 0xDF &&
			bytes[3] === 0xA3
		)
			return "video";

		console.log("fin")
		return "unknown"
	}
	catch (err) {
		console.log("error:", err);
		return "unknown"
	}
}


export async function getMagicNumberAvatar(file) {
	if (!file)
	{
		console.log("file error")
		return "unknown"
	}

	try {
		const buffer = await file.slice(0, 64).arrayBuffer();
		const bytes = new Uint8Array(buffer);

		// jpeg
		if (
			bytes.length >= 3 &&
			bytes[0] === 0xFF &&
			bytes[1] === 0xD8 &&
			bytes[2] === 0xFF
		)
			return "image";

		//jpg
		if (
			bytes.length >= 4 &&
			bytes[0] === 0xFF &&
			bytes[1] === 0xD8 &&
			bytes[2] === 0xFF &&
			(bytes[3] === 0xE0 || bytes[3] === 0xE1 || bytes[3] === 0xE8)
		)
			return "image";

		// png
		if (
			bytes.length >= 8 &&
			bytes[0] === 0x89 &&
			bytes[1] === 0x50 &&
			bytes[2] === 0x4E &&
			bytes[3] === 0x47 &&
			bytes[4] === 0x0D &&
			bytes[5] === 0x0A &&
			bytes[6] === 0x1A &&
			bytes[7] === 0x0A
		)
			return "image";
		console.log("fin")
		return "unknown"
	}
	catch (err) {
		console.log("error:", err);
		return "unknown"
	}
}