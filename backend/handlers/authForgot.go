package handlers

import (
	"backend/repositories"
	"backend/services"
	"encoding/json"
	"fmt"
	"net/http"

	"golang.org/x/crypto/bcrypt"
)

type ForgotPasswordRequest struct {
	Email string `json:"email"`
}

type ResetPasswordRequest struct {
	Email       string `json:"email"`
	Code        string `json:"code"`
	NewPassword string `json:"newPassword"`
}

func SendVerificationCode(w http.ResponseWriter, r *http.Request) {
	var req ForgotPasswordRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil || req.Email == "" {
		services.Error(w, http.StatusBadRequest, "Email inválido", err, false)
		return
	}

	email, err := repositories.GetUserEmail(req.Email)
	if err != nil {
		services.Error(w, http.StatusInternalServerError, "Erro ao buscar usuário", err, true)
		return
	}

	if email == "" {
		services.Error(w, http.StatusNotFound, "Email não encontrado", nil, false)
		return
	}

	// Gera um código de verificação
	code, err := services.GenerateVerificationCode()
	if err != nil {
		services.Error(w, http.StatusInternalServerError, "Erro ao gerar código de verificação", err, true)
		return
	}

	//Envia para o e-mail do usuário
	if err := services.SendEmailWithTemplate(
		email,
		"Código de Verificação para Redefinição de Senha",
		fmt.Sprintf("Seu código de verificação é: %s", code),
	); err != nil {
		services.Error(w, http.StatusInternalServerError, "Erro ao enviar email", err, true)
		return
	}

	// Armazena o código de verificação
	services.StoreVerificationCode(email, code)
	services.Success(w, http.StatusOK, "Código enviado com sucesso.", nil)
}

func ResetPassword(w http.ResponseWriter, r *http.Request) {
	var req ResetPasswordRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		services.Error(w, http.StatusBadRequest, "Requisição inválida", err, false)
		return
	}

	if !services.ValidateVerificationCode(req.Email, req.Code) {
		services.Error(w, http.StatusBadRequest, "Código de verificação inválido ou expirado", nil, false)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		services.Error(w, http.StatusInternalServerError, "Erro ao processar a senha", err, true)
		return
	}

	if err := repositories.UpdatePasswordByEmail(string(hashedPassword), req.Email); err != nil {
		services.Error(w, http.StatusInternalServerError, "Erro ao atualizar senha", err, true)
		return
	}

	services.Success(w, http.StatusOK, "Senha atualizada com sucesso.", nil)
}

