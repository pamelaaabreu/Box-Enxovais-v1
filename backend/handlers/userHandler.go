package handlers

import (
	"backend/db"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"net/mail"
	"strings"
	"unicode/utf16"

	"github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

const minPasswordLength = 8

type createUserRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Terms    bool   `json:"terms"`
}

func CreateUser(w http.ResponseWriter, r *http.Request) {
	var user createUserRequest

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	err := decoder.Decode(&user)
	if err != nil {
		log.Printf("ERRO AO DECODIFICAR JSON DO CADASTRO: %v", err)
		writeJSONError(w, http.StatusBadRequest, "Corpo da requisição inválido")
		return
	}

	if decoder.Decode(&struct{}{}) != io.EOF {
		writeJSONError(w, http.StatusBadRequest, "Corpo da requisição inválido")
		return
	}

	normalizeCreateUserData(&user)

	if validationMessage := validateCreateUser(user); validationMessage != "" {
		writeJSONError(w, http.StatusBadRequest, validationMessage)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("ERRO AO GERAR HASH DA SENHA: %v", err)
		writeJSONError(w, http.StatusInternalServerError, "Erro interno ao criar usuário")
		return
	}

	query := `
		INSERT INTO users (
			full_name,
			email,
			password
		)
		VALUES ($1, $2, $3)
	`

	_, err = db.DB.Exec(
		query,
		user.Name,
		user.Email,
		string(hashedPassword),
	)

	if err != nil {
		handleCreateUserDatabaseError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, map[string]string{
		"message": "Usuário criado com sucesso",
	})
}

func normalizeCreateUserData(user *createUserRequest) {
	user.Name = strings.TrimSpace(user.Name)
	user.Email = strings.ToLower(strings.TrimSpace(user.Email))
}

func validateCreateUser(user createUserRequest) string {
	if user.Name == "" {
		return "Nome é obrigatório"
	}

	if !isValidFullName(user.Name) {
		return "Informe seu nome e sobrenome"
	}

	if user.Email == "" {
		return "Email é obrigatório"
	}

	if !isValidEmail(user.Email) {
		return "Email inválido"
	}

	if user.Password == "" {
		return "Senha é obrigatória"
	}

	if len(user.Password) > 72 {
		return "A senha deve ter no máximo 72 bytes"
	}

	if !isStrongPassword(user.Password) {
		return "A senha deve ter pelo menos 8 caracteres, incluindo letra maiúscula, minúscula, número e símbolo especial"
	}

	if !user.Terms {
		return "É necessário aceitar os termos de uso"
	}

	return ""
}

func handleCreateUserDatabaseError(w http.ResponseWriter, err error) {
	log.Printf("ERRO AO INSERIR USUÁRIO NO BANCO DE DADOS: %v", err)

	pqErr, ok := err.(*pq.Error)
	if !ok {
		writeJSONError(w, http.StatusInternalServerError, "Erro interno ao tentar criar usuário")
		return
	}

	if pqErr.Code == "23505" {
		switch pqErr.Constraint {
		case "users_email_key":
			writeJSONError(w, http.StatusConflict, "email_duplicado")
			return

		default:
			writeJSONError(w, http.StatusConflict, "dados_duplicados")
			return
		}
	}

	writeJSONError(w, http.StatusInternalServerError, "Erro interno ao tentar criar usuário")
}

func isValidEmail(email string) bool {
	address, err := mail.ParseAddress(email)
	return err == nil && address.Address == email
}

func isValidFullName(name string) bool {
	parts := strings.Fields(name)
	if len(parts) < 2 {
		return false
	}

	for _, part := range parts {
		if len([]rune(part)) < 2 {
			return false
		}
	}

	return true
}

func isStrongPassword(password string) bool {
	if len(utf16.Encode([]rune(password))) < minPasswordLength {
		return false
	}

	var hasUppercase, hasLowercase, hasNumber, hasSpecial bool
	for _, char := range password {
		switch {
		case char >= 'A' && char <= 'Z':
			hasUppercase = true
		case char >= 'a' && char <= 'z':
			hasLowercase = true
		case char >= '0' && char <= '9':
			hasNumber = true
		case strings.ContainsRune("?@#$%&", char):
			hasSpecial = true
		}
	}

	return hasUppercase && hasLowercase && hasNumber && hasSpecial
}
