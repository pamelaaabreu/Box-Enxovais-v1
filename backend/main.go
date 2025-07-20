package main

import (
	"backend/db"
	"backend/handlers"
	"log"
	"net/http"
)

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Define os cabeçalhos de CORS
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:4200")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization") // Adicionei Authorization por boas práticas

		// Se a requisição for OPTIONS, responda com OK e pare aqui
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Prossiga para o próximo handler na cadeia
		next.ServeHTTP(w, r)
	})
}

func main() {
	db.InitDB()

	// 1. Crie um novo roteador (mux)
	mux := http.NewServeMux()

	// 2. Registre sua rota no novo roteador, envolvendo o handler com o middleware CORS
	mux.Handle("/users", enableCORS(http.HandlerFunc(handlers.CreateUser)))
	mux.Handle("/api/produto", enableCORS(http.HandlerFunc(handlers.GetProduto)))


	log.Println("🚀 Servidor rodando na porta 8080")
	// 3. Inicie o servidor usando o seu roteador personalizado
	log.Fatal(http.ListenAndServe(":8080", mux))
}