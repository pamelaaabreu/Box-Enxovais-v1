package routes

import (
	"backend/handlers"
	middlewares "backend/middleware"
	"net/http"
)

func InitRoutesAuth(mux *http.ServeMux) {
	publicPost(mux, "/register", handlers.CreateUser)
	publicPost(mux, "/login", handlers.LoginUser)
	publicPost(mux, "/send-reset-token", handlers.SendVerificationCode)
	publicPost(mux, "/reset-password", handlers.ResetPassword)
}

func publicPost(mux *http.ServeMux, path string, handler http.HandlerFunc) {
	mux.HandleFunc(
		path,
		middlewares.Method(http.MethodPost, handler),
	)
}
