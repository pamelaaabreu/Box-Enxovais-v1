package handlers

import (
	"backend/repositories"
	"backend/services"
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"net/mail"
	"strings"
	"unicode"

	"golang.org/x/crypto/bcrypt"
)

type ForgotPasswordRequest struct {
	Email string `json:"email"`
}

type ResetPasswordRequest struct {
	ResetToken  string `json:"resetToken"`
	NewPassword string `json:"newPassword"`
}

type ValidateVerificationCodeRequest struct {
	Email string `json:"email"`
	Code  string `json:"code"`
}

func SendVerificationCode(w http.ResponseWriter, r *http.Request) {
	var req ForgotPasswordRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil || req.Email == "" {
		services.Error(w, http.StatusBadRequest, "Email inválido", err, false)
		return
	}

	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	address, addressErr := mail.ParseAddress(req.Email)
	if addressErr != nil || address.Address != req.Email {
		services.Error(w, http.StatusBadRequest, "Email inválido", nil, false)
		return
	}
	email, err := repositories.GetUserEmail(req.Email)
	if errors.Is(err, sql.ErrNoRows) {
		services.Error(w, http.StatusNotFound, "Email não encontrado", nil, false)
		return
	}
	if err != nil {
		services.Error(w, http.StatusInternalServerError, "Erro ao buscar usuário", err, true)
		return
	}

	if email == "" {
		services.Error(w, http.StatusNotFound, "Email não encontrado", nil, false)
		return
	}

	err = services.SendPasswordResetCode(email, func(code string) error {
		return services.SendEmailWithTemplate(email, "Código de Verificação para Redefinição de Senha", code)
	})
	if errors.Is(err, services.ErrResetCodeCooldown) {
		w.Header().Set("Retry-After", "30")
		services.Error(w, http.StatusTooManyRequests, "Aguarde 30 segundos para reenviar", nil, false)
		return
	}
	if err != nil {
		services.Error(w, http.StatusInternalServerError, "Erro ao enviar email", nil, false)
		return
	}

	services.Success(w, http.StatusOK, "Código enviado com sucesso.", nil)
}

func ResetPassword(w http.ResponseWriter, r *http.Request) {
	var req ResetPasswordRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil || req.ResetToken == "" || !isStrongResetPassword(req.NewPassword) {
		services.Error(w, http.StatusBadRequest, "Requisição inválida", err, false)
		return
	}

	// Reject unauthorized requests before performing the expensive password hash.
	_, tokenStatus := services.CheckPasswordResetToken(req.ResetToken)
	if tokenStatus != services.PasswordResetTokenValid {
		resetTokenError(w, tokenStatus)
		return
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		services.Error(w, http.StatusInternalServerError, "Erro ao processar a senha", nil, false)
		return
	}
	tokenStatus, err = services.CompletePasswordReset(req.ResetToken, func(email string) error {
		return repositories.UpdatePasswordByEmail(string(hashedPassword), email)
	})
	if err != nil {
		services.Error(w, http.StatusInternalServerError, "Erro ao atualizar senha", nil, false)
		return
	}
	if tokenStatus != services.PasswordResetTokenValid {
		resetTokenError(w, tokenStatus)
		return
	}

	services.Success(w, http.StatusOK, "Senha atualizada com sucesso.", nil)
}

func ValidateVerificationCode(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "no-store")
	var req ValidateVerificationCodeRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Email == "" || req.Code == "" {
		services.Error(w, http.StatusBadRequest, "Código inválido", err, false)
		return
	}

	resetToken, status, err := services.ExchangeVerificationCode(req.Email, req.Code)
	if err != nil {
		services.Error(w, http.StatusInternalServerError, "Erro ao autorizar redefinição de senha", nil, false)
		return
	}
	switch status {
	case services.VerificationCodeExpired:
		services.Error(w, http.StatusGone, "Código expirado", nil, false)
		return
	case services.VerificationCodeInvalid:
		services.Error(w, http.StatusBadRequest, "Código inválido", nil, false)
		return
	}

	services.Success(w, http.StatusOK, "Código válido.", map[string]string{"resetToken": resetToken})
}

func isStrongResetPassword(password string) bool {
	if len([]rune(password)) < 8 || len(password) > 72 {
		return false
	}

	var hasUpper, hasLower, hasNumber bool
	for _, character := range password {
		hasUpper = hasUpper || unicode.IsUpper(character)
		hasLower = hasLower || unicode.IsLower(character)
		hasNumber = hasNumber || unicode.IsDigit(character)
	}

	hasSymbol := strings.ContainsAny(password, "?@#$%&")
	return hasUpper && hasLower && hasNumber && hasSymbol
}

func resetTokenError(w http.ResponseWriter, status services.PasswordResetTokenStatus) {
	if status == services.PasswordResetTokenExpired {
		services.Error(w, http.StatusGone, "Token de recuperação expirado", nil, false)
	} else {
		services.Error(w, http.StatusUnauthorized, "Token de recuperação inválido", nil, false)
	}
}
