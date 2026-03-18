package utils

import (
	"encoding/json"
	"net/http"
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
