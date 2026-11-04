// main.go

package main

import (
	"backend/db"
	"backend/routes"
	"log"
	"net/http"

	"github.com/joho/godotenv"
)

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:4200")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, PATCH, DELETE")
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

	routes.InitRoutesAuth(mux)
	routes.InitRoutesCart(mux)
	routes.InitRoutesProducts(mux)
	routes.InitRoutesNewsletter(mux)
	routes.InitRoutesPromotions(mux)

	//   mux.HandleFunc("/api/test/images/", handlers.GetProductImagesByID)

	log.Println("🚀 Servidor rodando na porta 8080")

	handlerComCORS := enableCORS(mux)
	log.Fatal(http.ListenAndServe(":8080", handlerComCORS))
}
