package routes

import (
	"backend/handlers"
	middlewares "backend/middleware"
	"net/http"
)

func InitRoutesCart(mux *http.ServeMux) {
	for _, pattern := range []string{"GET /cart", "POST /cart/items", "PATCH /cart/items/{id}", "DELETE /cart/items/{id}", "DELETE /cart"} {
		mux.HandleFunc(pattern, middlewares.AuthMiddleware(handlers.CartHandler))
	}
}
