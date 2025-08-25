// main.go

package main

import (
	"backend/db"
	"backend/handlers"
	"log"
	"net/http"

	"github.com/joho/godotenv"
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

	fs := http.FileServer(http.Dir("./uploads"))
	mux.Handle("/uploads/", http.StripPrefix("/uploads/", fs))

	mux.HandleFunc("/register", handlers.CreateUser)
	mux.HandleFunc("/login", handlers.LoginUser)
	mux.HandleFunc("/forgot-password", handlers.ForgotPassword)
	mux.HandleFunc("/reset-password", handlers.ResetPassword)
	mux.HandleFunc("/validate-reset-token/", handlers.ValidateResetToken)
	mux.HandleFunc("/upload-image", handlers.UploadProductImage) // FUNÇÃO DO ADMIN
	mux.HandleFunc("/products", handlers.CreateProduct) // FUNÇÃO DO ADMIN
	mux.HandleFunc("/products/", handlers.GetProduct) 
	mux.HandleFunc("/api/newsletter/subscribe", handlers.SubscribeNewsletter)
	mux.HandleFunc("/api/promotions/create", handlers.CreatePromotion) // FUNÇÃO DO ADMIN
	mux.HandleFunc("/api/promotions/add", handlers.AddProductToPromotion) // FUNÇÃO DO ADMIN
	mux.HandleFunc("/api/promotions/", handlers.GetPromotionalProducts) 
	//   mux.HandleFunc("/api/test/images/", handlers.GetProductImagesByID)

	log.Println("🚀 Servidor rodando na porta 8080")

	handlerComCORS := enableCORS(mux)
	log.Fatal(http.ListenAndServe(":8080", handlerComCORS))
}
