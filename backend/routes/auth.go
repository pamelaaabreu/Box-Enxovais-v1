package routes

import (
	"backend/handlers"
	"net/http"
)

func InitRoutesAuth(mux *http.ServeMux) {
	mux.HandleFunc("/register", handlers.CreateUser)
	mux.HandleFunc("/login", handlers.LoginUser)
	mux.HandleFunc("/forgot-password", handlers.ForgotPassword)
	mux.HandleFunc("/reset-password", handlers.ResetPassword)
	mux.HandleFunc("/validate-reset-token/", handlers.ValidateResetToken)
}
