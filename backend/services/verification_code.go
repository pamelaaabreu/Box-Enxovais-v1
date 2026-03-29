package services

import (
	"crypto/rand"
	"encoding/hex"
	"time"
)

// Mapa para armazenar os códigos de verificação e suas datas de expiração
var VerificationCodes = make(map[string]VerificationData)

// Estrutura para armazenar o código de verificação e sua data de expiração
type VerificationData struct {
	Code      string
	ExpiresAt time.Time
}

// Função para gerar um código de verificação aleatório
func GenerateVerificationCode() (string, error) {
	bytes := make([]byte, 4) // Código de 4 bytes (8 caracteres hexadecimais)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// Função para armazenar o código de verificação e sua data de expiração
func StoreVerificationCode(email, code string) {
	VerificationCodes[email] = VerificationData{
		Code:      code,
		ExpiresAt: time.Now().Add(5 * time.Minute), // Código válido por 5 minutos
	}
}

// Função para validar o código de verificação
func ValidateVerificationCode(email, code string) bool {
	data, exists := VerificationCodes[email]
	if !exists {
		return false // Código não encontrado
	}

	// Verifica se o código é válido e se não expirou
	if data.Code == code && data.ExpiresAt.After(time.Now()) {
		return true
	}
	return false
}
