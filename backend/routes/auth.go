package routes

import (
	"backend/handlers"
	middlewares "backend/middleware"
	"net/http"
)

func InitRoutesAuth(mux *http.ServeMux) {
	mux.HandleFunc(
		"/register",
		middlewares.Method("POST", handlers.CreateUser),
	)

	mux.HandleFunc(
		"/login",
		middlewares.Method("POST", handlers.LoginUser),
	)

	mux.HandleFunc(
		"/send-reset-token",
		middlewares.Method("POST", handlers.SendVerificationCode),
	)

	mux.HandleFunc(
		"/reset-password",
		middlewares.Method("POST", handlers.ResetPassword),
	)

	//Exemplo com varios middlewares
	// mux.HandleFunc(
	// 	"/profile",
	// 	middlewares.AuthMiddleware(
	// 		middlewares.Method("GET", handlers.Profile),
	// 	),
	// )
	// mux.HandleFunc("/forgot-password", handlers.ForgotPassword)
	// mux.HandleFunc("/validate-reset-token/", handlers.ValidateResetToken)
}
