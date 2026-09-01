package middlewares

import (
	"backend/services"
	"net/http"
)

func Method(method string, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != method {
			w.Header().Set("Allow", method)
			services.Error(w, http.StatusMethodNotAllowed, "Método não permitido", nil, false)
			return
		}
		next(w, r)
	}
}
