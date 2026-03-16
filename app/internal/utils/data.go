package utils

import (
	"errors"
	"strings"
	"github.com/google/uuid"
	"fmt"
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