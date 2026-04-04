package utils

import (
	"encoding/json"
	"net/http"
	"regexp"
)

func JSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

type ApiResponse struct {
	Success	bool		`json:"success"`
	Message string		`json:"message"`
	Data	interface{}	`json:"data,omitempty"`
}

func WriteNewResponse(w http.ResponseWriter, success bool, message string, data_optionnal ...interface{}) {
	resp := ApiResponse{
		Success: success,
		Message: message,
	}
	if (len(data_optionnal) > 0) {
		resp.Data = data_optionnal[0]
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(resp)
}

func WritePublicResponse(w http.ResponseWriter, status int, success bool, message string, data_optional ...interface{}) {
	resp := ApiResponse{
		Success: success,
		Message: message,
	}
	if (len(data_optional) > 0) {
		resp.Data = data_optional[0]
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(resp)
}

func IsLegalName(s string) bool {

	res := regexp.MustCompile(`^[a-zA-Z0-9+_@".<>()[]{}-]+$`)
	return res.MatchString(s)
}
