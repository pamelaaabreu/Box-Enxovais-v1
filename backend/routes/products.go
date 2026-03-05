package routes

import (
	"backend/handlers"
	"net/http"
)

func InitRoutesProducts(mux *http.ServeMux) {
	mux.HandleFunc("/upload-image", handlers.UploadProductImage) // FUNÇÃO DO ADMIN
	mux.HandleFunc("/products", handlers.CreateProduct)          // FUNÇÃO DO ADMIN
	mux.HandleFunc("/products/", handlers.GetProduct)
}
