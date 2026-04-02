package auth

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
)

const (
	PrefixLength = 8
	SecretLength = 32
)

func GenerateRandomPrefix() string {
	b := make([]byte, PrefixLength/2)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func GenerateAPIKey() (string, string, string) {
	prefix := fmt.Sprintf("ftpub_%s", GenerateRandomPrefix())
	
	b := make([]byte, SecretLength/2)
	_, _ = rand.Read(b)
	secret := hex.EncodeToString(b)
	
	fullKey := fmt.Sprintf("%s_%s", prefix, secret)
	hash := HashAPIKey(fullKey)
	
	return prefix, fullKey, hash
}

func HashAPIKey(key string) string {
	hash := sha256.Sum256([]byte(key))
	return hex.EncodeToString(hash[:])
}
