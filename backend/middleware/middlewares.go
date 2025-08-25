
package middlewares

import (
    "net/http"
)

func AdminMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        role, ok := r.Context().Value(contextKeyRole).(string)
        if !ok || role != "admin" {
            http.Error(w, "Acesso não autorizado", http.StatusForbidden)
            return
        }
        next.ServeHTTP(w, r)
    })
}