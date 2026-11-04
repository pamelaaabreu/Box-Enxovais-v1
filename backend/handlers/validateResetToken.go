package handlers

import (
	"backend/services"
	"encoding/json"
	"net/http"
)

type ValidateResetTokenRequest struct {
	ResetToken string `json:"resetToken"`
}

func ValidateResetToken(w http.ResponseWriter, r *http.Request) {
	var req ValidateResetTokenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.ResetToken == "" {
		services.Error(w, http.StatusBadRequest, "Token não informado", err, false)
		return
	}

	_, status := services.CheckPasswordResetToken(req.ResetToken)
	if status == services.PasswordResetTokenExpired {
		services.Error(w, http.StatusGone, "Token de recuperação expirado", nil, false)
		return
	}
	if status != services.PasswordResetTokenValid {
		services.Error(w, http.StatusUnauthorized, "Token de recuperação inválido", nil, false)
		return
	}

	services.Success(w, http.StatusOK, "Token válido.", nil)
}
