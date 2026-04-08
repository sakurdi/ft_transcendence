package utils

import (
	"errors"
	"strings"
	"github.com/google/uuid"
)

var extension = map[string]string {
	".jpg": "image",
	".jpeg": "image",
	".png": "image",
	".gif": "image",

	".mp3": "audio",
	".mpeg": "audio",

	".mp4": "video",
	".webm": "video",

	".pdf": "text",
	".txt": "text",
}

var contentTypeData = map[string]string {
	"image/jpg": ".jpg",
	"image/jpeg": ".jpeg",
	"image/png": ".png",
	"image/gif": ".gif",

	"audio/mp3": ".mp3",
	"audio/mpeg": ".mp3",

	"video/mp4": ".mp4",
	"video/webm": ".webm",

	"application/pdf": ".pdf",
	"text/plain": ".txt",
}

var avatarContentTypeData = map[string]string {
	"image/jpg": ".jpg",
	"image/jpeg": ".jpeg",
	"image/png": ".png",
}

func GetExtension(ext string) (string, error) {
	ext = strings.ToLower(ext)

	mediaExt, exist := extension[ext]
	if (!exist) {
		return "", errors.New("Extension not supported")
	}
	return mediaExt, nil
}

func GenerateFilename() (string) {
	newuuid := uuid.New()
	return newuuid.String()
}

func GetContentType(contentType string) (string, error) {
	
	mediaType, exist := contentTypeData[contentType]
	if (!exist) {
		return "", errors.New("Content Type not supported")
	}

	return mediaType, nil
}

func GetAvatarContentType(contentType string) (string, error) {
	avatarExt, exist := avatarContentTypeData[contentType]
	if (!exist) {
		return "", errors.New("Content Type not supported for avatar")
	}

	return avatarExt, nil
}