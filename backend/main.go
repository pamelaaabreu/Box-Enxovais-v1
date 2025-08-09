package main

import (
	"backend/db"
	"backend/handlers"
	"github.com/joho/godotenv"
	"log"
	"net/http"
)

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:4200")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Erro ao carregar o arquivo .env")
	}

	db.InitDB()

	mux := http.NewServeMux()

	mux.HandleFunc("/register", handlers.CreateUser)
	mux.HandleFunc("/login", handlers.LoginUser)
	mux.HandleFunc("/forgot-password", handlers.ForgotPassword)
	mux.HandleFunc("/reset-password", handlers.ResetPassword)
	mux.HandleFunc("/validate-reset-token/", handlers.ValidateResetToken) // note a barra no final

	log.Println("🚀 Servidor rodando na porta 8080")

	handlerComCORS := enableCORS(mux)
	log.Fatal(http.ListenAndServe(":8080", handlerComCORS))
}
