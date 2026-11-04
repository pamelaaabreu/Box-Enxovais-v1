package routes

import (
	"backend/handlers"
	"net/http"
)

func InitRoutesAuth(mux *http.ServeMux) {
	publicRoute(mux, http.MethodPost, "/register", handlers.CreateUser)
	publicRoute(mux, http.MethodPost, "/login", handlers.LoginUser)
	publicRoute(mux, http.MethodPost, "/send-reset-token", handlers.SendVerificationCode)
	publicRoute(mux, http.MethodPost, "/validate-reset-code", handlers.ValidateVerificationCode)
	publicRoute(mux, http.MethodPost, "/validate-reset-token", handlers.ValidateResetToken)
	publicRoute(mux, http.MethodPost, "/reset-password", handlers.ResetPassword)
}
