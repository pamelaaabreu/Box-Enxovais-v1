package handlers

import (
	"backend/db"
	"backend/models"
	"encoding/json"
	"log"
	"net/http"
	"os" // pacote os para ler variáveis de ambiente
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

func LoginUser(w http.ResponseWriter, r *http.Request) {
	var creds models.Credentials
	w.Header().Set("Content-Type", "application/json")

	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Corpo da requisição inválido"})
		return
	}

	log.Printf("Tentando login com email: %s", creds.Email)

	var storedUser models.User
	query := `SELECT id, password FROM users WHERE email = $1`
	err = db.DB.QueryRow(query, creds.Email).Scan(&storedUser.ID, &storedUser.Password)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Email ou senha inválidos"})
		return

	}

	    log.Printf("DEBUG: Comparando senha recebida '[%s]' com hash do BD '[%s]'", creds.Password, storedUser.Password) // <-- ADICIONE ESTA LINHA

	err = bcrypt.CompareHashAndPassword([]byte(storedUser.Password), []byte(creds.Password))
	if err != nil {
		log.Printf("Usuário não encontrado: %v", err)
		// Esta era a linha que faltava corrigir
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Email ou senha inválidos"})
		return
	}

	var jwtKey = []byte(os.Getenv("JWT_SECRET"))

	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &models.Claims{
		UserID: storedUser.ID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Erro ao gerar token"})
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"token": tokenString,
	})
}
