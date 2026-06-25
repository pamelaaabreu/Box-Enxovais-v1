package handlers

import (
	"backend/db"
	"backend/models"
	"database/sql"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

const (
	tokenDuration = 2 * time.Hour
	jwtIssuer    = "box-enxovais-api"
)

func LoginUser(w http.ResponseWriter, r *http.Request) {
	var creds models.Credentials

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	err := decoder.Decode(&creds)
	if err != nil {
		writeJSONError(w, http.StatusBadRequest, "Corpo da requisição inválido")
		return
	}

	email := strings.ToLower(strings.TrimSpace(creds.Email))
	password := creds.Password

	if email == "" || password == "" {
		writeJSONError(w, http.StatusBadRequest, "Email e senha são obrigatórios")
		return
	}

	var storedUser models.User

	query := `
		SELECT id, full_name, password, email, role
		FROM users
		WHERE LOWER(email) = $1
	`

	err = db.DB.QueryRow(query, email).Scan(
		&storedUser.ID,
		&storedUser.Name,
		&storedUser.Password,
		&storedUser.Email,
		&storedUser.Role,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			writeJSONError(w, http.StatusUnauthorized, "Email ou senha inválidos")
			return
		}

		log.Printf("ERRO AO BUSCAR USUÁRIO NO LOGIN: %v", err)
		writeJSONError(w, http.StatusInternalServerError, "Erro interno ao tentar fazer login")
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(storedUser.Password), []byte(password))
	if err != nil {
		writeJSONError(w, http.StatusUnauthorized, "Email ou senha inválidos")
		return
	}

	jwtSecret := strings.TrimSpace(os.Getenv("JWT_SECRET"))
	if jwtSecret == "" {
		log.Println("JWT_SECRET não configurado")
		writeJSONError(w, http.StatusInternalServerError, "Configuração de autenticação inválida")
		return
	}

	expirationTime := time.Now().Add(tokenDuration)

	claims := &models.Claims{
		UserID: storedUser.ID,
		Role:   storedUser.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   strconv.Itoa(storedUser.ID),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			Issuer:    jwtIssuer,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		log.Printf("ERRO AO GERAR TOKEN JWT: %v", err)
		writeJSONError(w, http.StatusInternalServerError, "Erro ao gerar token")
		return
	}

	response := models.LoginResponse{
		Token: tokenString,
		Name:  storedUser.Name,
		Email: storedUser.Email,
		Role:  storedUser.Role,
	}

	writeJSON(w, http.StatusOK, response)
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	err := json.NewEncoder(w).Encode(payload)
	if err != nil {
		log.Printf("ERRO AO ESCREVER RESPOSTA JSON: %v", err)
	}
}

func writeJSONError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, models.ErrorResponse{
		Error: message,
	})
}