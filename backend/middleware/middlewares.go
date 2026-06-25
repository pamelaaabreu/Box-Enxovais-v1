package middlewares

import (
	"backend/services"
	"net/http"
	"strings"
)

const roleAdmin = "admin"

// Verifica se o usuário logado é ADMIN
func AdminMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		role, ok := GetRoleFromContext(r.Context())
		if !ok {
			services.Error(w, http.StatusUnauthorized, "Usuário não autenticado", nil, false)
			return
		}

		role = strings.ToLower(strings.TrimSpace(role))

		if role != roleAdmin {
			services.Error(w, http.StatusForbidden, "Acesso permitido apenas para administradores", nil, false)
			return
		}

		next.ServeHTTP(w, r)
	}
}