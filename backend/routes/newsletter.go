package routes

import (
	"backend/handlers"
	"net/http"
)

func InitRoutesNewsletter(mux *http.ServeMux) {
	publicRoute(mux, http.MethodPost, "/api/newsletter/subscribe", handlers.SubscribeNewsletter)
}
