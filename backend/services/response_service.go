package services

import (
	"encoding/json"
	"net/http"
)

type APIResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
	Data    any    `json:"data,omitempty"`
	Error   string `json:"error,omitempty"`
}

func Success(w http.ResponseWriter, status int, message string, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	resp := APIResponse{
		Success: true,
		Message: message,
		Data:    data,
	}

	json.NewEncoder(w).Encode(resp)
}

func Error(w http.ResponseWriter, status int, message string, err error, showError bool) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	resp := APIResponse{
		Success: false,
		Message: message,
	}

	if showError && err != nil {
		resp.Error = err.Error()
	}

	json.NewEncoder(w).Encode(resp)
}
