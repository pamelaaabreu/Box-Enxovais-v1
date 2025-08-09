package handlers

import (
	"backend/db"
	"encoding/json"
	"net/http"
	"time"

	"golang.org/x/crypto/bcrypt"
)

func ResetPassword(w http.ResponseWriter, r *http.Request) {
	// Define o cabeçalho para JSON no início.
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(map[string]string{"message": "Método não permitido"})
		return
	}

	var req struct {
		Token       string `json:"token"`
		NewPassword string `json:"newPassword"`
	}

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil || req.Token == "" || req.NewPassword == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"message": "Dados inválidos. Por favor, preencha todos os campos."})
		return
	}

	// Busca token e valida
	var userID int
	var expiresAt time.Time
	err = db.DB.QueryRow("SELECT user_id, expires_at FROM password_resets WHERE token = $1", req.Token).Scan(&userID, &expiresAt)
	if err != nil || time.Now().After(expiresAt) {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"message": "O seu token é inválido ou expirou. Por favor, solicite um novo link."})
		return
	}

	// Gera hash da nova senha
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"message": "Erro interno ao processar a senha."})
		return
	}

	// Atualiza senha no banco
	_, err = db.DB.Exec("UPDATE users SET password = $1 WHERE id = $2", string(hashedPassword), userID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"message": "Erro ao atualizar a senha no banco de dados."})
		return
	}

	// Apaga o token para evitar reutilização
	_, _ = db.DB.Exec("DELETE FROM password_resets WHERE user_id = $1", userID)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Senha atualizada com sucesso."})
}
