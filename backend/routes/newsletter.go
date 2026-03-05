package routes

import (
	"backend/handlers"
	"net/http"
)

func InitRoutesNewsletter(mux *http.ServeMux) {
	mux.HandleFunc("/api/newsletter/subscribe", handlers.SubscribeNewsletter)
}
