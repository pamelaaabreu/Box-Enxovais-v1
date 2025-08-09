package handlers

import (
	"backend/db"
	"encoding/json"
	"net/http"
	"time"
)

func ValidateResetToken(w http.ResponseWriter, r *http.Request) {
	// Define o cabeçalho para JSON no início para todas as respostas.
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(map[string]string{"message": "Método não permitido"})
		return
	}

	token := r.URL.Path[len("/validate-reset-token/"):]
	if token == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"message": "Token não informado"})
		return
	}

	var expiresAt time.Time
	err := db.DB.QueryRow("SELECT expires_at FROM password_resets WHERE token = $1", token).Scan(&expiresAt)
	
	// Se o token não for encontrado (err != nil) ou tiver expirado, retorna um erro claro.
	if err != nil || time.Now().After(expiresAt) {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"message": "O link de redefinição de senha é inválido ou expirou."})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Token válido."})
}
